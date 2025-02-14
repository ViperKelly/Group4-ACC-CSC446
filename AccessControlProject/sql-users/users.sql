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

CREATE TABLE logs (
    log_id       VARCHAR(255) NOT NULL,
    log_user VARCHAR(255) NOT NULL,
    log_timestamp     VARCHAR(255) NOT NULL,
    log_description     VARCHAR(1023) NOT NULL,
    log_success  VARCHAR(255) NOT NULL,
    PRIMARY KEY (log_id)
);


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