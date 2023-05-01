INSERT INTO users (email, password) VALUES
('testEmail25@colorado.edu', 'testPassword25'),
('test2@colorado.edu', 'test');

INSERT INTO reviews (review, rating, id, email, title, author, upload_date) VALUES
('test review text', 6.9, 1, 'testEmail25@colorado.edu', 'test book title', 'test book author', '2023-04-19'),
('this book SUCKS', 1, 2, 'testEmail25@colorado.edu', 'holes', 'louis sachar', '2023-04-19'),
('this book GOOD', 10, 3, 'test2@colorado.edu', 'hunger games', 'suzanne collins', '2023-04-19');

-- INSERT INTO readingList (email, title, imageURL, author) VALUES
-- ('')