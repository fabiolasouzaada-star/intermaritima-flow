## Problema confirmado

Verifiquei no banco de dados: as oportunidades **estão sendo criadas corretamente** com status `qualificacao` (que é exibido como "Prospecção" no Kanban). Exemplo encontrado: `Oportunidade Pré-Alerta - SEM NAVIO` criada hoje.

O problema é puramente de **cache do React Query no front-end**:

- Em `src/components/pre-alerta/NavioDetailDialog.tsx`, a função `handleCreateOportunidade` (linhas 181-206) insere a oportunidade direto via `supabase.from("oportunidades").insert(...)` e em seguida navega para `/pipeline`.
- **Não há `queryClient.invalidateQueries({ queryKey: ["oportunidades"] })`** após a criação.
- Como o `App.tsx` configura `staleTime` global, o Pipeline mostra a lista em cache (sem a nova oportunidade) até o cache expirar ou a página recarregar.
- O mesmo problema afeta `handleCreateCliente` (cache `["clientes"]`) e `handleCreateTarefa` (cache `["tarefas"]`).

## Solução

### Alteração em `src/components/pre-alerta/NavioDetailDialog.tsx`

1. Importar `useQueryClient` de `@tanstack/react-query`.
2. Obter a instância: `const queryClient = useQueryClient();`
3. Após cada `insert` bem-sucedido, invalidar as queries relevantes:
   - `handleCreateCliente` → invalidar `["clientes"]` e `["pre-alerta-itens"]`
   - `handleCreateOportunidade` → invalidar `["oportunidades"]`
   - `handleCreateTarefa` → invalidar `["tarefas"]`

Exemplo:
```tsx
await queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
toast.success("Oportunidade criada com sucesso!");
navigate("/pipeline");
```

Nenhuma alteração de banco de dados é necessária — os dados já estão sendo salvos corretamente.

## Arquivo alterado
- `src/components/pre-alerta/NavioDetailDialog.tsx`
