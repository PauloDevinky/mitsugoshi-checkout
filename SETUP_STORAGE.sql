-- ============================================
-- CONFIGURAR STORAGE BUCKET
-- ============================================
-- Execute este script para criar o bucket "uploads" e suas políticas
-- ============================================

-- 1. CRIAR O BUCKET (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read public files" ON storage.objects;

-- 3. CRIAR POLÍTICA: Qualquer pessoa pode fazer upload
CREATE POLICY "Anyone can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

-- 4. CRIAR POLÍTICA: Qualquer pessoa pode ler arquivos públicos
CREATE POLICY "Anyone can read public files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

-- 5. VERIFICAR BUCKET CRIADO
SELECT name, public, created_at
FROM storage.buckets
WHERE name = 'uploads';

-- ✅ Se aparecer uma linha com name='uploads', o bucket existe! ✅
