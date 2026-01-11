-- ============================================
-- CRIAR TODAS AS COLUNAS INDIVIDUALMENTE
-- ============================================
-- Execute este script se o script anterior não funcionou
-- Este script cria cada coluna separadamente para identificar problemas
-- ============================================

-- 1. customFooterImage
DO $$
BEGIN
  -- Verificar se existe em minúsculas e renomear
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
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name IN ('customFooterImage', 'customfooterimage')
  ) THEN
    ALTER TABLE public.products ADD COLUMN "customFooterImage" TEXT DEFAULT NULL;
    RAISE NOTICE 'Coluna customFooterImage criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna customFooterImage já existe';
  END IF;
END $$;

-- 2. logoWidth
DO $$
BEGIN
  -- Verificar se existe em minúsculas e renomear
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
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name IN ('logoWidth', 'logowidth')
  ) THEN
    ALTER TABLE public.products ADD COLUMN "logoWidth" INTEGER DEFAULT 120;
    RAISE NOTICE 'Coluna logoWidth criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna logoWidth já existe';
  END IF;
END $$;

-- 3. showReviews
DO $$
BEGIN
  -- Verificar se existe em minúsculas e renomear
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
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name IN ('showReviews', 'showreviews')
  ) THEN
    ALTER TABLE public.products ADD COLUMN "showReviews" BOOLEAN DEFAULT true;
    RAISE NOTICE 'Coluna showReviews criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna showReviews já existe';
  END IF;
END $$;

-- 4. checkout_security_badges_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_security_badges_type'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_security_badges_type TEXT DEFAULT 'default';
    RAISE NOTICE 'Coluna checkout_security_badges_type criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_security_badges_type já existe';
  END IF;
END $$;

-- 5. checkout_security_badges_custom_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_security_badges_custom_url'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_security_badges_custom_url TEXT DEFAULT NULL;
    RAISE NOTICE 'Coluna checkout_security_badges_custom_url criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_security_badges_custom_url já existe';
  END IF;
END $$;

-- 6. checkout_order_bump_headline
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_order_bump_headline'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_order_bump_headline TEXT DEFAULT 'Leve também...';
    RAISE NOTICE 'Coluna checkout_order_bump_headline criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_order_bump_headline já existe';
  END IF;
END $$;

-- 7. checkout_order_bump_color
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_order_bump_color'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_order_bump_color TEXT DEFAULT NULL;
    RAISE NOTICE 'Coluna checkout_order_bump_color criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_order_bump_color já existe';
  END IF;
END $$;

-- 8. checkout_urgency_bar_bg_color
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_urgency_bar_bg_color'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_urgency_bar_bg_color TEXT DEFAULT NULL;
    RAISE NOTICE 'Coluna checkout_urgency_bar_bg_color criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_urgency_bar_bg_color já existe';
  END IF;
END $$;

-- 9. checkout_show_timer_countdown
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_show_timer_countdown'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_show_timer_countdown BOOLEAN DEFAULT true;
    RAISE NOTICE 'Coluna checkout_show_timer_countdown criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_show_timer_countdown já existe';
  END IF;
END $$;

-- 10. checkout_social_proof_max
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'checkout_social_proof_max'
  ) THEN
    ALTER TABLE public.products ADD COLUMN checkout_social_proof_max INTEGER DEFAULT 50;
    RAISE NOTICE 'Coluna checkout_social_proof_max criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna checkout_social_proof_max já existe';
  END IF;
END $$;

-- Adicionar constraint para checkout_security_badges_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_checkout_security_badges_type_check'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_checkout_security_badges_type_check 
    CHECK (checkout_security_badges_type IN ('default', 'custom'));
    RAISE NOTICE 'Constraint criada com sucesso';
  ELSE
    RAISE NOTICE 'Constraint já existe';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar constraint: %', SQLERRM;
END $$;

-- Verificar todas as colunas criadas
SELECT 
  column_name, 
  data_type, 
  column_default, 
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

-- ✅ Se você viu 10 linhas acima, todas as colunas foram criadas!
