-- Add new checkout customization columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS checkout_logo_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkout_bg_color text DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS checkout_timer_bg_color text DEFAULT '#22C55E',
ADD COLUMN IF NOT EXISTS checkout_timer_text_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS checkout_show_timer boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_show_security_badges boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_show_social_proof boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_social_proof_count integer DEFAULT 23;