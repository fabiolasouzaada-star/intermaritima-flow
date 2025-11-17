import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Phone, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockClientes = [
  {
    id: 1,
    empresa: "ABC Importadora Ltda",
    cnpj: "12.345.678/0001-90",
    contato: "João Silva",
    telefone: "(11) 98765-4321",
    email: "joao@abcimport.com.br",
    servico: "Importação",
    status: "ativo",
    potencial: "Alto",
    segmento: "Indústria",
  },
  {
    id: 2,
    empresa: "XYZ Exportadora S/A",
    cnpj: "98.765.432/0001-10",
    contato: "Maria Santos",
    telefone: "(21) 91234-5678",
    email: "maria@xyzexport.com.br",
    servico: "Exportação",
    status: "ativo",
    potencial: "Alto",
    segmento: "Agronegócio",
  },
  {
    id: 3,
    empresa: "Logística Moderna",
    cnpj: "11.222.333/0001-44",
    contato: "Pedro Costa",
    telefone: "(41) 99876-5432",
    email: "pedro@logmod.com.br",
    servico: "Armazém",
    status: "prospect",
    potencial: "Médio",
    segmento: "Comércio",
  },
  {
    id: 4,
    empresa: "Tech Solutions Brasil",
    cnpj: "55.666.777/0001-88",
    contato: "Ana Paula",
    telefone: "(11) 94567-8901",
    email: "ana@techsolutions.com.br",
    servico: "Carga Projeto",
    status: "ativo",
    potencial: "Alto",
    segmento: "Tecnologia",
  },
  {
    id: 5,
    empresa: "Comercial Sul América",
    cnpj: "22.333.444/0001-55",
    contato: "Carlos Mendes",
    telefone: "(51) 93210-9876",
    email: "carlos@sulamerica.com.br",
    servico: "CNT R",
    status: "inativo",
    potencial: "Baixo",
    segmento: "Varejo",
  },
];

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [servicoFilter, setServicoFilter] = useState("todos");

  const filteredClientes = mockClientes.filter(cliente => {
    const matchesSearch = 
      cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpj.includes(searchTerm) ||
      cliente.contato.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || cliente.status === statusFilter;
    const matchesServico = servicoFilter === "todos" || cliente.servico === servicoFilter;

    return matchesSearch && matchesStatus && matchesServico;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      ativo: { variant: "default", label: "Ativo" },
      inativo: { variant: "destructive", label: "Inativo" },
      prospect: { variant: "secondary", label: "Prospect" },
      retomada: { variant: "outline", label: "Retomada" },
    };
    const config = variants[status] || variants.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPotencialColor = (potencial: string) => {
    const colors: Record<string, string> = {
      Alto: "text-success font-semibold",
      Médio: "text-warning font-semibold",
      Baixo: "text-muted-foreground",
    };
    return colors[potencial] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestão completa da base de clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, CNPJ ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="retomada">Retomada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={servicoFilter} onValueChange={setServicoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Serviços</SelectItem>
                <SelectItem value="Importação">Importação</SelectItem>
                <SelectItem value="Exportação">Exportação</SelectItem>
                <SelectItem value="Armazém">Armazém</SelectItem>
                <SelectItem value="Carga Projeto">Carga Projeto</SelectItem>
                <SelectItem value="CNT R">CNT R</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Potencial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.empresa}</TableCell>
                  <TableCell className="text-muted-foreground">{cliente.cnpj}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{cliente.contato}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {cliente.telefone}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cliente.servico}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cliente.segmento}</TableCell>
                  <TableCell className={getPotencialColor(cliente.potencial)}>
                    {cliente.potencial}
                  </TableCell>
                  <TableCell>{getStatusBadge(cliente.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Mostrando {filteredClientes.length} de {mockClientes.length} clientes</span>
      </div>
    </div>
  );
}
