-- ============================================
-- ADICIONAR COLUNA customFooterImage
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para adicionar a coluna customFooterImage que está faltando
-- ============================================

-- Adicionar a coluna customFooterImage se não existir
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS customFooterImage TEXT DEFAULT NULL;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name = 'customFooterImage';

-- ✅ Se a query acima retornar uma linha, a coluna foi criada com sucesso!
