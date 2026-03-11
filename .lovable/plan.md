

## Plano: Dashboard de Faturamento com Filtros Avançados e UX Aprimorada

### O que será feito

Reorganizar a seção de faturamento no Dashboard principal com filtros avançados (Ano, Mês, GC, Segmento, Unidade, Setor), KPIs destacados e gráficos informativos focados em faturamento e comissão.

### Alterações em `src/pages/Dashboard.tsx`

#### 1. Filtros avançados (nova barra de filtros dedicada ao faturamento)
- **Ano** — select com anos disponíveis nos dados
- **Mês** — select com meses disponíveis
- **GC** — select (já existe, será movido para a barra)
- **Segmento** — select com segmentos do faturamento
- **Unidade** — select com unidades disponíveis
- **Setor** — select com setores disponíveis
- Botão "Limpar Filtros" para resetar tudo

#### 2. KPIs aprimorados (4 cards principais)
- Faturamento Total (filtrado)
- Comissão 0,3% (filtrado)
- Clientes Únicos (count distinct cliente_para)
- Ticket Médio (faturamento / clientes únicos)

#### 3. Gráficos (grid 2x2)
- **Faturamento Mensal** — BarChart com barras duplas: faturamento + comissão no mesmo gráfico
- **Faturamento por Segmento** — BarChart horizontal (top 10) em vez de PieChart para melhor legibilidade
- **Faturamento por GC** — BarChart horizontal mostrando performance por gestor comercial
- **Faturamento por Unidade** — PieChart (mantido)

#### 4. Tabela ranking (Top 10 Clientes por faturamento)
- Ranking visual com barras de progresso mostrando faturamento e comissão por cliente

### Detalhes técnicos

- Todos os filtros aplicados em cascata sobre `faturamento` usando `useMemo`
- Extrair listas de opções dos filtros a partir dos dados brutos (não filtrados) para evitar que filtros "desapareçam"
- Comissão calculada como `valor * 0.003` em todos os gráficos e KPIs
- Gráfico de faturamento mensal com duas séries: `valor` e `comissao` (eixo Y secundário ou mesmo eixo com escala)
- Manter a seção CRM (clientes, pipeline, etc.) acima; a seção de faturamento fica separada com título próprio e seus filtros independentes

Nenhuma alteração de banco de dados necessária.

