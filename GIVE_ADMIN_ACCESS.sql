-- ============================================
-- SCRIPT: Dar Acesso de Admin
-- ============================================
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor" (menu lateral)
-- 4. Cole este código completo
-- 5. Clique em "Run" ou pressione Ctrl+Enter
-- ============================================

-- IMPORTANTE: Primeiro você precisa ter a conta criada no Supabase Auth
-- Se ainda não criou, vá em Authentication > Users > Add User
-- Email: hayasakaadm@gmail.com
-- Senha: Lucrar1M@2026

-- Dar acesso de admin para o usuário
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'hayasakaadm@gmail.com';
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    -- Se o usuário não existir, mostrar mensagem
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado! Por favor, crie a conta primeiro em Authentication > Users > Add User';
    END IF;

    -- Criar ou atualizar profile com role admin
    INSERT INTO public.profiles (id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET role = 'admin';

    RAISE NOTICE '✅ Acesso de admin concedido com sucesso para: %', v_user_email;
    RAISE NOTICE 'User ID: %', v_user_id;
END $$;

-- Verificar se foi criado/atualizado corretamente
SELECT 
    u.email,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ ADMIN'
        WHEN p.role = 'customer' THEN '❌ CUSTOMER'
        ELSE '❓ SEM ROLE'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hayasakaadm@gmail.com';

-- Se aparecer "✅ ADMIN" na coluna status, está tudo certo! 🎉
