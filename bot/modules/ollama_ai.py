"""
Ollama AI Integration
Handles all AI-powered text generation using local Ollama models
"""

import requests
import logging
from typing import Dict, List, Optional


class OllamaAI:
    """Interface for Ollama local AI models"""
    
    def __init__(self, config: Dict):
        self.base_url = config.get('base_url', 'http://localhost:11434')
        self.model = config.get('model', 'llama2')
        self.fallback_models = config.get('fallback_models', []) or []
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Initialized Ollama with model: {self.model}")
    
    def _generate_with_model(
        self,
        prompt: str,
        model: str,
        system_prompt: str = None,
        temperature: float = 0.7,
    ) -> str:
        """Generate text using a specific Ollama model."""
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "temperature": temperature,
            "stream": False,
        }

        if system_prompt:
            payload["system"] = system_prompt

        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()
        return result.get('response', '').strip()

    def _generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7) -> str:
        """Generate text using Ollama API"""
        models_to_try = [self.model, *self.fallback_models]
        last_error: Optional[Exception] = None

        for model in models_to_try:
            try:
                return self._generate_with_model(prompt, model, system_prompt, temperature)
            except Exception as e:
                last_error = e
                self.logger.error(f"Ollama generation failed (model={model}): {e}")

        raise last_error if last_error else RuntimeError("Ollama generation failed")
    
    def generate_linkedin_message(self, recipient_info: Dict) -> str:
        """Generate personalized LinkedIn connection message"""
        system_prompt = """You are a professional career assistant helping craft 
        personalized LinkedIn connection requests. Keep messages concise (under 300 characters), 
        professional, and genuine. Avoid being overly salesy."""
        
        prompt = f"""Generate a personalized LinkedIn connection request for:
        
Name: {recipient_info.get('name', 'Unknown')}
Title: {recipient_info.get('title', 'Unknown')}
Company: {recipient_info.get('company', 'Unknown')}
Industry: {recipient_info.get('industry', 'Unknown')}

My background: {recipient_info.get('my_background', 'Software Developer seeking opportunities')}
My interest: {recipient_info.get('my_interest', 'Interested in potential opportunities')}

Generate only the message text, no additional formatting or explanations."""
        
        return self._generate(prompt, system_prompt, temperature=0.8)
    
    def generate_linkedin_follow_up(self, context: str) -> str:
        """Generate follow-up message for LinkedIn"""
        system_prompt = """You are a professional career assistant. Generate brief, 
        engaging follow-up messages that reference previous conversations naturally."""
        
        prompt = f"""Generate a professional follow-up LinkedIn message based on this context:

{context}

Keep it under 500 characters, warm and professional."""
        
        return self._generate(prompt, system_prompt, temperature=0.7)
    
    def generate_cold_email(self, recipient_info: Dict) -> Dict[str, str]:
        """Generate cold email subject and body"""
        system_prompt = """You are an expert at writing professional cold emails for job seeking. 
        Write compelling, personalized emails that get responses. Be concise and action-oriented."""
        
        prompt = f"""Generate a cold email for job opportunities:

Recipient: {recipient_info.get('name', 'Hiring Manager')}
Company: {recipient_info.get('company', 'Unknown')}
Position Type: {recipient_info.get('position_type', 'Software Engineering')}

My Skills: {recipient_info.get('my_skills', 'Full-stack development, Python, React')}
My Experience: {recipient_info.get('my_experience', '2+ years in software development')}

Generate:
1. Subject line (under 60 characters)
2. Email body (under 300 words)

Format as:
SUBJECT: [subject line]
BODY:
[email body]"""
        
        result = self._generate(prompt, system_prompt, temperature=0.8)
        
        # Parse subject and body
        parts = result.split('BODY:', 1)
        subject = parts[0].replace('SUBJECT:', '').strip()
        body = parts[1].strip() if len(parts) > 1 else result
        
        return {
            'subject': subject,
            'body': body
        }

    def generate_cold_email_candidates(
        self,
        recipient_info: Dict,
        models: Optional[List[str]] = None,
        temperature: Optional[float] = None,
    ) -> List[Dict[str, str]]:
        """Generate multiple cold email candidates across models."""
        system_prompt = """You are an expert at writing professional cold emails for job seeking.
        Write compelling, personalized emails that get responses. Be concise and action-oriented."""

        prompt = f"""Generate a cold email for job opportunities:

Recipient: {recipient_info.get('name', 'Hiring Manager')}
Company: {recipient_info.get('company', 'Unknown')}
Position Type: {recipient_info.get('position_type', 'Software Engineering')}

My Skills: {recipient_info.get('my_skills', 'Full-stack development, Python, React')}
My Experience: {recipient_info.get('my_experience', '2+ years in software development')}

Generate:
1. Subject line (under 60 characters)
2. Email body (under 300 words)

Format as:
SUBJECT: [subject line]
BODY:
[email body]"""

        temperature_value = temperature if temperature is not None else 0.8
        models_to_use = models or [self.model, *self.fallback_models]
        candidates: List[Dict[str, str]] = []

        for model in models_to_use:
            try:
                result = self._generate_with_model(
                    prompt,
                    model,
                    system_prompt,
                    temperature_value,
                )

                parts = result.split('BODY:', 1)
                subject = parts[0].replace('SUBJECT:', '').strip()
                body = parts[1].strip() if len(parts) > 1 else result

                if subject or body:
                    candidates.append({
                        'subject': subject,
                        'body': body,
                        'model': model,
                    })
            except Exception as e:
                self.logger.error(f"Ollama candidate generation failed (model={model}): {e}")

        return candidates
    
    def generate_x_post(self, topic: str = "job search") -> str:
        """Generate engaging X (Twitter) post about job search"""
        system_prompt = """You are a social media expert. Create engaging, authentic 
        posts about professional development and job seeking. Use hashtags strategically. 
        Keep under 280 characters."""
        
        prompt = f"""Generate an engaging X (Twitter) post about: {topic}

Include relevant hashtags like #JobSearch #Hiring #TechJobs #OpenToWork
Keep it authentic, professional, and engaging."""
        
        return self._generate(prompt, system_prompt, temperature=0.9)
    
    def generate_cover_letter(self, job_info: Dict) -> str:
        """Generate tailored cover letter for job application"""
        system_prompt = """You are a professional resume and cover letter writer. 
        Create compelling, tailored cover letters that highlight relevant skills and experience."""
        
        prompt = f"""Generate a cover letter for:

Position: {job_info.get('position', 'Unknown')}
Company: {job_info.get('company', 'Unknown')}
Requirements: {job_info.get('requirements', 'Not specified')}

My Skills: {job_info.get('my_skills', '')}
My Experience: {job_info.get('my_experience', '')}
My Education: {job_info.get('my_education', '')}

Generate a professional cover letter (250-400 words)."""
        
        return self._generate(prompt, system_prompt, temperature=0.7)
    
    def personalize_template(self, template: str, variables: Dict) -> str:
        """Use AI to personalize a template with provided variables"""
        system_prompt = """You are helping personalize message templates. 
        Fill in the template naturally and ensure it flows well."""
        
        prompt = f"""Personalize this template with the following information:

Template:
{template}

Variables:
{variables}

Generate the final personalized message."""
        
        return self._generate(prompt, system_prompt, temperature=0.6)
    
    def improve_text(self, text: str, context: str = "professional message") -> str:
        """Improve existing text for better clarity and professionalism"""
        system_prompt = """You are an expert editor. Improve text for clarity, 
        professionalism, and impact while maintaining the original intent."""
        
        prompt = f"""Improve this {context}:

{text}

Make it more professional, clear, and impactful while keeping the same core message."""
        
        return self._generate(prompt, system_prompt, temperature=0.6)
    
    def check_model_availability(self) -> bool:
        """Check if Ollama is running and model is available"""
        try:
            url = f"{self.base_url}/api/tags"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            
            models = response.json().get('models', [])
            model_names = [m.get('name', '') for m in models]
            
            if self.model in model_names:
                self.logger.info(f"Model {self.model} is available")
                return True
            else:
                self.logger.warning(f"Model {self.model} not found. Available: {model_names}")
                return False
        
        except Exception as e:
            self.logger.error(f"Failed to connect to Ollama: {e}")
            return False
