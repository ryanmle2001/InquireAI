from fastapi import FastAPI, Form, UploadFile, File, HTTPException
import openai

app = FastAPI()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        with open(f"uploads/{file.filename}", "wb") as buffer:
            buffer.write(file.file.read())
        return {"status": "success", "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="File upload failed.")

@app.post("/chat/")
async def chat_with_bot(message: str = Form(...)):
    # Dummy chatbot logic for this example
    return {"bot_response": f"Hello, you said: {message}"}

@app.post("/validate-key")
async def validate_key(apiKey: str):
    openai.api_key = apiKey

    try:
        # Make a test request to OpenAI (e.g., list the engines, which is a low-cost operation)
        engines = openai.Engine.list()
        return {"valid": True}
    except Exception as e:
        return {"valid": False}
