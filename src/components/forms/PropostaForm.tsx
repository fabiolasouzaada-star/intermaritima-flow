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
import { useModelosPropostas, useModeloProposta, useCreateProposta, ServicoCategoria } from "@/hooks/usePropostas";
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
  const [servicos, setServicos] = useState<ServicoCategoria[]>([]);

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

  // Load modelo structure when selected
  useEffect(() => {
    if (modeloSelecionado?.estrutura_servicos) {
      const estrutura = modeloSelecionado.estrutura_servicos as unknown as ServicoCategoria[];
      setServicos(estrutura);
    }
  }, [modeloSelecionado]);

  // Watch selected client
  const selectedClienteId = form.watch("cliente_id");

  const handleServicoValueChange = (catIndex: number, itemIndex: number, newValue: string) => {
    setServicos(prev => {
      const updated = [...prev];
      updated[catIndex].itens[itemIndex].valorEditado = newValue;
      return updated;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!modeloSelecionado) return;

    const valorTotal = servicos.reduce((total, cat) => {
      return total + cat.itens.reduce((catTotal, item) => {
        const valor = parseFloat(item.valorEditado || item.valor.replace(/[^0-9.,]/g, "").replace(",", "."));
        return catTotal + (isNaN(valor) ? 0 : valor);
      }, 0);
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
                    {clientes?.map((cliente) => (
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
                      ?.filter(o => !selectedClienteId || o.cliente_id === selectedClienteId)
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
                    {modelos?.map((modelo) => (
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
            </CardHeader>
            <CardContent className="space-y-6">
              {servicos.map((categoria, catIndex) => (
                <div key={catIndex} className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{categoria.categoria}</h4>
                    <p className="text-sm text-muted-foreground">{categoria.subcategoria}</p>
                  </div>
                  <div className="grid gap-3">
                    {categoria.itens.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Valor padrão: {item.valor} ({item.unidade})
                          </p>
                        </div>
                        <Input
                          className="w-40"
                          placeholder={item.valor}
                          value={item.valorEditado || ""}
                          onChange={(e) => handleServicoValueChange(catIndex, itemIndex, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
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
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
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
