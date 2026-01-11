-- 1. PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_original DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_sale DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  ghost_shipping DECIMAL(10,2) DEFAULT 0,
  fake_recurrence BOOLEAN DEFAULT false,
  order_bump_id UUID REFERENCES public.products(id),
  tiktok_pixel_id TEXT,
  tiktok_access_token TEXT,
  checkout_color TEXT DEFAULT '#00FF41',
  checkout_template TEXT DEFAULT 'template-a',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. LEADS/ABANDONED CHECKOUTS TABLE
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT NOT NULL,
  step_abandoned INTEGER DEFAULT 1,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ip_address TEXT,
  user_agent TEXT,
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  lead_id UUID REFERENCES public.leads(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_whatsapp TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'refused', 'refunded')),
  payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'card')),
  gateway TEXT DEFAULT 'internal',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  pix_code TEXT,
  pix_qr_url TEXT,
  webhook_sent BOOLEAN DEFAULT false,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. ENABLE RLS ON ALL TABLES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. PUBLIC READ POLICIES FOR PRODUCTS (checkout needs to read)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- 6. PUBLIC INSERT FOR LEADS (checkout captures)
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Leads are viewable by authenticated users" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (true);

-- 7. TRANSACTIONS POLICIES
CREATE POLICY "Anyone can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Transactions are viewable by authenticated users" 
ON public.transactions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Transactions can be updated" 
ON public.transactions 
FOR UPDATE 
USING (true);

-- 8. ADMIN POLICIES FOR PRODUCTS (allow all for now, will add auth later)
CREATE POLICY "Products can be created" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Products can be updated" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Products can be deleted" 
ON public.products 
FOR DELETE 
USING (true);

-- 9. UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 10. TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();