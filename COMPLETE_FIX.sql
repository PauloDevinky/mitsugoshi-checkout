-- ============================================
-- CORREÇÃO COMPLETA: Criar Tudo e Dar Admin
-- ============================================
-- Execute este script completo para resolver todos os problemas
-- ============================================

-- PASSO 1: Criar tabela profiles (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PASSO 2: Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- PASSO 4: Criar política para usuários verem seus próprios profiles
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- PASSO 5: Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- PASSO 6: Criar/atualizar profile do usuário como admin
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

-- PASSO 7: Verificar resultado
SELECT 
    u.email,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ ADMIN - PRONTO PARA USAR!'
        WHEN p.role = 'customer' THEN '❌ CUSTOMER'
        ELSE '❓ ROLE DESCONHECIDA'
    END as status,
    p.created_at,
    p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hayasakaadm@gmail.com';

-- ✅ Se aparecer "✅ ADMIN - PRONTO PARA USAR!" está tudo certo!
