import { useParams } from "react-router-dom";
import { useCliente } from "@/hooks/useClientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, FileText, Calendar, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cliente, isLoading } = useCliente(id!);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!cliente) {
    return <div>Cliente não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{cliente.empresa}</h1>
          <p className="text-muted-foreground">{cliente.cnpj}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cliente.contratos?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cliente.visitas?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cliente.tarefas?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
          <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>CNPJ:</strong> {cliente.cnpj || "-"}</div>
              <div><strong>Segmento:</strong> {cliente.segmento}</div>
              <div><strong>Status:</strong> <Badge>{cliente.status}</Badge></div>
              {cliente.responsavel_codigo && (
                <div>
                  <strong>Responsável:</strong> {cliente.responsavel_codigo}
                  {cliente.is_cliente_fs && <Badge variant="secondary" className="ml-2">Cliente FS</Badge>}
                </div>
              )}
              {cliente.volume_12_meses !== null && cliente.volume_12_meses !== undefined && (
                <div>
                  <strong>Volume 12 Meses:</strong> {new Intl.NumberFormat('pt-BR').format(cliente.volume_12_meses)}
                </div>
              )}
              {cliente.potencial && <div><strong>Potencial:</strong> {cliente.potencial}</div>}
              {cliente.site && <div><strong>Site:</strong> {cliente.site}</div>}
              <div>
                <strong>Freight Forwarder:</strong>{" "}
                <Badge variant={cliente.is_freight_forwarder ? "default" : "secondary"}>
                  {cliente.is_freight_forwarder ? "Sim" : "Não"}
                </Badge>
              </div>
              {cliente.terminais_operados && cliente.terminais_operados.length > 0 && (
                <div>
                  <strong>Terminais:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {cliente.terminais_operados.map((terminal: string) => (
                      <Badge key={terminal} variant="outline">{terminal}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {cliente.tipos_servico && cliente.tipos_servico.length > 0 && (
                <div>
                  <strong>Tipos de Serviço:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {cliente.tipos_servico.map((servico: string) => (
                      <Badge key={servico} variant="outline">{servico}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {cliente.observacoes && <div><strong>Observações:</strong> {cliente.observacoes}</div>}
            </CardContent>
          </Card>

          {cliente.numero_proposta && (
            <Card>
              <CardHeader>
                <CardTitle>Dados da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Número:</strong> {cliente.numero_proposta}</div>
                {cliente.data_proposta && (
                  <div><strong>Data:</strong> {new Date(cliente.data_proposta).toLocaleDateString()}</div>
                )}
                {cliente.vencimento_proposta && (
                  <div><strong>Vencimento:</strong> {new Date(cliente.vencimento_proposta).toLocaleDateString()}</div>
                )}
                {cliente.proposta_url && (
                  <Button asChild>
                    <a href={cliente.proposta_url} target="_blank" rel="noopener noreferrer">
                      Ver Proposta
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contratos">
          <Card>
            <CardHeader>
              <CardTitle>Contratos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.contratos?.length ? (
                <div className="space-y-2">
                  {cliente.contratos.map((contrato: any) => (
                    <div key={contrato.id} className="p-4 border rounded">
                      <div className="font-medium">{contrato.numero_contrato}</div>
                      <div className="text-sm text-muted-foreground">
                        Valor: R$ {contrato.valor_total?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum contrato encontrado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitas">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.visitas?.length ? (
                <div className="space-y-2">
                  {cliente.visitas.map((visita: any) => (
                    <div key={visita.id} className="p-4 border rounded">
                      <div className="font-medium">{new Date(visita.data_visita).toLocaleDateString()}</div>
                      <Badge>{visita.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma visita registrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oportunidades">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades em Aberto</CardTitle>
            </CardHeader>
            <CardContent>
              {cliente.oportunidades?.length ? (
                <div className="space-y-2">
                  {cliente.oportunidades.map((op: any) => (
                    <div key={op.id} className="p-4 border rounded">
                      <div className="font-medium">{op.titulo}</div>
                      {op.valor && <div className="text-sm">R$ {op.valor.toLocaleString()}</div>}
                      <Badge>{op.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma oportunidade encontrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
