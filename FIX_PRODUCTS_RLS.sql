-- ============================================
-- CORRIGIR RLS DA TABELA PRODUCTS
-- ============================================
-- Este script garante que admins possam acessar a tabela products
-- ============================================

-- 1. Verificar se RLS está habilitado
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

-- 3. Criar função para verificar se usuário é admin (usando profiles)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = 'admin'
  );
$$;

-- 4. Política: Admins podem fazer tudo na tabela products
CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. Política: Qualquer pessoa pode ver produtos ativos (para checkout público)
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO authenticated
USING (status = 'active');

-- 6. Política alternativa: Se não quiser restringir por status, permitir leitura para todos autenticados
-- (Descomente se a política acima não funcionar)
-- CREATE POLICY "Authenticated users can view products"
-- ON public.products
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- 7. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- ✅ Agora admins podem gerenciar produtos e usuários autenticados podem ver produtos ativos
