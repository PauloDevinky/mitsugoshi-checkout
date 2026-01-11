-- Create uploads storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for anyone to read files
CREATE POLICY "Anyone can view uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

-- Storage policy for anyone to upload files
CREATE POLICY "Anyone can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

-- Storage policy for anyone to update files
CREATE POLICY "Anyone can update files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploads');

-- Storage policy for anyone to delete files
CREATE POLICY "Anyone can delete files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploads');