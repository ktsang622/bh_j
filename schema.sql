-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','user'))
);

-- Create kids table
CREATE TABLE IF NOT EXISTS kids (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create behaviour_entries table
CREATE TABLE IF NOT EXISTS behaviour_entries (
  id SERIAL PRIMARY KEY,
  kid_id INT REFERENCES kids(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  event_date TIMESTAMPTZ DEFAULT NOW(),
  trigger TEXT,
  behaviour TEXT,
  intensity TEXT,
  duration_minutes INT,
  resolution TEXT,
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default users (passwords are 'password123' hashed with bcrypt)
-- Note: These will be properly hashed when the app initializes
INSERT INTO users (username, password, role) VALUES
('kevin', '$2a$10$YourHashedPasswordHere', 'admin'),
('wife', '$2a$10$YourHashedPasswordHere', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert kids
INSERT INTO kids (name) VALUES ('Kat'), ('Kie')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_behaviour_entries_kid_id ON behaviour_entries(kid_id);
CREATE INDEX IF NOT EXISTS idx_behaviour_entries_user_id ON behaviour_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_behaviour_entries_event_date ON behaviour_entries(event_date);
