-- 1) Lock down user_roles: only admins may manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Tighten public member self-registration with validation
DROP POLICY IF EXISTS "Anyone can add members" ON public.members;

CREATE POLICY "Anyone can add members"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND char_length(btrim(name)) BETWEEN 1 AND 100
  AND father_name IS NOT NULL AND char_length(btrim(father_name)) BETWEEN 1 AND 100
  AND mobile IS NOT NULL AND btrim(mobile) ~ '^[0-9]{11}$'
  AND address IS NOT NULL AND char_length(btrim(address)) BETWEEN 1 AND 200
  AND monthly_donation >= 0
);