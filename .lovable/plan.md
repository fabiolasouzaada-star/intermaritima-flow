

## Plano: Arquivamento de tarefas concluídas + Dashboard de status

### O que será feito

1. **Botão "Arquivar Concluídas"** na página de Tarefas que muda o status das tarefas concluídas para `"cancelada"` (reaproveitando o status existente como "arquivada") — ou, melhor, adicionar um filtro toggle para ocultar/mostrar concluídas, sem alterar dados.

2. **Toggle "Mostrar Arquivadas"** — por padrão, tarefas com status `concluida` e `cancelada` ficam ocultas no Kanban e na lista. Um switch permite visualizá-las quando necessário.

3. **Dashboard de status** no topo da página com métricas visuais:
   - Total de tarefas ativas
   - Pendentes / Em andamento / Concluídas / Canceladas (contagens + percentuais)
   - Barra de progresso geral (% concluídas do total)
   - Gráfico de pizza pequeno com distribuição por status

### Detalhes técnicos

**Sem alterações no banco de dados.** Tudo será feito no frontend usando os status existentes (`pendente`, `em_andamento`, `concluida`, `cancelada`).

#### Arquivo: `src/pages/Tarefas.tsx`
- Adicionar estado `mostrarConcluidas` (default: `false`)
- No filtro `tarefasFiltradas`, quando `mostrarConcluidas === false`, excluir tarefas com status `concluida` e `cancelada`
- Substituir os 3 cards de métricas atuais (Hoje/Atrasadas/Semana) por uma seção dashboard mais completa:
  - 4 cards: Pendentes, Em Andamento, Concluídas, Atrasadas
  - Barra de progresso mostrando % de conclusão
  - PieChart (Recharts) com distribuição por status
- Adicionar Switch "Mostrar concluídas" na barra de filtros
- Manter cards de Hoje/Atrasadas/Semana como indicadores menores abaixo

#### Arquivo: `src/components/tarefas/KanbanBoard.tsx`
- Receber prop `mostrarConcluidas` para controlar se colunas "Concluída" e "Cancelada" são exibidas
- Quando ocultas, essas colunas não aparecem no grid

