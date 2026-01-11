-- ============================================
-- GARANTIR QUE TODAS AS COLUNAS EXISTAM
-- ============================================
-- Execute este script para adicionar todas as colunas necessárias
-- ============================================

-- Primeiro, criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar TODAS as colunas básicas (se não existirem)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS price_original DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_sale DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS ghost_shipping DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fake_recurrence BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS order_bump_id UUID REFERENCES public.products(id),
ADD COLUMN IF NOT EXISTS tiktok_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS tiktok_access_token TEXT;

-- Adicionar colunas de checkout
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS checkout_color TEXT DEFAULT '#00FF41',
ADD COLUMN IF NOT EXISTS checkout_template TEXT DEFAULT 'template-a',
ADD COLUMN IF NOT EXISTS checkout_banner_url TEXT,
ADD COLUMN IF NOT EXISTS checkout_logo_url TEXT,
ADD COLUMN IF NOT EXISTS checkout_bg_color TEXT DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS checkout_timer_bg_color TEXT DEFAULT '#22C55E',
ADD COLUMN IF NOT EXISTS checkout_timer_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS checkout_show_timer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_show_security_badges BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_show_social_proof BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_social_proof_count INTEGER DEFAULT 23,
ADD COLUMN IF NOT EXISTS checkout_urgency_text TEXT DEFAULT 'Oferta por tempo limitado!',
ADD COLUMN IF NOT EXISTS checkout_timer_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS checkout_reviews JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checkout_security_badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checkout_footer_text TEXT,
ADD COLUMN IF NOT EXISTS shipping_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS order_bumps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_interval TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS checkout_order_bump_headline TEXT DEFAULT 'Leve também...',
ADD COLUMN IF NOT EXISTS checkout_order_bump_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkout_urgency_bar_bg_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkout_show_timer_countdown BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_social_proof_max INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS logoWidth INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS checkout_security_badges_type TEXT DEFAULT 'default' CHECK (checkout_security_badges_type IN ('default', 'custom')),
ADD COLUMN IF NOT EXISTS checkout_security_badges_custom_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS showReviews BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS customFooterImage TEXT DEFAULT NULL;

-- Criar constraint UNIQUE no slug se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar colunas criadas
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY column_name;

-- ✅ Todas as colunas necessárias devem estar criadas agora!
