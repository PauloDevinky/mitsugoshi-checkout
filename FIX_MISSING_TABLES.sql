-- ============================================
-- FIX MISSING TABLES (Transactions & Leads)
-- ============================================
-- Execute this script in the Supabase SQL Editor to fix the missing tables error.
-- ============================================

-- 1. Create LEADS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leads (
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

-- 2. Create TRANSACTIONS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
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

-- 3. Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Fix RLS Policies for Leads
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Leads are viewable by authenticated users" ON public.leads;

CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads" 
ON public.leads 
FOR SELECT 
TO authenticated 
USING (true);

-- 5. Fix RLS Policies for Transactions
DROP POLICY IF EXISTS "Anyone can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Transactions are viewable by authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Transactions can be updated" ON public.transactions;

CREATE POLICY "Anyone can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage transactions" 
ON public.transactions 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 6. Setup Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'transactions');
