-- Create user with database creation privileges
CREATE USER voxicle WITH PASSWORD 'voxicle' CREATEDB;

-- Create initial database
CREATE DATABASE voxicle OWNER voxicle;

-- Connect to the database to set permissions
\c voxicle

-- Grant schema privileges
GRANT USAGE, CREATE ON SCHEMA public TO voxicle;

-- Grant full table privileges
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON ALL TABLES IN SCHEMA public TO voxicle;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLES TO voxicle;
