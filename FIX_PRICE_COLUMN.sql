-- ============================================
-- REMOVER COLUNA "price" SE EXISTIR
-- ============================================
-- Esta coluna não deveria existir (usamos price_original e price_sale)
-- ============================================

-- Verificar se a coluna "price" existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name = 'price';

-- Se a coluna existir, removê-la
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'products'
      AND column_name = 'price'
  ) THEN
    ALTER TABLE public.products DROP COLUMN price;
    RAISE NOTICE 'Coluna "price" removida com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna "price" não existe. Nada a fazer.';
  END IF;
END $$;

-- Verificar novamente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name IN ('price', 'price_original', 'price_sale')
ORDER BY column_name;

-- ✅ Se aparecer apenas price_original e price_sale, está correto!
