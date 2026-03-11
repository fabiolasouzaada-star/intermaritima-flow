

## Plano: Reestruturar Dashboard de Faturamento baseado na planilha

### Problema identificado

A planilha tem a coluna **"Cliente"** (unica), mas o import atual busca por "cliente - para" e "cliente - de". Isso pode causar falha no mapeamento. Alem disso, a tabela exibe apenas 100 registros, nao 100% dos dados.

### Colunas da planilha
`Mes | Ano | Cliente | GC | Segmento | Valor | Unidade | Setor`

### Alteracoes em `src/pages/Faturamento.tsx`

#### 1. Corrigir mapeamento do import
- Adicionar "cliente" como fallback no `findValue` para `cliente_para`, garantindo que a coluna "Cliente" da planilha seja mapeada corretamente.

#### 2. Adicionar novos KPIs
- **Ticket Medio** (faturamento total / clientes unicos)
- **Faturamento por Setor** (grafico adicional)

#### 3. Novo grafico: Receita por Setor
- BarChart horizontal mostrando a distribuicao entre Alfandegado, Transporte, etc.

#### 4. Melhorar Top Clientes
- Expandir de Top 10 para **Top 15** com mais detalhes (segmento principal do cliente).

#### 5. Tabela completa com paginacao
- Substituir o limite fixo de 100 registros por paginacao real (50 por pagina com botoes Anterior/Proximo), garantindo acesso a 100% dos dados importados.

#### 6. Adicionar resumo por Setor nos KPIs
- Card mostrando a quantidade de setores unicos.

#### 7. Melhorar filtro de clientes
- Remover limite de 50/100 clientes no dropdown - usar todos os clientes disponiveis com scroll.

### Arquivos alterados
- `src/pages/Faturamento.tsx` (unico arquivo)

Nenhuma alteracao de banco de dados necessaria.

