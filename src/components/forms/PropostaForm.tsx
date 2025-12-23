import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientes } from "@/hooks/useClientes";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useModelosPropostas, useModeloProposta, useCreateProposta, ServicoItem } from "@/hooks/usePropostas";
import { Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  oportunidade_id: z.string().optional(),
  modelo_id: z.string().min(1, "Selecione um modelo"),
  contato_nome: z.string().optional(),
  contato_email: z.string().email().optional().or(z.literal("")),
  contato_telefone: z.string().optional(),
  contato_cargo: z.string().optional(),
  prazo_validade: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PropostaFormProps {
  onSuccess?: () => void;
  clienteId?: string;
  oportunidadeId?: string;
}

export function PropostaForm({ onSuccess, clienteId, oportunidadeId }: PropostaFormProps) {
  const [selectedModeloId, setSelectedModeloId] = useState<string>("");
  const [servicos, setServicos] = useState<ServicoItem[]>([]);

  const { data: clientes } = useClientes();
  const { data: oportunidades } = useOportunidades();
  const { data: modelos } = useModelosPropostas();
  const { data: modeloSelecionado } = useModeloProposta(selectedModeloId);
  const createProposta = useCreateProposta();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: clienteId || "",
      oportunidade_id: oportunidadeId || "",
      modelo_id: "",
      contato_nome: "",
      contato_email: "",
      contato_telefone: "",
      contato_cargo: "",
      prazo_validade: "",
      observacoes: "",
    },
  });

  // Load modelo structure when selected - now handles flat array structure
  useEffect(() => {
    if (modeloSelecionado?.estrutura_servicos) {
      const estrutura = modeloSelecionado.estrutura_servicos as unknown as ServicoItem[];
      // Initialize with empty values for editing
      const servicosComValor = estrutura.map(item => ({
        ...item,
        valor: item.valor || "",
        valorEditado: "",
      }));
      setServicos(servicosComValor);
    }
  }, [modeloSelecionado]);

  // Watch selected client
  const selectedClienteId = form.watch("cliente_id");

  const handleServicoValueChange = (index: number, newValue: string) => {
    setServicos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], valorEditado: newValue };
      return updated;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!modeloSelecionado) return;

    const valorTotal = servicos.reduce((total, item) => {
      const valorStr = item.valorEditado || item.valor || "0";
      const valor = parseFloat(valorStr.replace(/[^0-9.,]/g, "").replace(",", "."));
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);

    await createProposta.mutateAsync({
      cliente_id: data.cliente_id,
      oportunidade_id: data.oportunidade_id || null,
      modelo_id: data.modelo_id,
      cabecalho_institucional: modeloSelecionado.cabecalho_institucional,
      texto_introdutorio: modeloSelecionado.texto_introdutorio,
      notas_condicoes: modeloSelecionado.notas_condicoes,
      assinatura_padrao: modeloSelecionado.assinatura_padrao,
      servicos: servicos as unknown as Json,
      contato_nome: data.contato_nome || null,
      contato_email: data.contato_email || null,
      contato_telefone: data.contato_telefone || null,
      contato_cargo: data.contato_cargo || null,
      prazo_validade: data.prazo_validade || null,
      observacoes: data.observacoes || null,
      valor_total: valorTotal,
    });

    onSuccess?.();
  };

  // Guard against undefined data
  if (!clientes || !oportunidades || !modelos) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="oportunidade_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oportunidade (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vincular a oportunidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {oportunidades
                      .filter(o => !selectedClienteId || o.cliente_id === selectedClienteId)
                      .map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.titulo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelo_id"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Modelo de Proposta *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedModeloId(value);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modelos.map((modelo) => (
                      <SelectItem key={modelo.id} value={modelo.id}>
                        {modelo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preview do modelo selecionado */}
        {modeloSelecionado && (
          <Card className="border-primary/20 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Prévia do Modelo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Cabeçalho Institucional</p>
                <p className="whitespace-pre-wrap bg-background p-2 rounded border">{modeloSelecionado.cabecalho_institucional}</p>
              </div>
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Texto Introdutório</p>
                <p className="whitespace-pre-wrap bg-background p-2 rounded border">{modeloSelecionado.texto_introdutorio}</p>
              </div>
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Notas e Condições</p>
                <p className="whitespace-pre-wrap bg-background p-2 rounded border text-xs">{modeloSelecionado.notas_condicoes}</p>
              </div>
              <div>
                <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Assinatura</p>
                <p className="whitespace-pre-wrap bg-background p-2 rounded border">{modeloSelecionado.assinatura_padrao}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contato_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contato_cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contato_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contato_telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {servicos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serviços e Valores</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preencha os valores para cada serviço. Deixe em branco para usar "A combinar".
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {servicos.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">Unidade: {item.unidade}</p>
                  </div>
                  <Input
                    className="w-40"
                    placeholder="R$ 0,00"
                    value={item.valorEditado || ""}
                    onChange={(e) => handleServicoValueChange(index, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prazo_validade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo de Validade</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Adicionais</FormLabel>
              <FormControl>
                <Textarea 
                  rows={4} 
                  placeholder="Observações específicas para esta proposta (serão adicionadas ao documento)"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createProposta.isPending}>
            {createProposta.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Proposta
          </Button>
        </div>
      </form>
    </Form>
  );
}
