DROP TRIGGER IF EXISTS teams_updated_at ON teams;
DROP TRIGGER IF EXISTS users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at();
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;
DROP EXTENSION IF EXISTS "uuid-ossp";