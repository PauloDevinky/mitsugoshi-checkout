-- Fix transactions table RLS: Restrict SELECT and UPDATE to admins only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Transactions are viewable by authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Transactions can be updated" ON public.transactions;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin-only UPDATE policy
CREATE POLICY "Only admins can update transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Note: INSERT policy "Anyone can create transactions" is kept for checkout functionality