CREATE TABLE public.plt_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plt_links TO anon, authenticated;
GRANT ALL ON public.plt_links TO service_role;
ALTER TABLE public.plt_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view links" ON public.plt_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add links" ON public.plt_links FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete links" ON public.plt_links FOR DELETE TO anon, authenticated USING (true);