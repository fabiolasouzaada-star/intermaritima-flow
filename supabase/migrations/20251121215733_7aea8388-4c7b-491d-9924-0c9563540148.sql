-- Adicionar campo sede na tabela contatos_cliente
ALTER TABLE public.contatos_cliente
ADD COLUMN IF NOT EXISTS sede text;

-- Adicionar campo cargo se não existir (já deve existir mas garantindo)
-- (já existe, então não precisa)

-- Criar novo campo segmentos como array de texto
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS segmentos text[] DEFAULT '{}';

-- Migrar dados existentes do enum segmento para o array segmentos
UPDATE public.clientes
SET segmentos = ARRAY[segmento::text]
WHERE segmento IS NOT NULL AND (segmentos IS NULL OR array_length(segmentos, 1) IS NULL);

-- Criar índice GIN para busca eficiente nos segmentos
CREATE INDEX IF NOT EXISTS idx_clientes_segmentos ON public.clientes USING GIN(segmentos);

-- Comentários
COMMENT ON COLUMN public.contatos_cliente.sede IS 'Cidade/Estado do contato';
COMMENT ON COLUMN public.clientes.segmentos IS 'Segmentos de atuação do cliente (multi-seleção)';