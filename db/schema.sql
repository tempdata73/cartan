CREATE TYPE period AS enum ('primavera', 'verano', 'otoño');

CREATE TABLE exams (
	id SERIAL PRIMARY KEY,
	course_code CHAR(9) NOT NULL,
	course_name VARCHAR(255) NOT NULL,
	course_year INT NOT NULL,
	course_period period NOT NULL,
	professor VARCHAR(255),
	exam_num INT,
	s3_object_name TEXT NOT NULL,
	uploaded TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
