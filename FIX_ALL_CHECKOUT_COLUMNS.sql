-- ============================================
-- ADICIONAR TODAS AS COLUNAS DO CHECKOUT BUILDER
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para garantir que todas as colunas necessárias existam
-- ============================================

-- Adicionar todas as colunas do checkout builder (se não existirem)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS checkout_order_bump_headline TEXT DEFAULT 'Leve também...',
ADD COLUMN IF NOT EXISTS checkout_order_bump_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkout_urgency_bar_bg_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkout_show_timer_countdown BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_social_proof_max INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS logoWidth INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS checkout_security_badges_type TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS checkout_security_badges_custom_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS showReviews BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS customFooterImage TEXT DEFAULT NULL;

-- Adicionar constraint para checkout_security_badges_type se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_checkout_security_badges_type_check'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_checkout_security_badges_type_check 
    CHECK (checkout_security_badges_type IN ('default', 'custom'));
  END IF;
END $$;

-- Verificar todas as colunas criadas
SELECT column_name, data_type, column_default, is_nullable
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

-- ✅ Se todas as colunas aparecerem na query acima, tudo foi criado com sucesso!
