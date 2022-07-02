-- Drop and recreate Users table (Example)
-- npm run db:reset // reset db => run on terminal
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL
);
