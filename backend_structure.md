# Backend Structure & API Recommendation

Although this application runs as a serverless/client-side AI application for demonstration, a production Python backend should follow this structure using FastAPI:

## Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── config.py            # Environment variables
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── analysis.py  # /analyze endpoint
│   │   │   │   ├── jobs.py      # /jobs endpoints
│   │   │   │   └── auth.py      # /auth endpoints
│   │   │   └── api.py       # Router aggregator
│   ├── core/
│   │   ├── security.py      # JWT handling
│   │   └── database.py      # DB connection (PostgreSQL)
│   ├── services/
│   │   ├── gemini_service.py # Google GenAI implementation
│   │   └── resume_parser.py  # PyPDF2 or textract logic
│   ├── models/
│   │   ├── user.py          # Pydantic models
│   │   └── analysis.py      # Response schemas
│   └── utils/
├── requirements.txt
└── .env
```

## Recommended API Endpoints

1.  **POST /api/v1/analyze**
    *   **Input**: JSON Body `{ name, skills, country, education... }` or `multipart/form-data` for resume upload.
    *   **Logic**: Calls `gemini_service.analyze_profile(data)`.
    *   **Output**: JSON adhering to the `AnalysisResult` schema used in the frontend.

2.  **POST /api/v1/analyze/upload**
    *   **Input**: PDF File.
    *   **Logic**: Extracts text -> Calls Analysis.

3.  **GET /api/v1/jobs/trends?field={field}**
    *   **Logic**: Returns cached trend data for specific fields.

## Integration

To connect the React Frontend to this backend:
1.  Update `services/geminiService.ts` to fetch from `http://localhost:8000/api/v1/analyze` instead of calling Gemini SDK directly.
2.  Use `axios` or `fetch` for the HTTP requests.
