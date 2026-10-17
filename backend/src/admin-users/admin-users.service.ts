import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../dashboard/supabase.service';
import { AdminAuditService } from './admin-audit.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InitialPasswordDto } from './dto/initial-password.dto';
import { ListUsersQuery } from './dto/list-users.query';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  unidade_saude: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface Actor {
  userId: string;
  email?: string;
}

const COLUNAS = 'id,nome,email,role,unidade_saude,ativo,criado_em';
const MAX_PAGE_SIZE = 100;
// ~100 anos: o Supabase não tem "bloqueio permanente", então usamos uma duração muito longa
const BAN_PERMANENTE = '876000h';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger('AdminUsers');

  constructor(
    private readonly supabase: SupabaseService,
    private readonly audit: AdminAuditService,
  ) {}

  async listar(q: ListUsersQuery) {
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(q.pageSize) || 20));
    const inicio = (page - 1) * pageSize;

    let query = this.supabase.client
      .from('perfis')
      .select(COLUNAS, { count: 'exact' })
      .order('criado_em', { ascending: false })
      .range(inicio, inicio + pageSize - 1);

    // o texto entra num filtro do PostgREST: tira o que mudaria a sintaxe ou os curingas do ilike
    const busca = (q.busca ?? '').replace(/[,()%_\\*]/g, '').trim();
    if (busca) query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`);
    if (q.role) query = query.eq('role', q.role);

    const { data, count, error } = await query;
    if (error) throw new InternalServerErrorException('Não foi possível listar os usuários');

    return { itens: (data ?? []) as AdminUser[], total: count ?? 0, page, pageSize };
  }

  async criar(dto: CreateUserDto, actor: Actor): Promise<AdminUser> {
    const email = dto.email.trim().toLowerCase();

    const { data: criado, error: erroAuth } = await this.supabase.client.auth.admin.createUser({
      email,
      password: dto.senha,
      email_confirm: true,
      app_metadata: { role: dto.role },
      user_metadata: { nome: dto.nome },
    });

    if (erroAuth || !criado?.user) {
      if (/already|registered|exists/i.test(erroAuth?.message ?? '')) {
        throw new ConflictException('Já existe um usuário com este e-mail');
      }
      throw new InternalServerErrorException('Não foi possível criar o usuário');
    }

    const id = criado.user.id;

    // o trigger do banco já criou o perfil; aqui completa nome, unidade e a troca obrigatória de senha
    const { data: perfil, error: erroPerfil } = await this.supabase.client
      .from('perfis')
      .update({
        nome: dto.nome,
        // o trigger do banco pode ter criado o perfil antes do app_metadata chegar; sem isto a conta fica como VISUALIZADOR_UNIDADE
        role: dto.role,
        unidade_saude: dto.unidade_saude ?? null,
        deve_trocar_senha: true,
      })
      .eq('id', id)
      .select(COLUNAS)
      .single();

    if (erroPerfil || !perfil) {
      // sem perfil completo a conta não pode existir: desfaz a criação no Auth
      const { error: erroRollback } = await this.supabase.client.auth.admin.deleteUser(id);
      if (erroRollback) {
        this.logger.error(`conta órfã no Auth (${id}, ${email}): rollback falhou: ${erroRollback.message}`);
      }
      throw new InternalServerErrorException('Não foi possível concluir o cadastro do usuário');
    }

    await this.audit.registrar({
      adminId: actor.userId,
      adminEmail: actor.email,
      alvoId: id,
      alvoEmail: email,
      operacao: 'CRIAR_USUARIO',
      detalhes: { role: dto.role, unidade_saude: dto.unidade_saude ?? null },
    });

    return perfil as AdminUser;
  }

  async redefinirSenha(id: string, dto: ResetPasswordDto, actor: Actor): Promise<void> {
    const alvo = await this.carregarPerfil(id);

    // a flag vem antes: se a troca no Auth falhar, o usuário só é obrigado a trocar a senha de novo
    await this.atualizarPerfil(id, { deve_trocar_senha: true });
    await this.atualizarAuth(id, { password: dto.senha });

    await this.audit.registrar({
      adminId: actor.userId,
      adminEmail: actor.email,
      alvoId: id,
      alvoEmail: alvo.email,
      operacao: 'REDEFINIR_SENHA',
    });
  }

  async alterarPapel(id: string, dto: ChangeRoleDto, actor: Actor): Promise<AdminUser> {
    const alvo = await this.carregarPerfil(id);

    if (id === actor.userId && dto.role !== alvo.role) {
      throw new BadRequestException('Você não pode alterar o seu próprio papel');
    }

    const unidade = dto.unidade_saude ?? alvo.unidade_saude ?? null;
    // o trigger do banco copia role e unidade_saude para o JWT
    const atualizado = await this.atualizarPerfil(id, { role: dto.role, unidade_saude: unidade });

    await this.audit.registrar({
      adminId: actor.userId,
      adminEmail: actor.email,
      alvoId: id,
      alvoEmail: alvo.email,
      operacao: 'ALTERAR_PAPEL',
      detalhes: {
        de: alvo.role,
        para: dto.role,
        unidade_de: alvo.unidade_saude ?? null,
        unidade_para: unidade,
      },
    });

    return atualizado ?? { ...alvo, role: dto.role, unidade_saude: unidade };
  }

  async alterarStatus(id: string, dto: ChangeStatusDto, actor: Actor): Promise<AdminUser> {
    const alvo = await this.carregarPerfil(id);

    if (id === actor.userId && !dto.ativo) {
      throw new BadRequestException('Você não pode bloquear a sua própria conta');
    }

    await this.atualizarAuth(id, { ban_duration: dto.ativo ? 'none' : BAN_PERMANENTE });
    const atualizado = await this.atualizarPerfil(id, { ativo: dto.ativo });

    await this.audit.registrar({
      adminId: actor.userId,
      adminEmail: actor.email,
      alvoId: id,
      alvoEmail: alvo.email,
      operacao: 'ALTERAR_STATUS',
      detalhes: { ativo_de: alvo.ativo, ativo_para: dto.ativo },
    });

    return atualizado ?? { ...alvo, ativo: dto.ativo };
  }

  // exclusão definitiva: o perfil some junto (cascade), mas os logs não têm FK e continuam no banco
  async excluir(id: string, actor: Actor): Promise<void> {
    const alvo = await this.carregarPerfil(id);

    if (id === actor.userId) {
      throw new BadRequestException('Você não pode excluir a sua própria conta');
    }

    // a auditoria vem antes e guarda quem era a pessoa, porque depois o perfil não existe mais.
    // se ela falhar, a conta não é apagada
    await this.audit.registrar({
      adminId: actor.userId,
      adminEmail: actor.email,
      alvoId: id,
      alvoEmail: alvo.email,
      operacao: 'EXCLUIR_USUARIO',
      detalhes: { nome: alvo.nome, role: alvo.role, unidade_saude: alvo.unidade_saude ?? null },
    });

    const { error } = await this.supabase.client.auth.admin.deleteUser(id);
    if (error) {
      this.logger.error(`exclusão de ${id} (${alvo.email}) falhou depois de auditada: ${error.message}`);
      throw new InternalServerErrorException('Não foi possível excluir a conta');
    }
  }

  // primeiro acesso: o próprio usuário define a senha, mas só enquanto a flag estiver ligada
  async trocarSenhaInicial(dto: InitialPasswordDto, actor: Actor): Promise<void> {
    const perfil = await this.carregarPerfil(actor.userId);

    if (!perfil.deve_trocar_senha) {
      throw new ForbiddenException('A troca de senha só pode ser feita pelo administrador');
    }

    await this.atualizarAuth(actor.userId, { password: dto.senha });
    await this.atualizarPerfil(actor.userId, { deve_trocar_senha: false });

    await this.audit.registrar({
      adminId: actor.userId,
      adminEmail: actor.email,
      alvoId: actor.userId,
      alvoEmail: perfil.email,
      operacao: 'TROCA_SENHA_INICIAL',
    });
  }

  private async carregarPerfil(id: string): Promise<AdminUser & { deve_trocar_senha: boolean }> {
    const { data, error } = await this.supabase.client
      .from('perfis')
      .select(`${COLUNAS},deve_trocar_senha`)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new InternalServerErrorException('Não foi possível consultar o usuário');
    if (!data) throw new NotFoundException('Usuário não encontrado');
    return data as AdminUser & { deve_trocar_senha: boolean };
  }

  private async atualizarAuth(id: string, atributos: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase.client.auth.admin.updateUserById(id, atributos);
    if (error) throw new InternalServerErrorException('Não foi possível atualizar a conta no Auth');
  }

  private async atualizarPerfil(
    id: string,
    campos: Record<string, unknown>,
  ): Promise<AdminUser | null> {
    const { data, error } = await this.supabase.client
      .from('perfis')
      .update(campos)
      .eq('id', id)
      .select(COLUNAS)
      .single();

    if (error) throw new InternalServerErrorException('Não foi possível atualizar o perfil');
    return (data as AdminUser) ?? null;
  }
}
