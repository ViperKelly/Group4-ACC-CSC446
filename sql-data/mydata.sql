CREATE DATABASE mydata;

use mydata;

CREATE TABLE admin_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    top_speed INT NOT NULL,      -- mph (adjust if you prefer km/h)
    horsepower INT NOT NULL,
    zero_to_sixty DECIMAL(3,2),  -- 0-60 mph time in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_data (brand, model, year, top_speed, horsepower, zero_to_sixty)
VALUES
  ('Bugatti',    'Chiron Super Sport', 2021, 304, 1578, 2.40),
  ('Koenigsegg', 'Jesko Absolut',      2022, 330, 1600, 2.50),
  ('Hennessey',  'Venom F5',           2021, 311, 1817, 2.60),
  ('SSC',        'Tuatara',            2020, 286, 1750, 2.70),
  ('Tesla',      'Model S Plaid',      2021, 200, 1020, 1.99),
  ('Porsche',    '911 Turbo S',        2021, 205,  640, 2.60),
  ('Lamborghini','Aventador SVJ',      2020, 217,  759, 2.80),
  ('Ferrari',    'SF90 Stradale',      2020, 211,  986, 2.50),
  ('McLaren',    'Speedtail',          2020, 250, 1035, 2.90);

INSERT INTO user_activities (username, activity)
VALUES
    ('user', 'Logged in'),
    ('user', 'Contemplated Life');