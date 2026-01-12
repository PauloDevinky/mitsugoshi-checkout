-- CREATE_GATEWAY_TABLE.sql
-- Execute este script no SQL Editor do Supabase para criar a tabela de configurações de gateway que está faltando.

-- 1. Criar a tabela gateway_settings
CREATE TABLE IF NOT EXISTS public.gateway_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name TEXT NOT NULL DEFAULT 'duttyfy',
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Habilitar segurança (RLS)
ALTER TABLE public.gateway_settings ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de acesso
-- Removemos políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Gateway settings are viewable by everyone" ON public.gateway_settings;
DROP POLICY IF EXISTS "Gateway settings can be managed by everyone" ON public.gateway_settings;

CREATE POLICY "Gateway settings are viewable by everyone" 
ON public.gateway_settings FOR SELECT USING (true);

CREATE POLICY "Gateway settings can be managed by everyone" 
ON public.gateway_settings FOR ALL USING (true);

-- 4. Inserir a chave do Duttyfy
INSERT INTO public.gateway_settings (gateway_name, api_key, is_active)
VALUES ('duttyfy', 'f622106dcaad42988d5ad465472010d1', true);
