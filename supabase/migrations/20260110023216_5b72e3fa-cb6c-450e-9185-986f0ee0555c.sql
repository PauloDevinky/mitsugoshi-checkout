-- Add order bump custom title and description columns to products table
-- Each order bump can have its own title and description
-- The order_bumps JSON column will now include: product_id, discount_percent, title, description

-- Add customer reviews JSON column to products table
-- Structure: [{name: string, photo_url: string, text: string, rating: number}]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS checkout_reviews JSONB DEFAULT '[]'::jsonb;

-- Add security badges custom images column
-- Structure: [{label: string, icon_url: string}]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS checkout_security_badges JSONB DEFAULT '[]'::jsonb;

-- Add footer trust text that can be customized
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS checkout_footer_text TEXT DEFAULT NULL;