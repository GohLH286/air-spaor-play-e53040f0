ALTER TABLE public.plt_uploads ADD COLUMN IF NOT EXISTS owner_hash text;
ALTER TABLE public.plt_links ADD COLUMN IF NOT EXISTS owner_hash text;
DROP POLICY IF EXISTS "Anyone can remove plt uploads" ON public.plt_uploads;
DROP POLICY IF EXISTS "Anyone can delete links" ON public.plt_links;
REVOKE DELETE ON public.plt_uploads FROM anon, authenticated;
REVOKE DELETE ON public.plt_links FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_plt_item(_table text, _id uuid, _key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  IF _key IS NULL OR length(_key) < 20 THEN RETURN false; END IF;
  IF _table = 'uploads' THEN
    DELETE FROM public.plt_uploads WHERE id = _id AND owner_hash = encode(sha256(convert_to(_key,'UTF8')),'hex');
  ELSIF _table = 'links' THEN
    DELETE FROM public.plt_links WHERE id = _id AND owner_hash = encode(sha256(convert_to(_key,'UTF8')),'hex');
  ELSE RETURN false; END IF;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END $$;
REVOKE ALL ON FUNCTION public.delete_plt_item(text, uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_plt_item(text, uuid, text) TO anon, authenticated;