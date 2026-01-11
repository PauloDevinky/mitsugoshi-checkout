-- ============================================
-- SOLUÇÃO ALTERNATIVA: RLS com função SECURITY DEFINER
-- ============================================
-- Use este script se quiser manter RLS habilitado
-- ============================================

-- PASSO 1: Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- PASSO 2: Criar função SECURITY DEFINER para verificar profile (evita recursão)
CREATE OR REPLACE FUNCTION public.get_user_profile_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;
$$;

-- PASSO 3: Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar política simples que permite acesso autenticado
-- (sem verificar role para evitar recursão)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- PASSO 5: Criar/atualizar profile do usuário como admin
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'hayasakaadm@gmail.com';
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ Usuário não encontrado!';
    END IF;

    INSERT INTO public.profiles (id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET role = 'admin', updated_at = now();

    RAISE NOTICE '✅ Profile criado/atualizado com role = admin';
END $$;

-- PASSO 6: Verificar
SELECT 
    u.email,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ ADMIN'
        ELSE '❌ CUSTOMER'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hayasakaadm@gmail.com';
