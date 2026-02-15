-- Fix NULL values in auth.users that cause scan errors
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;
UPDATE auth.users SET email_change_confirm_status = 0 WHERE email_change_confirm_status IS NULL;