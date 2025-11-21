-- Adicionar novos campos à tabela clientes para terminais, freight forwarder e tipos de serviço
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS terminais_operados text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_freight_forwarder boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tipos_servico text[] DEFAULT '{}';

-- Criar índices para melhorar performance nas queries com os novos campos
CREATE INDEX IF NOT EXISTS idx_clientes_terminais ON public.clientes USING GIN(terminais_operados);
CREATE INDEX IF NOT EXISTS idx_clientes_is_freight_forwarder ON public.clientes(is_freight_forwarder);
CREATE INDEX IF NOT EXISTS idx_clientes_tipos_servico ON public.clientes USING GIN(tipos_servico);

-- Comentários para documentação
COMMENT ON COLUMN public.clientes.terminais_operados IS 'Terminais onde o cliente opera: EMPÓRIO, TPC, INTER, TECON';
COMMENT ON COLUMN public.clientes.is_freight_forwarder IS 'Indica se o cliente é um Freight Forwarder';
COMMENT ON COLUMN public.clientes.tipos_servico IS 'Tipos de serviço: Importação, Exportação, Logística Integrada, Transporte, Armazém/AG, Carga Projeto, Carga Solta, CNTR';