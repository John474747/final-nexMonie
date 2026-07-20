-- nexMonie Database Policies

-- Enable read access for anonymous users to the banks table.
-- This allows the Fund Account bank selector to fetch the list of banks 
-- without requiring a full authenticated session for the PostgREST request.

ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read access to banks" 
ON public.banks 
FOR SELECT 
TO anon 
USING (true);
