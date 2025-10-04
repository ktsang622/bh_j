-- This file will be run after schema.sql to initialize data with properly hashed passwords
-- Password for both users is 'password123'
-- Hash generated with bcrypt rounds=10

UPDATE users SET password = '$2b$10$6ca91Z6RXD/Sh3UR5ShT1e.I81DHzzRGFhKXIGDu8oNuw59jBcZ/e' WHERE username = 'kevin';
UPDATE users SET password = '$2b$10$6ca91Z6RXD/Sh3UR5ShT1e.I81DHzzRGFhKXIGDu8oNuw59jBcZ/e' WHERE username = 'wife';
