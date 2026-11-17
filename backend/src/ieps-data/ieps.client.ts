import { urlCsvIeps } from './indicadores-ieps';

// Baixa o CSV do IEPS (cerca de 15 MB e 15 s para os indicadores usados aqui).
export class IepsClient {
  constructor(private readonly timeoutMs = 180_000) {}

  async baixarCsv(url = urlCsvIeps()): Promise<string> {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    if (!resposta.ok) throw new Error(`IEPS respondeu HTTP ${resposta.status} ao baixar o CSV.`);
    const tipo = resposta.headers.get('content-type') ?? '';
    if (!tipo.includes('text/csv')) throw new Error(`IEPS não devolveu CSV (Content-Type: ${tipo || 'vazio'}).`);
    return resposta.text();
  }
}
