-- ============================================
-- SCRIPT: Corrigir RLS da Tabela Profiles
-- ============================================
-- Este script garante que usuários autenticados possam ler seus próprios profiles
-- ============================================

-- 1. Habilitar RLS na tabela profiles (se ainda não estiver)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- 3. Criar política para usuários autenticados verem seus próprios profiles
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Criar política para usuários autenticados atualizarem seus próprios profiles (opcional)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ✅ Agora usuários autenticados podem ler seus próprios profiles!
