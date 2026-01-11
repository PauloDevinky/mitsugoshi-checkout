-- ============================================
-- CONFIGURAR STORAGE BUCKET COMPLETO
-- ============================================
-- Execute este script para criar e configurar o bucket "uploads"
-- ============================================

-- 1. CRIAR O BUCKET (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. VERIFICAR SE O BUCKET FOI CRIADO
SELECT name, public, created_at
FROM storage.buckets
WHERE name = 'uploads';

-- 3. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 4. CRIAR POLÍTICA: Qualquer pessoa pode ler arquivos
CREATE POLICY "Anyone can view uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

-- 5. CRIAR POLÍTICA: Qualquer pessoa autenticada pode fazer upload
CREATE POLICY "Authenticated users can upload" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 6. CRIAR POLÍTICA: Qualquer pessoa autenticada pode atualizar arquivos
CREATE POLICY "Authenticated users can update" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- 7. CRIAR POLÍTICA: Qualquer pessoa autenticada pode deletar arquivos
CREATE POLICY "Authenticated users can delete" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'uploads');

-- 8. VERIFICAR POLÍTICAS CRIADAS
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%upload%';

-- ✅ Se aparecerem 4 políticas, está tudo configurado!
