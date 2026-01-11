-- ============================================
-- RENOMEAR COLUNAS DE MINÚSCULAS PARA CAMELCASE
-- ============================================
-- Execute este script para renomear as colunas que foram criadas em minúsculas
-- ============================================

-- 1. Renomear customfooterimage -> customFooterImage
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'customfooterimage'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN customfooterimage TO "customFooterImage";
    RAISE NOTICE '✅ Coluna customfooterimage renomeada para customFooterImage';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna customfooterimage não existe (pode já estar como customFooterImage)';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao renomear: %', SQLERRM;
END $$;

-- 2. Renomear logowidth -> logoWidth
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'logowidth'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN logowidth TO "logoWidth";
    RAISE NOTICE '✅ Coluna logowidth renomeada para logoWidth';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna logowidth não existe (pode já estar como logoWidth)';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao renomear: %', SQLERRM;
END $$;

-- 3. Renomear showreviews -> showReviews
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'showreviews'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN showreviews TO "showReviews";
    RAISE NOTICE '✅ Coluna showreviews renomeada para showReviews';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna showreviews não existe (pode já estar como showReviews)';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao renomear: %', SQLERRM;
END $$;

-- Verificar todas as colunas após renomeação
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name IN (
    'customFooterImage',
    'customfooterimage',
    'logoWidth',
    'logowidth',
    'showReviews',
    'showreviews',
    'checkout_security_badges_type',
    'checkout_security_badges_custom_url',
    'checkout_order_bump_headline',
    'checkout_order_bump_color',
    'checkout_urgency_bar_bg_color',
    'checkout_show_timer_countdown',
    'checkout_social_proof_max'
  )
ORDER BY column_name;

-- ✅ Se você viu as colunas com nomes em camelCase (customFooterImage, logoWidth, showReviews),
-- então está tudo correto! Agora o checkout builder deve funcionar.
