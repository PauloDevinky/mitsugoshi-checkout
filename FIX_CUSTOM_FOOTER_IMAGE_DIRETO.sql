-- ============================================
-- CRIAR COLUNA customFooterImage DIRETAMENTE
-- ============================================
-- Execute este script se a coluna customFooterImage não foi criada
-- ============================================

-- Verificar se a coluna já existe
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name = 'customFooterImage';

-- Se a query acima não retornar nenhuma linha, a coluna não existe
-- Execute o comando abaixo para criá-la:

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS customFooterImage TEXT DEFAULT NULL;

-- Verificar novamente se foi criada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name = 'customFooterImage';

-- Se ainda não aparecer, pode haver um problema de permissões
-- Tente executar com o usuário postgres ou admin do banco
