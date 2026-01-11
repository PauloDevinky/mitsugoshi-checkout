-- Add missing columns for checkout builder features
-- This migration ensures all columns exist even if previous migrations were not applied

ALTER TABLE public.products 
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

-- Verify columns were added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'customFooterImage'
  ) THEN
    RAISE EXCEPTION 'Column customFooterImage was not created';
  END IF;
END $$;
