-- Add new columns to products table for advanced features
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shipping_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS order_bumps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_interval TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS checkout_urgency_text TEXT DEFAULT 'Oferta por tempo limitado!',
ADD COLUMN IF NOT EXISTS checkout_timer_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS checkout_banner_url TEXT;

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT DEFAULT 'NEXUS',
  platform_logo_url TEXT,
  page_title TEXT DEFAULT 'NEXUS Checkout',
  dashboard_banner_url TEXT,
  custom_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_settings
CREATE POLICY "Platform settings are viewable by everyone" 
ON public.platform_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Platform settings can be updated" 
ON public.platform_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Platform settings can be inserted" 
ON public.platform_settings 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
INSERT INTO public.platform_settings (platform_name, page_title) 
VALUES ('NEXUS', 'NEXUS Checkout')
ON CONFLICT DO NOTHING;

-- Create gateway_settings table
CREATE TABLE IF NOT EXISTS public.gateway_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name TEXT NOT NULL DEFAULT 'duttyfy',
  api_key TEXT NOT NULL DEFAULT 'f622106dcaad42988d5ad465472010d1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gateway_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gateway_settings
CREATE POLICY "Gateway settings are viewable by everyone" 
ON public.gateway_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Gateway settings can be updated" 
ON public.gateway_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Gateway settings can be inserted" 
ON public.gateway_settings 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_gateway_settings_updated_at
BEFORE UPDATE ON public.gateway_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default gateway settings
INSERT INTO public.gateway_settings (gateway_name, api_key) 
VALUES ('duttyfy', 'f622106dcaad42988d5ad465472010d1')
ON CONFLICT DO NOTHING;

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['payment.approved', 'payment.refused', 'payment.refunded'],
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhooks
CREATE POLICY "Webhooks are viewable by everyone" 
ON public.webhooks 
FOR SELECT 
USING (true);

CREATE POLICY "Webhooks can be created" 
ON public.webhooks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Webhooks can be updated" 
ON public.webhooks 
FOR UPDATE 
USING (true);

CREATE POLICY "Webhooks can be deleted" 
ON public.webhooks 
FOR DELETE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();