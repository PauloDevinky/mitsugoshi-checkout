-- ============================================
-- SCRIPT: Diagnosticar Acesso de Admin
-- ============================================
-- Execute este script para verificar o que está acontecendo
-- ============================================

-- 1. Verificar se o usuário existe no auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'hayasakaadm@gmail.com';

-- 2. Verificar se o profile existe e qual é a role
SELECT 
    p.id,
    p.role,
    u.email,
    CASE 
        WHEN p.role = 'admin' THEN '✅ É ADMIN'
        WHEN p.role = 'customer' THEN '❌ É CUSTOMER'
        WHEN p.role IS NULL THEN '❌ SEM ROLE'
        ELSE '❓ ROLE DESCONHECIDA: ' || p.role
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hayasakaadm@gmail.com';

-- 3. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verificar RLS (Row Level Security) na tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. Verificar se há algum trigger ou função relacionada
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%profile%' OR routine_name LIKE '%role%';
