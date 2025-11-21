-- Step 1: Remove NOT NULL constraint from cnpj
ALTER TABLE public.clientes ALTER COLUMN cnpj DROP NOT NULL;

-- Step 2: Update empty strings to NULL
UPDATE public.clientes SET cnpj = NULL WHERE cnpj = '';

-- Step 3: Drop the existing unique constraint if it exists
ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_cnpj_key;

-- Step 4: Create a partial unique index that only applies when CNPJ is not NULL
-- This allows multiple NULL values (clients without CNPJ) but ensures uniqueness for actual CNPJs
CREATE UNIQUE INDEX clientes_cnpj_unique_idx ON public.clientes (cnpj) WHERE cnpj IS NOT NULL;