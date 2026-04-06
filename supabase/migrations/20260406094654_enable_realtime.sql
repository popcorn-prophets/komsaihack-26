-- Enable Realtime by adding tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.residents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisory_recipients;
