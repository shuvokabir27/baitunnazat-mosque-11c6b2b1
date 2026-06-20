-- Remove duplicate members keeping the earliest record per mobile
DELETE FROM public.members m
USING public.members keep
WHERE m.mobile = keep.mobile
  AND m.created_at > keep.created_at;

-- Handle any remaining ties (same created_at) by keeping the smallest id
DELETE FROM public.members m
USING public.members keep
WHERE m.mobile = keep.mobile
  AND m.created_at = keep.created_at
  AND m.id > keep.id;

-- Enforce uniqueness at the database level
ALTER TABLE public.members
  ADD CONSTRAINT members_mobile_unique UNIQUE (mobile);