-- Enable SELECT access for the 'anon' role on the 'banks' table
-- This allows the frontend (using the public anon key) to fetch the list of banks for the dropdown selector.

CREATE POLICY "Allow public read access to banks" 
ON public.banks 
FOR SELECT 
TO anon 
USING (true);
