-- ============================================
-- CORRIGIR NOMES DAS COLUNAS (CASE SENSITIVE)
-- ============================================
-- O PostgreSQL converte nomes sem aspas para minúsculas
-- Este script verifica e renomeia as colunas para o formato correto
-- ============================================

-- Verificar quais colunas existem em minúsculas
SELECT 
  column_name,
  'Precisa renomear' as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name IN (
    'customfooterimage',
    'logowidth',
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

-- ============================================
-- RENOMEAR COLUNAS PARA O FORMATO CORRETO
-- ============================================

-- 1. customfooterimage -> customFooterImage
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'customfooterimage'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'customFooterImage'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN customfooterimage TO "customFooterImage";
    RAISE NOTICE 'Coluna customfooterimage renomeada para customFooterImage';
  ELSE
    RAISE NOTICE 'Coluna customFooterImage já existe ou customfooterimage não existe';
  END IF;
END $$;

-- 2. logowidth -> logoWidth
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'logowidth'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'logoWidth'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN logowidth TO "logoWidth";
    RAISE NOTICE 'Coluna logowidth renomeada para logoWidth';
  ELSE
    RAISE NOTICE 'Coluna logoWidth já existe ou logowidth não existe';
  END IF;
END $$;

-- 3. showreviews -> showReviews
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'showreviews'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'showReviews'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN showreviews TO "showReviews";
    RAISE NOTICE 'Coluna showreviews renomeada para showReviews';
  ELSE
    RAISE NOTICE 'Coluna showReviews já existe ou showreviews não existe';
  END IF;
END $$;

-- Verificar se as colunas foram renomeadas corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name IN (
    'customFooterImage',
    'logoWidth',
    'showReviews',
    'checkout_security_badges_type',
    'checkout_security_badges_custom_url',
    'checkout_order_bump_headline',
    'checkout_order_bump_color',
    'checkout_urgency_bar_bg_color',
    'checkout_show_timer_countdown',
    'checkout_social_proof_max'
  )
ORDER BY column_name;

-- ✅ Se você viu as colunas com os nomes corretos (camelCase), está tudo certo!
-- Agora o checkout builder deve funcionar.
