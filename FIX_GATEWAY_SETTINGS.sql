-- FIX_GATEWAY_SETTINGS.sql
-- Execute este script no SQL Editor do Supabase para corrigir o erro "Configuração de pagamento incompleta"

-- 1. Verifica o que existe atualmente (apenas para log se rodar manualmente)
-- SELECT * FROM public.gateway_settings;

-- 2. Insere a configuração do Duttyfy se não existir, ou atualiza se já existir
INSERT INTO public.gateway_settings (gateway_name, api_key, is_active)
VALUES ('duttyfy', 'f622106dcaad42988d5ad465472010d1', true)
ON CONFLICT DO NOTHING;

-- 3. Se já existia mas estava inativo ou com outro nome, vamos garantir que existe pelo menos UM ativo
UPDATE public.gateway_settings 
SET is_active = true 
WHERE gateway_name = 'duttyfy';

-- 4. Se não existir NENHUMA linha 'duttyfy' (caso o ON CONFLICT acima não pegue por falta de constraint unique no nome), 
-- vamos forçar a inserção apenas se a tabela estiver vazia ou sem duttyfy.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.gateway_settings WHERE gateway_name = 'duttyfy' AND is_active = true) THEN
        INSERT INTO public.gateway_settings (gateway_name, api_key, is_active)
        VALUES ('duttyfy', 'f622106dcaad42988d5ad465472010d1', true);
    END IF;
END $$;
