import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientes } from "@/hooks/useClientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type PipelineStage = "para_contactar" | "em_contato" | "proposta_enviada" | "negociacao" | "retomado";

const stageLabels: Record<PipelineStage, string> = {
  para_contactar: "Para Contactar",
  em_contato: "Em Contato",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  retomado: "Retomado",
};

const stageOrder: PipelineStage[] = ["para_contactar", "em_contato", "proposta_enviada", "negociacao", "retomado"];

export default function PipelineRetomada() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: clientes } = useClientes();

  const clientesRetomada = clientes?.filter(
    (c) => (c.responsavel_codigo === "FS" || c.is_cliente_fs) &&
           (c.status === "inativo" || (c.status === "ativo" && (c.volume_12_meses || 0) === 0))
  ) || [];

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ["pipeline_retomada"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_retomada")
        .select("*")
        .order("data_movimentacao", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const moveStageMutation = useMutation({
    mutationFn: async ({ clienteId, newStage }: { clienteId: string; newStage: PipelineStage }) => {
      const existing = pipelineData?.find((p) => p.cliente_id === clienteId);

      if (existing) {
        const { error } = await supabase
          .from("pipeline_retomada")
          .update({ estagio: newStage, data_movimentacao: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pipeline_retomada")
          .insert({ cliente_id: clienteId, estagio: newStage });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline_retomada"] });
      toast.success("Estágio atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar estágio");
    },
  });

  const getClientesByStage = (stage: PipelineStage) => {
    const clientesInStage = pipelineData?.filter((p) => p.estagio === stage).map((p) => p.cliente_id) || [];
    return clientesRetomada.filter((c) => clientesInStage.includes(c.id));
  };

  const getClientesNaoPipeline = () => {
    const clientesInPipeline = pipelineData?.map((p) => p.cliente_id) || [];
    return clientesRetomada.filter((c) => !clientesInPipeline.includes(c.id));
  };

  const moveToNextStage = (clienteId: string, currentStage: PipelineStage) => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      moveStageMutation.mutate({ clienteId, newStage: nextStage });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">FS - Pipeline de Retomada</h1>
        <p className="text-muted-foreground">
          Gestão visual do processo de reconquista de clientes inativos ou sem movimento
        </p>
      </div>

      {/* Clientes não adicionados ao pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes para Adicionar ao Pipeline ({getClientesNaoPipeline().length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getClientesNaoPipeline().map((cliente) => (
              <Card key={cliente.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{cliente.empresa}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{cliente.status}</Badge>
                      <Badge variant="secondary">
                        Vol: {new Intl.NumberFormat('pt-BR').format(cliente.volume_12_meses || 0)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => moveStageMutation.mutate({ clienteId: cliente.id, newStage: "para_contactar" })}
                    >
                      Adicionar ao Pipeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stageOrder.map((stage) => {
          const clientesStage = getClientesByStage(stage);
          return (
            <Card key={stage}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {stageLabels[stage]} ({clientesStage.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {clientesStage.map((cliente) => (
                  <Card
                    key={cliente.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/cliente/${cliente.id}`)}
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{cliente.empresa}</h4>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {cliente.segmento}
                        </Badge>
                        {stage !== "retomado" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToNextStage(cliente.id, stage);
                            }}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vol: {new Intl.NumberFormat('pt-BR').format(cliente.volume_12_meses || 0)}
                      </p>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
