-- Create table for client proposals (propostas)
CREATE TABLE public.propostas_cliente (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    numero_proposta text NOT NULL,
    servico text NOT NULL,
    data_proposta date,
    vencimento_proposta date,
    proposta_url text,
    observacoes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.propostas_cliente ENABLE ROW LEVEL SECURITY;

-- Create policies for propostas_cliente
CREATE POLICY "Authenticated users can view propostas" 
ON public.propostas_cliente 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert propostas" 
ON public.propostas_cliente 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update propostas" 
ON public.propostas_cliente 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete propostas" 
ON public.propostas_cliente 
FOR DELETE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_propostas_cliente_updated_at
BEFORE UPDATE ON public.propostas_cliente
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add column for custom responsible name on tarefas (to allow manual input)
ALTER TABLE public.tarefas ADD COLUMN responsavel_nome text;