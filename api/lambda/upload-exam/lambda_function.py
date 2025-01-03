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


def get_conn_string() -> str:
    creds = {
        "dbname": os.environ["DB_NAME"],
        "user": os.environ["DB_USER"],
        "host": os.environ["DB_HOST"],
        "password": os.environ["DB_PASSWORD"],
    }
    return " ".join(f"{key}={val}" for key, val in creds.items())


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
            exam_num,
            professor,
            s3_object_name,
            uploaded)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        fields["code"],
        fields["name"],
        fields["year"],
        fields["period"],
        fields.get("exam-num") or None,  # empty exam-num is "" and not null
        fields.get("prof") or None,  # empty prof is "" and not null
        fields["object_name"],
        datetime.now(),
    )
    cur.execute(sql, params)
    conn.commit()

    print("closing connection...")
    cur.close()
    conn.close()


def create_presigned_url(bucket_name, object_name, expiration=600):
    s3 = boto3.client("s3")
    try:
        url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_name,
                "ContentType": "application/pdf",
            },
            ExpiresIn=expiration,
        )
    except ClientError as e:
        print("error generating presigned url:")
        raise e

    return url


def lambda_handler(event, context):
    if event["isBase64Encoded"]:
        content = base64.b64decode(event["body"])
    else:
        content = event["body"]
    decoder = MultipartDecoder(content, event["headers"].get("content-type"))

    fields = {
        "object_name": f"exams/{uuid.uuid4()}.pdf",
    }

    print("parsing form...")
    for part in decoder.parts:
        content_disposition = part.headers[b"Content-Disposition"].decode()

        # XXX: This seems a bit hacky. There should be some input
        # sanitization to check that all fields are actually present.
        key = content_disposition.split("name=")[1].strip('"')
        fields[key] = part.text.lower()

    update_db_with_exam_item(fields)

    print("creating presigned url...")
    url = create_presigned_url("www.cartan.xyz", fields["object_name"])

    return {
        "statusCode": 200,
        "body": json.dumps(
            {
                "presignedUrl": url,
                "objectName": fields["object_name"],
            }
        ),
        "headers": {
            "Content-Type": "application/json",
        },
    }
