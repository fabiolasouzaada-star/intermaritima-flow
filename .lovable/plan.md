

## Plano: Adaptar Dashboard e Faturamento para nova planilha + Comissão 0,3%

### Contexto

A nova planilha **não tem** a coluna "Cliente - De" (apenas: Mês, Ano, Cliente - Para, GC, Segmento, Valor, Unidade, Setor). O sistema atual exige `cliente_de` como campo obrigatório no banco e na importação.

### Alterações

#### 1. Banco de dados — tornar `cliente_de` opcional
- Migration: `ALTER TABLE faturamento ALTER COLUMN cliente_de SET DEFAULT ''; ALTER TABLE faturamento ALTER COLUMN cliente_de DROP NOT NULL;`
- Ou manter NOT NULL com default vazio para não quebrar dados existentes.

#### 2. `src/hooks/useFaturamento.tsx`
- Tornar `cliente_de` opcional no type `FaturamentoInsert` (já é string, mas a validação no import exige).

#### 3. `src/pages/Faturamento.tsx`
- Ajustar mapeamento de colunas para aceitar planilha sem "Cliente - De" (usar string vazia como fallback).
- Mudar validação de `r.mes && r.ano && r.cliente_de` para `r.mes && r.ano`.
- Adicionar KPI de **Comissão (0,3%)**: novo card mostrando `totalFaturamento * 0.003`.
- Adicionar coluna "Comissão" na tabela de dados com valor calculado por linha.

#### 4. `src/pages/Dashboard.tsx`
- Adicionar KPI card de **Comissão Total (0,3%)** junto ao faturamento total.
- Adicionar filtro por GC (Gestor Comercial) para filtrar faturamento no dashboard.
- Adicionar gráfico de faturamento por Unidade ou Setor (aproveitando os dados disponíveis).

### Detalhes técnicos

- Comissão = `valor * 0.003` (calculado no frontend, sem coluna nova no banco).
- O campo `cliente_de` terá default `''` no banco para compatibilidade com planilhas antigas e novas.
- Gráfico de faturamento por mês no Dashboard já existe; será mantido e aprimorado com o card de comissão.

