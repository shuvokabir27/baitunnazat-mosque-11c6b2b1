-- Restart numbering from 2026001 based on join order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.members
)
UPDATE public.members m
SET member_no = 2026000 + o.rn
FROM ordered o
WHERE m.id = o.id;

-- Advance sequence so new members continue from the max
SELECT setval('public.members_member_no_seq', GREATEST((SELECT COALESCE(MAX(member_no), 2026000) FROM public.members), 2026000));