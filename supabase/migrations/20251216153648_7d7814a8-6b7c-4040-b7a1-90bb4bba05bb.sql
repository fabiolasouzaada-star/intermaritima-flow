-- Add 'a_agendar' to status_visita enum
ALTER TYPE status_visita ADD VALUE IF NOT EXISTS 'a_agendar' BEFORE 'agendada';