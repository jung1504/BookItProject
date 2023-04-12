DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews(
    review_id SERIAL PRIMARY KEY NOT NULL,
    review VARCHAR(200),
    rating DECIMAL NOT NULL,
    isbn DECIMAL NOT NULL,
    FOREIGN KEY (username) REFERENCES users (username)
);