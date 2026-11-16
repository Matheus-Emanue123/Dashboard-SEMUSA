// Decodificador do formato DSR que a API pública do Power BI devolve em /querydata.
//
// Cada linha vem em `C` só com os valores que mudaram. Duas máscaras de bits dizem o resto:
//   R  -> a coluna i repete o valor da linha anterior
//   Ø  -> a coluna i é nula
// Colunas de texto costumam vir como índice num dicionário (`ValueDicts`), indicado por `DN`.
// A primeira linha traz `S`, o esquema das colunas.

export type ValorDsr = string | number | boolean | null;

interface ColunaDsr {
  N: string;
  DN?: string;
}

interface LinhaDsr {
  S?: ColunaDsr[];
  C?: ValorDsr[];
  R?: number;
  'Ø'?: number;
}

export interface DataSetDsr {
  PH?: { DM0?: LinhaDsr[] }[];
  ValueDicts?: Record<string, ValorDsr[]>;
}

export function decodificarDsr(ds: DataSetDsr): ValorDsr[][] {
  const linhas = ds.PH?.[0]?.DM0 ?? [];
  const dicionarios = ds.ValueDicts ?? {};
  let esquema: ColunaDsr[] | null = null;
  let anterior: ValorDsr[] = [];
  const resultado: ValorDsr[][] = [];

  for (const linha of linhas) {
    if (linha.S) esquema = linha.S;
    if (!esquema) throw new Error('Resposta DSR sem esquema de colunas.');
    const repetidas = linha.R ?? 0;
    const nulas = linha['Ø'] ?? 0;
    const valores = linha.C ?? [];
    let proximo = 0;
    const atual: ValorDsr[] = esquema.map((coluna, i) => {
      if ((nulas >> i) & 1) return null;
      if ((repetidas >> i) & 1) return anterior[i] ?? null;
      if (proximo >= valores.length) throw new Error('Resposta DSR com menos valores que o esquema.');
      const valor = valores[proximo++];
      if (coluna.DN && typeof valor === 'number') return dicionarios[coluna.DN]?.[valor] ?? null;
      return valor;
    });
    anterior = atual;
    resultado.push(atual);
  }
  return resultado;
}
