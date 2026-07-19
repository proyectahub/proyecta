-- PROYECTA never needs a Monero private view key. Clear legacy values while
-- preserving each user's public address and wallet preference.
UPDATE users SET monero_wallet_view_key = '' WHERE monero_wallet_view_key <> '';
UPDATE wallet_profiles SET view_key = '' WHERE view_key <> '';
