CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(40) NOT NULL,
  avatar_emoji VARCHAR(12) DEFAULT '🧑🏽‍🚀',
  skin VARCHAR(20) DEFAULT 'violet',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  release_year INT,
  genre VARCHAR(60),
  description TEXT,
  poster_emoji VARCHAR(12) DEFAULT '🎬'
);
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) <= 1500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS community_members (
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);
INSERT INTO movies (title,release_year,genre,description,poster_emoji) VALUES
('Dune: Part Two',2024,'Sci-Fi','A mythic journey across Arrakis.','🏜️'),
('Spider-Man: Across the Spider-Verse',2023,'Animation','Miles Morales swings into a multiverse.','🕸️'),
('The Batman',2022,'Action','A dark detective story in Gotham.','🦇'),
('Interstellar',2014,'Sci-Fi','A journey beyond our galaxy.','🪐'),
('Get Out',2017,'Horror','A weekend visit becomes a mystery.','🌲')
ON CONFLICT DO NOTHING;
INSERT INTO communities (name,description) VALUES
('Friday Film Club','Weekly movie picks and discussions.'),
('Sci-Fi Explorers','For stories beyond our universe.')
ON CONFLICT DO NOTHING;
