DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    email VARCHAR(50) PRIMARY KEY,
    password VARCHAR(60) NOT NULL
);


DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews(
    review_id SERIAL PRIMARY KEY NOT NULL,
    review VARCHAR(200),
    rating DECIMAL NOT NULL,
    isbn DECIMAL NOT NULL,
    email VARCHAR(50),
    FOREIGN KEY (email) REFERENCES users (email)
);


DROP TABLE IF EXISTS user_profile CASCADE;
CREATE TABLE user_profile(
    user_id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(10) NOT NULL,
    user_age INT,
    user_location VARCHAR(40),
    favorite_book VARCHAR(40),
    about TEXT
);