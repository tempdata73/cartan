import os
import json
import time
import psycopg2


def get_conn_string() -> str:
    creds = {
        "dbname": os.environ["DB_NAME"],
        "user": os.environ["DB_USER"],
        "host": os.environ["DB_HOST"],
        "password": os.environ["DB_PASSWORD"],
    }
    return " ".join(f"{key}={val}" for key, val in creds.items())


def lambda_handler(event, context):
    print("EVENT\n", event, end="\n\n")
    pattern = event["queryStringParameters"].get("pattern")
    pattern = f"%{pattern}%"

    print("connecting to db...")
    start = time.time()
    conn_string = get_conn_string()
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    end = time.time()
    print(f"took {end - start:0.4f} secs to connect to db.")

    sql = """
    SELECT course_name, course_code, count(*)
    FROM exams
    WHERE
        (course_code ILIKE %s)
        OR (course_name ILIKE %s)
    GROUP BY course_code, course_name
    ORDER BY course_name
    """
    cur.execute(sql, (pattern, pattern))
    matches = {
        "matches": cur.fetchall(),
    }

    print("closing connection...")
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "body": json.dumps(matches),
    }
