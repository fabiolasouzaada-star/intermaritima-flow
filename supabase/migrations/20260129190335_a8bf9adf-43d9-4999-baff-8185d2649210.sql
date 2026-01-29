-- Add column for multiple areas (keeping original for backward compatibility)
ALTER TABLE public.reunioes ADD COLUMN IF NOT EXISTS areas_envolvidas text[] DEFAULT '{}';

-- Migrate existing data
UPDATE public.reunioes 
SET areas_envolvidas = ARRAY[area_envolvida::text]
WHERE areas_envolvidas = '{}' OR areas_envolvidas IS NULL;