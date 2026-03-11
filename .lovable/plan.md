

## Plano: Adicionar filtro por Cliente no Dashboard de Faturamento

### Situacao atual
O `FaturamentoDashboard` ja possui 6 filtros: Ano, Mes, GC, Segmento, Unidade e Setor. Falta o filtro por **Cliente** (`cliente_para`).

### Alteracoes em `src/components/dashboard/FaturamentoDashboard.tsx`

1. Adicionar estado `clienteFilter` com valor inicial `"todos"`
2. Incluir `cliente_para` na lista de `filterOptions` (extrair clientes unicos dos dados brutos)
3. Adicionar a condicao de filtro por cliente no `useMemo` de `filtrado`
4. Incluir `clienteFilter` no calculo de `hasActiveFilter` e no `clearFilters`
5. Adicionar um novo `Select` de Cliente na grid de filtros (mudar grid para 7 colunas ou reorganizar em 2 linhas: 4+3)
6. Como a lista de clientes pode ser longa, limitar a exibicao dos primeiros 50 clientes ordenados alfabeticamente no Select

### Layout dos filtros
Reorganizar a grid de `lg:grid-cols-6` para `lg:grid-cols-4` com 2 linhas (7 filtros total), ficando mais legivel:
- Linha 1: Ano, Mes, GC, Cliente
- Linha 2: Segmento, Unidade, Setor

Nenhuma alteracao de banco de dados necessaria.

