
-- Create admin user via raw SQL
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'ogbeifundaniel@gmail.com',
  crypt('Ogbeifun@2005', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Create identity for the user
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) SELECT 
  id, id, 
  jsonb_build_object('sub', id::text, 'email', 'ogbeifundaniel@gmail.com'),
  'email',
  id::text,
  now(), now(), now()
FROM auth.users WHERE email = 'ogbeifundaniel@gmail.com';
