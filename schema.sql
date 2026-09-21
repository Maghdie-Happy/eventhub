/*Maghdie Petersen 
230600204
Class 3.I 
Group MM3
Last Date and Time worked on: Thursday 10 September 2026 10:17
*/

/*Intialize main database instance*/
CREATE DATABASE IF NOT EXISTS eventhub_db;
USE eventhub_db;

/*Store registered users and organizers*/
CREATE TABLE IF NOT EXISTS users(user_id INT AUTO_INCREMENT PRIMARY KEY,
full_name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL,
role ENUM('User','Organizer','Admin') DEFAULT 'User',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

/*Store event locations separately for reusability*/
CREATE TABLE IF NOT EXISTS locations(location_id INT AUTO_INCREMENT PRIMARY KEY,
area_suburb VARCHAR(100) NOT NULL, province_state VARCHAR(100) NOT NULL,
country VARCHAR(100) DEFAULT 'South Africa');

/*Store event timings separately*/
CREATE TABLE IF NOT EXISTS schedules(schedule_id INT AUTO_INCREMENT PRIMARY KEY,
event_date DATE NOT NULL, start_time TIME NOT NULL);

/*Main events table connecting users, locations, and schedules*/
CREATE TABLE IF NOT EXISTS events(event_id INT AUTO_INCREMENT PRIMARY KEY,
organizer_id INT NOT NULL, location_id INT NOT NULL, schedule_id INT NOT NULL,
title VARCHAR(255) NOT NULL, description TEXT NOT NULL,
ticket_price DECIMAL(10,2) DEFAULT 0.00, is_featured BOOLEAN DEFAULT FALSE,
category ENUM('Technology','Music','Food','Sports') NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE,
FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE);

/*Insert default seed data for initial view testing*/
INSERT INTO users(full_name, email, password_hash,role) VALUES 
('Maghdie Petersen', 'maghdie16@gmail.com', 'hash_Maghdie_8910', 'Organizer');

INSERT INTO locations(area_suburb, province_state) VALUES 
('Stellenbosch', 'Western Cape'),
('Cape Town CBD', 'Western Cape'),
('Johannesburg', 'Gauteng');

INSERT INTO schedules(event_date, start_time) VALUES 
('2026-12-15', '09:00:00'),
('2026-10-05', '17:00:00'),
('2026-11-25', '12:00:00');

INSERT INTO events(organizer_id, location_id, schedule_id, title, description, ticket_price, is_featured, category) VALUES 
(1, 1, 1,'Annual Technicon and Hackathon Festival 2026', 'Build and Explore innovative Technology productss with elite deveopers!', 0.00, TRUE, 'Technology'),
(1, 2, 2,'Summer Jazz Festival', 'Come and Enjoy the best Jazz artists in our country.',160.00, TRUE, 'Music'),
(1, 3, 3,'Provincial Food Expo', 'Taste what the best across our provinces have to offer.', 90.00, TRUE, 'Food');









