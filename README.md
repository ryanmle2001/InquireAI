# Inquire AI
<p align="center">
  <img src="assets/logo.png" alt="InquireAI_Logo">
</p>

## Overview
This app lets you upload a research paper and ask questions about the text content in the paper. You will only need to upload PDF of the paper and an OpenAI API key to begin!

This app is powered by [EvaDB](https://github.com/georgia-tech-db/eva), a Python-based database system for AI applications developed by Georgia Tech's DB Group.

## Credits 
This project takes inspiration from the work done by https://github.com/yulaicui/youtube_video_qa. 

## Setup to Run Locally
Ensure that the local Python version is >= 3.8. 

### Backend Setup 
Create and activate virtual environment:
```
cd backend
python -m venv venv 
source venv/bin/activate 
```

Install the required libraries:

```
pip install -r requirements.txt
```

Run the backend:

```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

To deactivate the virtual environment:

```
deactivate
```

### Frontend Setup 
Install npm packages:
```
cd inquire_ai
npm install  
```

Launch UI
```
npm start
```

## Example
<p align="center">
  <img src="assets/example1.png" alt="example">
</p>

