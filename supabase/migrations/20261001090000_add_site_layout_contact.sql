-- Real contact details per user, edited in Admin > Settings.
--
-- The contact sections used to print hardcoded addresses
-- (studio@danielstudio.ai, hello@calebpeters.com) that nobody receives mail
-- at. Each page now shows an email or WhatsApp row only when the matching
-- column below is filled in, so a visitor never sees an address that bounces.
--
-- Additive and nullable: until you fill them in, the rows are hidden and the
-- contact form keeps working as before.
ALTER TABLE public.site_layouts
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;
