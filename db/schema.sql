CREATE TYPE period AS enum ('primavera', 'verano', 'otoño');

CREATE TABLE exams (
	id SERIAL PRIMARY KEY,
	course_code CHAR(9) NOT NULL,
	course_name VARCHAR(255) NOT NULL,
	course_year INT NOT NULL,
	course_period period NOT NULL,
	professor VARCHAR(255),
	-- department VARCHAR(255) NOT NULL,
	s3_uri TEXT NOT NULL,
	uploaded TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- INSERT INTO exams(
-- 	course_code,
-- 	course_name,
-- 	course_year,
-- 	course_period,
-- 	s3_uri,
-- 	uploaded
-- ) VALUES (
-- 	'ACT-11300',
-- 	'cálculo actuarial i',
-- 	2024,
-- 	'primavera',
-- 	's3://gromov/exams/test-image.png',
-- 	NOW()
-- );

-- DROP TABLE exams;
-- DROP TYPE period;
