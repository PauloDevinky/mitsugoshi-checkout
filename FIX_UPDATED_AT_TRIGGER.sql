-- ============================================
-- CORRIGIR TRIGGER updated_at
-- ============================================
-- Este script corrige o erro "record 'new' has no field 'updated_at'"
-- ============================================

-- 1. Verificar se a coluna updated_at existe
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name = 'updated_at';

-- 2. Se a coluna não existir, criá-la
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    RAISE NOTICE '✅ Coluna updated_at criada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna updated_at já existe';
  END IF;
END $$;

-- 3. Recriar a função do trigger com tratamento de erro robusto
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
DECLARE
  has_updated_at BOOLEAN;
BEGIN
  -- Verificar se a coluna updated_at existe na tabela
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = TG_TABLE_SCHEMA 
    AND table_name = TG_TABLE_NAME 
    AND column_name = 'updated_at'
  ) INTO has_updated_at;
  
  -- Se a coluna existir, atualizar
  IF has_updated_at THEN
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    -- Se a coluna não existir, apenas retornar NEW
    RETURN NEW;
  WHEN OTHERS THEN
    -- Qualquer outro erro, retornar NEW sem atualizar
    RETURN NEW;
END;
$$;

-- 4. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

-- 5. Criar trigger novamente
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'products'
  AND trigger_name = 'update_products_updated_at';

-- ✅ Se você viu o trigger na query acima, está tudo correto!
-- Agora tente salvar novamente no checkout builder.
