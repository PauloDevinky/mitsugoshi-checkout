-- ============================================
-- SOLUÇÃO SEGURA: RLS Habilitado SEM Recursão
-- ============================================
-- Este script cria políticas RLS que não causam recursão
-- e mantém a segurança: usuários só veem seus próprios profiles
-- ============================================

-- PASSO 1: Remover TODAS as políticas antigas (que causam recursão)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.profiles;

-- PASSO 2: Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar política SIMPLES que não verifica role (evita recursão)
-- Usuários autenticados podem ver APENAS seu próprio profile
-- A verificação de role 'admin' acontece no código da aplicação
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
-- ⚠️ IMPORTANTE: Esta política NÃO verifica role, apenas se o ID corresponde
-- Isso evita recursão infinita. A verificação de 'admin' é feita no código.

-- PASSO 4: Criar/atualizar profile do usuário como admin
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'hayasakaadm@gmail.com';
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuário não encontrado! Crie primeiro em Authentication > Users';
    END IF;

    -- Criar ou atualizar profile
    INSERT INTO public.profiles (id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET role = 'admin', updated_at = now();

    RAISE NOTICE '✅ Profile criado/atualizado com role = admin para: %', v_user_email;
    RAISE NOTICE '✅ User ID: %', v_user_id;
END $$;

-- PASSO 5: Verificar resultado
SELECT 
    u.email,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ ADMIN - PRONTO PARA USAR!'
        WHEN p.role = 'customer' THEN '❌ CUSTOMER'
        ELSE '❓ ROLE DESCONHECIDA'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hayasakaadm@gmail.com';

-- PASSO 6: Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles';

-- ✅ AGORA ESTÁ SEGURO:
-- - RLS está habilitado
-- - Usuários só veem seus próprios profiles
-- - Não há recursão infinita
-- - A verificação de 'admin' acontece no código da aplicação
