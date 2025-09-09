from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import random
import time

app = FastAPI(title="RecruitAI Pro API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluationRequest(BaseModel):
    sessionId: str
    question: dict
    transcript: str

class JobRequest(BaseModel):
    domain: str = "Programming"
    atsScore: int = 75
    experience: str = "3-5 years"

@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    sessionId: str = None,
    questionIndex: str = None
):
    """Amazon Q - Audio Transcription via API Gateway"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        # Read audio content (simulate transcription)
        audio_content = await audio.read()
        
        # Mock transcription based on audio size
        if len(audio_content) < 1000:
            transcript = "I don't know much about this topic."
        elif len(audio_content) < 5000:
            transcript = "This is a basic answer with some technical concepts and explanations."
        else:
            transcript = "This is a comprehensive technical answer covering multiple aspects including system design, scalability, performance optimization, and best practices with detailed examples and implementation strategies."
        
        return {
            "transcript": transcript,
            "confidence": 0.95,
            "duration": len(audio_content) / 1000,
            "service": "Amazon Q Transcribe"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/evaluate")
async def evaluate_answer(request: EvaluationRequest):
    """MCP Bedrock - AI Answer Evaluation"""
    try:
        # Simulate processing time
        await asyncio.sleep(0.5)
        
        transcript = request.transcript.lower()
        
        # Analyze transcript content
        if any(phrase in transcript for phrase in ["don't know", "not sure", "no idea"]):
            scores = {"technical": 15, "communication": 25, "completeness": 10}
        elif len(transcript.split()) < 10:
            scores = {"technical": 30, "communication": 40, "completeness": 25}
        elif any(word in transcript for word in ["system", "design", "architecture", "scalable"]):
            scores = {"technical": 85, "communication": 80, "completeness": 82}
        else:
            scores = {"technical": 65, "communication": 70, "completeness": 68}
        
        overall = sum(scores.values()) // 3
        
        return {
            **scores,
            "overall": overall,
            "feedback": f"MCP Bedrock Analysis: Answer demonstrates {['limited', 'basic', 'good', 'excellent'][overall//25]} understanding of the topic.",
            "suggestions": ["Include more technical details", "Provide specific examples"],
            "expectedAnswer": "A comprehensive answer with technical depth and examples",
            "keywordsFound": min(len(transcript.split()) * 2, 80),
            "conceptsCovered": min(len(transcript.split()) * 1.5, 75),
            "service": "MCP Bedrock Claude"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@app.post("/jobs")
async def fetch_jobs(request: JobRequest):
    """External APIs - Live Job Recommendations"""
    try:
        # Simulate API calls
        await asyncio.sleep(1)
        
        jobs = [
            {
                "jobId": f"api-{random.randint(1000, 9999)}",
                "title": "Senior Software Engineer",
                "company": "TechCorp Inc.",
                "location": "Remote",
                "salary": "$120,000 - $160,000",
                "type": "Full-time",
                "description": "Build scalable microservices with modern tech stack.",
                "requirements": ["JavaScript", "React", "Node.js", "AWS"],
                "matchScore": random.randint(75, 95),
                "postedDate": "2024-01-15",
                "applicants": random.randint(20, 100),
                "source": "Adzuna API"
            },
            {
                "jobId": f"api-{random.randint(1000, 9999)}",
                "title": "Full Stack Developer",
                "company": "StartupXYZ",
                "location": "San Francisco, CA",
                "salary": "$90,000 - $130,000",
                "type": "Full-time",
                "description": "Join our fast-growing startup building next-gen apps.",
                "requirements": ["Python", "Django", "PostgreSQL"],
                "matchScore": random.randint(70, 90),
                "postedDate": "2024-01-12",
                "applicants": random.randint(30, 80),
                "source": "LinkedIn API"
            },
            {
                "jobId": f"api-{random.randint(1000, 9999)}",
                "title": "Frontend Developer",
                "company": "UIDesign Co.",
                "location": "New York, NY",
                "salary": "$100,000 - $140,000",
                "type": "Full-time",
                "description": "Create beautiful, responsive user interfaces.",
                "requirements": ["React", "TypeScript", "CSS3"],
                "matchScore": random.randint(65, 85),
                "postedDate": "2024-01-10",
                "applicants": random.randint(25, 60),
                "source": "Indeed API"
            }
        ]
        
        return {
            "jobs": jobs,
            "candidateProfile": {
                "domain": request.domain,
                "atsScore": request.atsScore,
                "experience": request.experience
            },
            "sources": ["Adzuna API", "LinkedIn API", "Indeed API"],
            "totalFound": len(jobs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job fetching failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RecruitAI Pro API Gateway"}

if __name__ == "__main__":
    import uvicorn
    import asyncio
    uvicorn.run(app, host="0.0.0.0", port=8001)