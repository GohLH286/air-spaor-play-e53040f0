CREATE TABLE public.plt_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.plt_uploads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plt_uploads TO authenticated;
GRANT ALL ON public.plt_uploads TO service_role;

ALTER TABLE public.plt_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plt uploads" ON public.plt_uploads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add plt uploads" ON public.plt_uploads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can remove plt uploads" ON public.plt_uploads FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Anyone can read plt files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'plt-uploads');
CREATE POLICY "Anyone can upload plt files" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'plt-uploads');
CREATE POLICY "Anyone can delete plt files" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'plt-uploads');