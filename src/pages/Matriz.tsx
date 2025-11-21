import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockClientes: Array<{
  id: number;
  empresa: string;
  potencial: number;
  facilidade: number;
  categoria: string;
}> = [];

const categorias = [
  { id: "ganho-rapido", nome: "Ganho Rápido", cor: "bg-success", descricao: "Alto potencial + Alta facilidade" },
  { id: "estrategico", nome: "Estratégico", cor: "bg-primary", descricao: "Alto potencial + Baixa facilidade" },
  { id: "medio-prazo", nome: "Médio Prazo", cor: "bg-warning", descricao: "Médio potencial" },
  { id: "baixo-impacto", nome: "Baixo Impacto", cor: "bg-muted", descricao: "Baixo potencial" },
];

export default function Matriz() {
  const clientesPorCategoria = categorias.map(cat => ({
    ...cat,
    clientes: mockClientes.filter(c => c.categoria === cat.id)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Matriz de Potencial x Aderência</h1>
        <p className="text-muted-foreground">Priorização estratégica de clientes</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Matriz Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[600px] border rounded-lg p-4">
              {/* Eixos */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
              <div className="absolute top-0 bottom-0 left-0 w-px bg-border"></div>
              
              {/* Labels dos eixos */}
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                Facilidade de Fechamento →
              </div>
              <div className="absolute top-2 left-2 text-sm text-muted-foreground rotate-[-90deg] origin-left">
                ← Potencial de Faturamento
              </div>

              {/* Quadrantes */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-success/5 border-l border-b rounded-tr-lg">
                <div className="p-2 text-xs font-semibold text-success">GANHO RÁPIDO</div>
              </div>
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/5 border-r border-b rounded-tl-lg">
                <div className="p-2 text-xs font-semibold text-primary">ESTRATÉGICO</div>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-muted/50 border-l border-t rounded-br-lg">
                <div className="p-2 text-xs font-semibold text-muted-foreground">BAIXO IMPACTO</div>
              </div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-warning/5 border-r border-t rounded-bl-lg">
                <div className="p-2 text-xs font-semibold text-warning">MÉDIO PRAZO</div>
              </div>

              {/* Pontos dos clientes */}
              {mockClientes.map((cliente) => {
                const x = (cliente.facilidade / 100) * 90;
                const y = 90 - (cliente.potencial / 100) * 90;
                
                let bgColor = "bg-gray-500";
                if (cliente.categoria === "ganho-rapido") bgColor = "bg-success";
                else if (cliente.categoria === "estrategico") bgColor = "bg-primary";
                else if (cliente.categoria === "medio-prazo") bgColor = "bg-warning";
                
                return (
                  <div
                    key={cliente.id}
                    className={`absolute w-3 h-3 ${bgColor} rounded-full cursor-pointer hover:scale-150 transition-transform`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={`${cliente.empresa}\nPotencial: ${cliente.potencial}%\nFacilidade: ${cliente.facilidade}%`}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {clientesPorCategoria.map((categoria) => (
            <Card key={categoria.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${categoria.cor}`} />
                  {categoria.nome}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
              </CardHeader>
              <CardContent>
                {categoria.clientes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum cliente nesta categoria</p>
                ) : (
                  <div className="space-y-2">
                    {categoria.clientes.map((cliente) => (
                      <div key={cliente.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="font-medium">{cliente.empresa}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline">P: {cliente.potencial}%</Badge>
                          <Badge variant="outline">F: {cliente.facilidade}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
