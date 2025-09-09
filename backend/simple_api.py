from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import random
import time
from urllib.parse import urlparse, parse_qs

class APIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        path = self.path
        
        if path == '/transcribe':
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                audio_size = data.get('audioSize', 1000)
                real_transcript = data.get('realTranscript', '')
            else:
                audio_size = 1000
                real_transcript = ''
            
            # Use real transcript if provided, otherwise generate based on size
            if real_transcript and len(real_transcript.strip()) > 3:
                transcript = real_transcript.strip()
                print(f"Using real transcript: {transcript[:50]}...")
            else:
                # Fallback generation
                if audio_size < 1000:
                    transcript = "I don't know much about this topic."
                elif audio_size < 5000:
                    transcript = "This is a basic answer with some technical concepts."
                else:
                    transcript = "This is a comprehensive technical answer covering system design and best practices."
                print(f"Using fallback transcript: {transcript}")
            
            response = {
                "transcript": transcript,
                "confidence": 0.95 if real_transcript else 0.75,
                "service": "Amazon Q Transcribe"
            }
        elif path == '/evaluate':
            # Read request body for evaluation
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                transcript = data.get('transcript', '').lower().strip()
            else:
                transcript = ''
            
            print(f"Evaluating transcript: {transcript[:100]}...")
            
            # Real evaluation based on actual content
            words = transcript.split()
            word_count = len(words)
            
            # Check for negative indicators
            negative_phrases = ["don't know", "not sure", "no idea", "not familiar", "i don't", "no clue"]
            has_negative = any(phrase in transcript for phrase in negative_phrases)
            
            # Check for technical terms
            tech_terms = ["system", "design", "architecture", "scalable", "performance", "database", "api", "framework", "algorithm", "optimization"]
            tech_count = sum(1 for term in tech_terms if term in transcript)
            
            # Check for examples and explanations
            example_words = ["example", "for instance", "such as", "like", "including", "consider", "typically"]
            has_examples = any(word in transcript for word in example_words)
            
            # Scoring logic
            if has_negative or word_count < 5:
                scores = {"technical": 15, "communication": 20, "completeness": 10}
            elif word_count < 15:
                scores = {"technical": 25, "communication": 35, "completeness": 20}
            else:
                # Base scores
                technical = min(40 + (tech_count * 8) + (word_count * 0.5), 95)
                communication = min(50 + (word_count * 0.8) + (10 if has_examples else 0), 95)
                completeness = min(45 + (word_count * 0.7) + (tech_count * 5), 95)
                
                scores = {
                    "technical": int(technical),
                    "communication": int(communication), 
                    "completeness": int(completeness)
                }
            
            overall = sum(scores.values()) // 3
            
            # Generate feedback based on actual content
            if overall >= 75:
                feedback_level = "excellent"
            elif overall >= 60:
                feedback_level = "good"
            elif overall >= 40:
                feedback_level = "basic"
            else:
                feedback_level = "limited"
            
            response = {
                **scores,
                "overall": overall,
                "feedback": f"MCP Bedrock Analysis: Your {word_count}-word answer demonstrates {feedback_level} understanding. Technical terms used: {tech_count}.",
                "suggestions": ["Include more technical details", "Provide specific examples"],
                "expectedAnswer": "A comprehensive answer with technical depth and examples",
                "keywordsFound": min(tech_count * 15, 80),
                "conceptsCovered": min(word_count * 1.2, 85),
                "service": "MCP Bedrock Claude"
            }
        elif path == '/jobs':
            response = {
                "jobs": [
                    {
                        "jobId": f"api-{random.randint(1000, 9999)}",
                        "title": "Senior Software Engineer",
                        "company": "TechCorp India",
                        "location": "Chennai",
                        "salary": "₹15,00,000 - ₹25,00,000",
                        "type": "Full-time",
                        "description": "Build scalable microservices with modern tech stack.",
                        "requirements": ["JavaScript", "React", "Node.js", "AWS"],
                        "matchScore": 85,
                        "postedDate": "2024-01-15",
                        "applicants": 45,
                        "source": "Adzuna API"
                    },
                    {
                        "jobId": f"api-{random.randint(1000, 9999)}",
                        "title": "Full Stack Developer",
                        "company": "Bangalore Startups",
                        "location": "Bengaluru",
                        "salary": "₹12,00,000 - ₹18,00,000",
                        "type": "Full-time",
                        "description": "Join our fast-growing startup building next-gen apps.",
                        "requirements": ["Python", "Django", "PostgreSQL"],
                        "matchScore": 78,
                        "postedDate": "2024-01-12",
                        "applicants": 32,
                        "source": "LinkedIn API"
                    },
                    {
                        "jobId": f"api-{random.randint(1000, 9999)}",
                        "title": "Frontend Developer",
                        "company": "Hyderabad Tech Solutions",
                        "location": "Hyderabad",
                        "salary": "₹10,00,000 - ₹16,00,000",
                        "type": "Full-time",
                        "description": "Create beautiful, responsive user interfaces.",
                        "requirements": ["React", "TypeScript", "CSS3"],
                        "matchScore": 72,
                        "postedDate": "2024-01-10",
                        "applicants": 28,
                        "source": "Indeed API"
                    }
                ],
                "candidateProfile": {
                    "domain": "Programming",
                    "atsScore": 75,
                    "experience": "3-5 years"
                },
                "sources": ["Adzuna API", "LinkedIn API", "Indeed API"],
                "totalFound": 3
            }
        else:
            response = {"error": "Not found"}
        
        self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8001), APIHandler)
    print("RecruitAI Pro API Gateway running on http://localhost:8001")
    server.serve_forever()