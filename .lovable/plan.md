

## Plano: Graficos de Faturamento Acumulado Mensal e Anual

### O que sera feito

Adicionar dois novos graficos de linha (AreaChart) na pagina de Faturamento que mostram o **faturamento acumulado** — um com visao **mensal** (acumulado mes a mes dentro do periodo filtrado) e outro com visao **anual** (total por ano). Ambos reagem dinamicamente aos filtros ativos.

### Alteracoes em `src/pages/Faturamento.tsx`

#### 1. Novo import
- Adicionar `AreaChart`, `Area`, `LineChart`, `Line` do Recharts.

#### 2. Dois novos `useMemo` baseados em `dadosFiltrados`

**Acumulado Mensal:**
- Agrupar por `mes/ano`, ordenar cronologicamente, calcular soma acumulada progressiva.
- Resultado: `[{ name: "Jan/2024", valor: 100k, acumulado: 100k }, { name: "Fev/2024", valor: 80k, acumulado: 180k }, ...]`

**Acumulado Anual:**
- Agrupar por `ano`, ordenar, calcular soma acumulada progressiva.
- Resultado: `[{ name: "2023", valor: 500k, acumulado: 500k }, { name: "2024", valor: 600k, acumulado: 1.1M }, ...]`

#### 3. Nova linha de graficos (inserida entre os charts existentes e o Top 10 Clientes)

Grid `md:grid-cols-2` com:
- **Faturamento Acumulado Mensal** — AreaChart com area preenchida mostrando a curva acumulada + barras do valor mensal
- **Faturamento Acumulado Anual** — AreaChart com area preenchida mostrando a curva acumulada por ano + barras do valor anual

Ambos com Tooltip formatado em BRL e responsivos.

Nenhuma alteracao de banco de dados necessaria.

