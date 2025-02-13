CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(30) NOT NULL,
    salt     VARCHAR(4) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);
ALTER TABLE users ADD role ENUM('admin', 'user') NOT NULL DEFAULT 'user';


INSERT INTO users (username, salt, role, password, email)
VALUES(
    "user",
    "620d",
    "user",
    "$2a$10$6fbKtcufRNh9vlT0gtCi8uk6z7s.KwR/QJK9HLNONb/ovOfby2Q2i",
    "user@example.com"
);

INSERT INTO users (username, salt, role, password, email)
VALUES(
    "testuser",
    "620d",
    "user",
    "$2a$10$6fbKtcufRNh9vlT0gtCi8uk6z7s.KwR/QJK9HLNONb/ovOfby2Q2i",
    "user@example.com"
);

UPDATE users SET role = 'admin' WHERE username = 'user';