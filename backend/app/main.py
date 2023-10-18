from fastapi import Request, FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import openai
import os
import evadb 
import csv
import PyPDF2


MAX_CHUNK_SIZE = 10000

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


cursor = evadb.connect().cursor() 

@app.get('/')
async def home():
    return {"message": "Hello World"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        return {"valid": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail="File upload failed.")

@app.post("/create")
async def create_tables(file: UploadFile = File(...)):
    try:
        file_path = f"uploads/{file.filename}"
        create_table_from_file(file_path)
        return {"valid": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Creating table from PDF failed.")


@app.post("/chat")
async def chat_with_bot(request: Request):
    data = await request.json() 
    question = data.get("question")
    print(f"getting response... ")
    response = cursor.table("paper_summary").select(f"ChatGPT('{question}', text)").df()["chatgpt.response"][0]
    print(f"bot_response: {response}")
    return {"bot_response": f"{response}"}

@app.post("/validate-key")
async def validate_key(request: Request):
    data = await request.json() 
    api_key = data.get("apiKey")
    openai.api_key = api_key

    try:
        engines = openai.Engine.list()
        os.environ["OPENAI_KEY"] = api_key
        return {"valid": True}
    except Exception as e:
        return {"valid": False}

def extract_paragraphs_from_pdf(pdf_path):
    paragraphs = []

    with open(pdf_path, "rb") as pdf_file:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            paragraphs.extend(lines)

    return paragraphs

def write_paragraphs_to_csv(paragraphs, csv_path):
    with open(csv_path, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        
        combined_text = " ".join(paragraphs)
        partitioned_texts = partition_transcript(combined_text)
        
        writer.writerow(["", "text"])
        
        for index, text_chunk in enumerate(partitioned_texts):
            writer.writerow([index, text_chunk["text"]])

def partition_transcript(raw_transcript: str):
    if len(raw_transcript) <= MAX_CHUNK_SIZE:
        return [{"text": raw_transcript}]

    k = 2
    while True:
        if (len(raw_transcript) / k) <= MAX_CHUNK_SIZE:
            break
        else:
            k += 1
    chunk_size = int(len(raw_transcript) / k)

    partitioned_transcript = [
        {"text": raw_transcript[i : i + chunk_size]}
        for i in range(0, len(raw_transcript), chunk_size)
    ]
    if len(partitioned_transcript[-1]["text"]) < 30:
        partitioned_transcript.pop()
    return partitioned_transcript

def create_table_from_file(file_path: str):
    try: 
        paragraphs = extract_paragraphs_from_pdf(file_path)
        csv_path = file_path[:-3] + "csv"
        write_paragraphs_to_csv(paragraphs, csv_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed parsing")
    
    try: 
        cursor.query("DROP TABLE IF EXISTS paper_summary").df()
        cursor.query(
            """CREATE TABLE IF NOT EXISTS paper_summary (text TEXT(200));"""
        ).execute()
        cursor.load(csv_path, "paper_summary", "csv").execute()

    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed loading CSV into table")
