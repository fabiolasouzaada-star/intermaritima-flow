

## Plano: Corrigir importação de planilha de faturamento

### Problema

A importação falha com "Nenhum registro válido encontrado" porque o mapeamento de colunas usa nomes exatos (ex: `row["Mês"]`) que podem não corresponder aos headers reais da planilha (espaços extras, encoding diferente de caracteres acentuados, etc.).

### Solução

Reescrever o mapeamento de colunas para ser robusto: normalizar todas as chaves do objeto `row` (trim, lowercase, remover acentos) e fazer matching por chave normalizada em vez de nomes exatos.

### Alterações

#### `src/pages/Faturamento.tsx` — handleFileUpload

- Adicionar função `normalizeKey(str)` que faz `.trim().toLowerCase()` e remove acentos (usando `normalize('NFD').replace(...)`)
- Para cada `row` do JSON, criar um mapa normalizado das chaves para os valores
- Buscar valores usando chaves normalizadas: `"mes"`, `"ano"`, `"cliente - para"`, `"gc"`, `"segmento"`, `"valor"`, `"unidade"`, `"setor"`, `"cliente - de"`
- Adicionar log de debug (`console.log`) dos headers encontrados para facilitar troubleshooting futuro
- Manter validação `r.mes && r.ano` mas com matching robusto

Código da função auxiliar:
```typescript
const normalizeKey = (s: string) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const findValue = (row: Record<string, any>, ...keys: string[]) => {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
  );
  for (const key of keys) {
    if (normalized[key] !== undefined) return normalized[key];
  }
  return undefined;
};
```

Nenhuma alteração de banco de dados necessária.

