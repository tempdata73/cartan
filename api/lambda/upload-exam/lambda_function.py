import os
import json
import base64
import uuid
import time

import boto3
import psycopg2

from datetime import datetime
from requests_toolbelt import MultipartDecoder
from botocore.exceptions import ClientError


s3 = boto3.client("s3")


def get_conn_string() -> str:
    creds = {
        "dbname": os.environ["DB_NAME"],
        "user": os.environ["DB_USER"],
        "host": os.environ["DB_HOST"],
        "password": os.environ["DB_PASSWORD"],
    }
    return " ".join(f"{key}={val}" for key, val in creds.items())


def upload_exam_to_s3(object_name, content) -> None:
    print("uploading exam to s3...")
    try:
        start = time.time()

        response = s3.put_object(
            Body=content,
            Bucket="gromov",
            Key=object_name,
            ContentType="application/pdf",
        )

        end = time.time()
        print(f"took {end - start:0.4f} secs to upload exam to s3")
    except ClientError as e:
        print("error uploading course exam")
        raise e


def update_db_with_exam_item(fields: dict[str, str]) -> None:
    conn_string = get_conn_string()

    start = time.time()
    print("connecting to database...")
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    end = time.time()
    print(f"took {end - start:0.4} secs to connect to db")

    sql = """
        INSERT INTO exams(
            course_code,
            course_name,
            course_year,
            course_period,
            professor,
            s3_uri,
            uploaded)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        fields["code"],
        fields["name"],
        fields["year"],
        fields["period"],
        fields.get("prof"),
        f"s3://gromov/{fields['object_name']}",
        datetime.now(),
    )
    cur.execute(sql, params)
    conn.commit()

    print("closing connection...")
    cur.close()
    conn.close()


def lambda_handler(event, context):
    if event["isBase64Encoded"]:
        content = base64.b64decode(event["body"])
    else:
        content = event["body"]
    decoder = MultipartDecoder(content, event["headers"].get("content-type"))

    # parse form
    fields = {}
    print("parsing form...")
    for part in decoder.parts:
        content_disposition = part.headers[b"Content-Disposition"].decode()

        # upload to s3
        if "filename" in content_disposition:
            fields["object_name"] = f"exams/{uuid.uuid4()}.pdf"
            upload_exam_to_s3(fields["object_name"], part.content)

        else:
            # XXX: This seems a bit hacky. There should be some input
            # sanitization to check that all fields are actually present.
            key = content_disposition.split("name=")[1].strip('"')
            fields[key] = part.text

    update_db_with_exam_item(fields)

    return {
        "statusCode": 200,
        "body": json.dumps("the exam was successfully uploaded"),
    }
