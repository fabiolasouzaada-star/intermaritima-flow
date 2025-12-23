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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClientes } from "@/hooks/useClientes";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useModelosPropostas, useModeloProposta, useCreateProposta, CategoriaServico, ServicoItem } from "@/hooks/usePropostas";
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
  const [categorias, setCategorias] = useState<CategoriaServico[]>([]);

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
      const estrutura = modeloSelecionado.estrutura_servicos as unknown;
      
      // Check if it's the new category-based structure
      if (Array.isArray(estrutura) && estrutura.length > 0 && 'categoria' in estrutura[0]) {
        const cats = (estrutura as CategoriaServico[]).map(cat => ({
          ...cat,
          itens: cat.itens.map(item => ({
            ...item,
            selecionado: false,
            valorEditado: item.valor,
          }))
        }));
        setCategorias(cats);
      } else if (Array.isArray(estrutura)) {
        // Old flat structure - convert to single category
        const items = (estrutura as ServicoItem[]).map(item => ({
          ...item,
          selecionado: false,
          valorEditado: item.valor || "",
        }));
        setCategorias([{ categoria: "Serviços", itens: items }]);
      }
    }
  }, [modeloSelecionado]);

  const selectedClienteId = form.watch("cliente_id");

  const handleServicoToggle = (catIndex: number, itemIndex: number) => {
    setCategorias(prev => {
      const updated = [...prev];
      updated[catIndex] = {
        ...updated[catIndex],
        itens: updated[catIndex].itens.map((item, idx) => 
          idx === itemIndex ? { ...item, selecionado: !item.selecionado } : item
        )
      };
      return updated;
    });
  };

  const handleServicoValueChange = (catIndex: number, itemIndex: number, newValue: string) => {
    setCategorias(prev => {
      const updated = [...prev];
      updated[catIndex] = {
        ...updated[catIndex],
        itens: updated[catIndex].itens.map((item, idx) => 
          idx === itemIndex ? { ...item, valorEditado: newValue } : item
        )
      };
      return updated;
    });
  };

  const handleSelectAllCategory = (catIndex: number, select: boolean) => {
    setCategorias(prev => {
      const updated = [...prev];
      updated[catIndex] = {
        ...updated[catIndex],
        itens: updated[catIndex].itens.map(item => ({ ...item, selecionado: select }))
      };
      return updated;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!modeloSelecionado) return;

    // Filter only selected services
    const servicosSelecionados = categorias.map(cat => ({
      ...cat,
      itens: cat.itens.filter(item => item.selecionado)
    })).filter(cat => cat.itens.length > 0);

    if (servicosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um serviço");
      return;
    }

    const valorTotal = servicosSelecionados.reduce((total, cat) => {
      return total + cat.itens.reduce((catTotal, item) => {
        const valorStr = item.valorEditado || item.valor || "0";
        const match = valorStr.match(/[\d.,]+/);
        if (match) {
          const valor = parseFloat(match[0].replace(".", "").replace(",", "."));
          return catTotal + (isNaN(valor) ? 0 : valor);
        }
        return catTotal;
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
      servicos: servicosSelecionados as unknown as Json,
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

  const totalSelecionados = categorias.reduce((acc, cat) => 
    acc + cat.itens.filter(i => i.selecionado).length, 0
  );

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

        {categorias.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Serviços e Valores</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {totalSelecionados} serviço(s) selecionado(s)
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione os serviços que serão incluídos nesta proposta. Você pode editar os valores individualmente.
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {categorias.map((categoria, catIndex) => {
                    const selectedCount = categoria.itens.filter(i => i.selecionado).length;
                    const allSelected = selectedCount === categoria.itens.length;
                    
                    return (
                      <div key={catIndex} className="space-y-3">
                        <div className="flex items-center justify-between sticky top-0 bg-background py-2 border-b">
                          <h4 className="font-semibold text-primary">{categoria.categoria}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAllCategory(catIndex, !allSelected)}
                          >
                            {allSelected ? "Desmarcar todos" : "Selecionar todos"}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {categoria.itens.map((item, itemIndex) => (
                            <div 
                              key={itemIndex} 
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                item.selecionado ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                              }`}
                            >
                              <Checkbox
                                checked={item.selecionado}
                                onCheckedChange={() => handleServicoToggle(catIndex, itemIndex)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.nome}</p>
                                <p className="text-xs text-muted-foreground">{item.unidade}</p>
                              </div>
                              <Input
                                className="w-32 text-right text-sm"
                                value={item.valorEditado || item.valor}
                                onChange={(e) => handleServicoValueChange(catIndex, itemIndex, e.target.value)}
                                disabled={!item.selecionado}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
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
                  placeholder="Observações específicas para esta proposta"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createProposta.isPending || totalSelecionados === 0}>
            {createProposta.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Proposta ({totalSelecionados} serviços)
          </Button>
        </div>
      </form>
    </Form>
  );
}

import { toast } from "sonner";
