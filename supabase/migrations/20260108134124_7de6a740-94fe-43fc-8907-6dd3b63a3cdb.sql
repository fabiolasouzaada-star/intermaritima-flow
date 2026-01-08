-- Add status and tipo_servico columns to propostas_cliente table
ALTER TABLE public.propostas_cliente
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'em_analise')),
ADD COLUMN IF NOT EXISTS tipo_servico text CHECK (tipo_servico IN (
  'ALFANDEGADO FCL',
  'ALFANDEGADO LCL', 
  'ALFANDEGADO BB',
  'TRANSPORTE',
  'ARMAZÉM GERAL',
  'ALF + OPERAÇÃO PORTUÁRIA',
  'EXPORTAÇÃO'
));