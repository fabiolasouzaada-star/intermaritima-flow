

## Plano: Metadata da base importada + Redesenho do grafico de GC

### Problema
1. Nao ha visibilidade sobre a base importada (total de registros, data da ultima importacao).
2. O grafico de GC e um BarChart horizontal que nao funciona bem quando ha apenas 1 GC — fica vazio/sem sentido visual.

### Alteracoes em `src/pages/Faturamento.tsx`

#### 1. Card de resumo da base importada
Adicionar um card informativo logo apos o header (antes dos filtros) mostrando:
- **Total de registros na base** (usando `faturamento?.length`)
- **Data da ultima importacao** (derivada do `created_at` mais recente no array `faturamento`)
- **Periodo coberto** (menor e maior ano/mes encontrados)
- **GCs na base** (quantidade de GCs unicos)

Isso da ao usuario uma visao clara do que esta carregado.

#### 2. Redesenho do grafico de GC
Substituir o BarChart horizontal por um **PieChart** (igual ao de Segmento/Unidade), que funciona visualmente mesmo com 1 unico GC — mostra 100% do valor atribuido aquele GC. Quando houver multiplos GCs, o pie distribui proporcionalmente.

### Detalhes tecnicos
- Usar `Math.max(...faturamento.map(f => new Date(f.created_at).getTime()))` para data da ultima importacao
- Formatar com `date-fns` ou `toLocaleDateString("pt-BR")`
- Reutilizar o mesmo padrao de PieChart ja usado para Segmento e Unidade
- Nenhuma alteracao de banco de dados

### Arquivo alterado
- `src/pages/Faturamento.tsx`

