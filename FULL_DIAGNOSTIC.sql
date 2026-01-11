-- ============================================
-- DIAGNÓSTICO COMPLETO: Verificar Tudo
-- ============================================

-- 1. Verificar se a tabela profiles existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 2. Ver estrutura da tabela profiles (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar se o usuário existe
SELECT 
    id,
    email,
    created_at,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Usuário existe'
        ELSE '❌ Usuário NÃO existe'
    END as status
FROM auth.users
WHERE email = 'hayasakaadm@gmail.com';

-- 4. Verificar se o profile existe para o usuário
DO $$
DECLARE
    v_user_id UUID;
    v_profile_exists BOOLEAN;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'hayasakaadm@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ Usuário não encontrado!';
    ELSE
        RAISE NOTICE '✅ Usuário encontrado. ID: %', v_user_id;
        
        -- Verificar se profile existe
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = v_user_id
        ) INTO v_profile_exists;
        
        IF v_profile_exists THEN
            RAISE NOTICE '✅ Profile existe para este usuário';
        ELSE
            RAISE NOTICE '❌ Profile NÃO existe! Vou criar agora...';
            
            -- Criar profile
            INSERT INTO public.profiles (id, role)
            VALUES (v_user_id, 'admin')
            ON CONFLICT (id) DO UPDATE SET role = 'admin';
            
            RAISE NOTICE '✅ Profile criado/atualizado com role = admin';
        END IF;
    END IF;
END $$;

-- 5. Verificar RLS
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 7. Testar query direta (simulando o que o código faz)
SELECT 
    p.id,
    p.role,
    u.email,
    CASE 
        WHEN p.role = 'admin' THEN '✅ É ADMIN - DEVE FUNCIONAR'
        WHEN p.role = 'customer' THEN '❌ É CUSTOMER'
        WHEN p.role IS NULL THEN '❌ SEM ROLE'
        ELSE '❓ ROLE: ' || p.role
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hayasakaadm@gmail.com';
