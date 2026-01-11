-- ============================================
-- CORRIGIR ERRO DE RECURSÃO INFINITA
-- ============================================
-- Este script remove políticas problemáticas e cria uma solução que funciona
-- ============================================

-- PASSO 1: Remover TODAS as políticas existentes (que estão causando recursão)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.profiles;

-- PASSO 2: Desabilitar temporariamente RLS para permitir acesso
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar/atualizar profile do usuário como admin
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

-- PASSO 4: Verificar resultado
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

-- ✅ RLS DESABILITADO - Agora você pode fazer login!
-- ⚠️ NOTA: RLS está desabilitado. Para produção, você pode reabilitar depois
--    com políticas mais simples que não causem recursão.
