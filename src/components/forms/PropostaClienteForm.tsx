import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClientes } from "@/hooks/useClientes";
import { useCreatePropostaCliente, useUpdatePropostaCliente, PropostaCliente } from "@/hooks/usePropostasCliente";

const TIPOS_SERVICO = [
  "ALFANDEGADO FCL",
  "ALFANDEGADO LCL",
  "ALFANDEGADO BB",
  "TRANSPORTE",
  "ARMAZÉM GERAL",
  "ALF + OPERAÇÃO PORTUÁRIA",
  "EXPORTAÇÃO",
] as const;

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_analise", label: "Em Análise" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
] as const;

const formSchema = z.object({
  numero_proposta: z.string().min(1, "Número da proposta é obrigatório"),
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  tipo_servico: z.string().min(1, "Tipo de serviço é obrigatório"),
  status: z.string().default("pendente"),
  data_proposta: z.string().optional(),
  vencimento_proposta: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PropostaClienteFormProps {
  proposta?: PropostaCliente;
  onSuccess?: () => void;
}

export function PropostaClienteForm({ proposta, onSuccess }: PropostaClienteFormProps) {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const createProposta = useCreatePropostaCliente();
  const updateProposta = useUpdatePropostaCliente();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero_proposta: proposta?.numero_proposta || "",
      cliente_id: proposta?.cliente_id || "",
      tipo_servico: proposta?.tipo_servico || "",
      status: proposta?.status || "pendente",
      data_proposta: proposta?.data_proposta || "",
      vencimento_proposta: proposta?.vencimento_proposta || "",
      observacoes: proposta?.observacoes || "",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      if (proposta) {
        await updateProposta.mutateAsync({
          id: proposta.id,
          data: {
            ...values,
            servico: values.tipo_servico,
          },
        });
      } else {
        await createProposta.mutateAsync({
          numero_proposta: values.numero_proposta,
          cliente_id: values.cliente_id,
          servico: values.tipo_servico,
          tipo_servico: values.tipo_servico,
          status: values.status,
          data_proposta: values.data_proposta,
          vencimento_proposta: values.vencimento_proposta,
          observacoes: values.observacoes,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = createProposta.isPending || updateProposta.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_proposta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Proposta *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2025-00001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_proposta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da Proposta</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingClientes ? "Carregando..." : "Selecione um cliente"} />
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
            name="tipo_servico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Serviço *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_SERVICO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
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
            name="vencimento_proposta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vencimento</FormLabel>
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
                <Textarea placeholder="Observações sobre a proposta..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : proposta ? "Atualizar" : "Criar Proposta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
