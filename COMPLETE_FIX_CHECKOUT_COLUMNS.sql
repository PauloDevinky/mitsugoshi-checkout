-- ============================================
-- CORREÇÃO COMPLETA: TODAS AS COLUNAS DO CHECKOUT BUILDER
-- ============================================
-- Execute este script no Supabase SQL Editor
-- Este script adiciona TODAS as colunas necessárias para o checkout builder funcionar
-- ============================================

-- ============================================
-- PASSO 1: Adicionar todas as colunas faltantes
-- ============================================
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

-- ============================================
-- PASSO 2: Adicionar constraint para checkout_security_badges_type
-- ============================================
DO $$ 
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_checkout_security_badges_type_check'
  ) THEN
    ALTER TABLE public.products 
    DROP CONSTRAINT products_checkout_security_badges_type_check;
  END IF;
  
  -- Adicionar constraint
  ALTER TABLE public.products 
  ADD CONSTRAINT products_checkout_security_badges_type_check 
  CHECK (checkout_security_badges_type IN ('default', 'custom'));
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint já existe, tudo bem
    NULL;
END $$;

-- ============================================
-- PASSO 3: Verificar todas as colunas criadas
-- ============================================
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable,
  CASE 
    WHEN column_name IN (
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
    ) THEN '✅ NOVA COLUNA'
    ELSE '✅ JÁ EXISTIA'
  END as status
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

-- ============================================
-- PASSO 4: Verificar todas as colunas do checkout (para debug)
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND (column_name LIKE 'checkout_%' OR column_name IN ('logoWidth', 'showReviews', 'customFooterImage'))
ORDER BY column_name;

-- ============================================
-- ✅ CONCLUSÃO
-- ============================================
-- Se você viu 10 linhas na primeira query (PASSO 3), todas as colunas foram criadas!
-- Agora você pode usar o checkout builder sem erros.
-- ============================================
-- 
-- ⚠️ IMPORTANTE: Se ainda der erro após executar este script:
-- 1. Aguarde 1-2 minutos para o cache do Supabase atualizar
-- 2. Recarregue a página do checkout builder (F5)
-- 3. Tente salvar novamente
-- 
-- O Supabase mantém um cache do schema que pode levar alguns segundos para atualizar
-- após adicionar novas colunas.
-- ============================================
