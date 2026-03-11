

## Plano: Remover modulos Contratos, Qualidade de Dados, Relatorios, Dashboard FS e Carteira FS

### Alteracoes

#### 1. `src/App.tsx`
- Remover imports: `Contratos`, `Relatorios`, `QualidadeDados`, `CarteiraFS`, `DashboardFS`
- Remover as 5 rotas correspondentes: `/contratos`, `/relatorios`, `/qualidade-dados`, `/carteira-fs`, `/dashboard-fs`

#### 2. `src/components/CRMSidebar.tsx`
- Remover do `menuItems`: Contratos, Qualidade de Dados, Relatorios
- Remover do `menuItemsFS`: Dashboard FS, Carteira FS
- Remover icons nao mais utilizados: `FileText`, `BarChart3`, `ShieldCheck`

#### 3. Arquivos de pagina a deletar
- `src/pages/Contratos.tsx`
- `src/pages/Relatorios.tsx`
- `src/pages/QualidadeDados.tsx`
- `src/pages/CarteiraFS.tsx`
- `src/pages/DashboardFS.tsx`

#### 4. Se `menuItemsFS` ficar com apenas 1 item (Pipeline Retomada)
- Manter o grupo "Carteira FS" no sidebar com o item restante

Nenhuma alteracao de banco de dados.

