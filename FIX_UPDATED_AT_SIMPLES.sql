-- ============================================
-- CORREÇÃO SIMPLES DO TRIGGER updated_at
-- ============================================
-- Execute este script para corrigir o erro "record 'new' has no field 'updated_at'"
-- ============================================

-- 1. Garantir que a coluna updated_at existe
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- 2. Recriar a função do trigger de forma simples e segura
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Remover trigger antigo
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

-- 4. Criar trigger novamente
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Verificar se está tudo correto
SELECT 
  'Coluna updated_at' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'updated_at'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
UNION ALL
SELECT 
  'Trigger update_products_updated_at' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND event_object_table = 'products'
      AND trigger_name = 'update_products_updated_at'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
UNION ALL
SELECT 
  'Função update_updated_at_column' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'update_updated_at_column'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status;

-- ✅ Se todos os itens mostram "✅ Existe", está tudo correto!
-- Agora tente salvar novamente no checkout builder.
