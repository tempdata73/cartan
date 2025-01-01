import os
import json
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
    code = event["queryStringParameters"].get("code")

    conn_string = get_conn_string()
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()

    sql = """
        SELECT course_year, course_period, professor, exam_num, s3_object_name
        FROM exams
        WHERE course_code = %s
        ORDER BY
            course_year DESC,
            course_period ASC,
            professor ASC,
            exam_num ASC
    """
    cur.execute(sql, (code,))
    results = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "body": json.dumps(results),
    }
