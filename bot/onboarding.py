#!/usr/bin/env python3
"""
Interactive onboarding to generate bot/config/config.yaml.
"""

from __future__ import annotations

import getpass
from pathlib import Path
from typing import List, Dict

import yaml
import requests


def prompt(label: str, default: str = "", secret: bool = False) -> str:
    suffix = f" [{default}]" if default else ""
    value = (
        getpass.getpass(f"{label}{suffix}: ")
        if secret
        else input(f"{label}{suffix}: ")
    )

    return value.strip() or default


def parse_csv(value: str, fallback: List[str]) -> List[str]:
    cleaned = [item.strip() for item in value.split(",") if item.strip()]

    return cleaned or fallback


def call_ollama(prompt: str, base_url: str, model: str) -> Dict:
    response = requests.post(
        f"{base_url}/api/generate",
        json={"model": model, "prompt": prompt, "stream": False, "format": "json"},
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    try:
        return yaml.safe_load(data.get("response", "")) or {}
    except Exception:
        return {}


def run_tag_wizard(profile: Dict, base_url: str, model: str, mcq_count: int = 5):
    prompt_questions = (
        "Create "
        + str(mcq_count)
        + " multiple-choice questions to determine smart outreach tags for LinkedIn and Gmail.\n\n"
        + "User profile (JSON):\n"
        + yaml.safe_dump(profile)
        + "\nReturn JSON only with this shape:\n"
        + '{"questions": [{"id": "q1", "question": "...", "options": '
        + '[{"id": "a", "text": "..."}, {"id": "b", "text": "..."}, '
        + '{"id": "c", "text": "..."}, {"id": "d", "text": "..."}]}]}'
    )

    result = call_ollama(prompt_questions, base_url, model)
    questions = result.get("questions", []) if isinstance(result, dict) else []

    if not questions:
        print("\nUnable to generate MCQs. Skipping wizard.\n")
        return [], [], []

    answers = {}
    for question in questions:
        print("\n" + question.get("question", ""))
        options = question.get("options", [])
        for option in options:
            print(f"  {option.get('id', '')}) {option.get('text', '')}")

        choice = input("Select option: ").strip().lower()
        answers[question.get("id", "")] = choice

    prompt_score = (
        "Assign smart outreach tags based on the answers.\n\n"
        + "User profile (JSON):\n"
        + yaml.safe_dump(profile)
        + "\nQuestions (JSON):\n"
        + yaml.safe_dump(questions)
        + "\nAnswers (JSON, key=question id, value=option id):\n"
        + yaml.safe_dump(answers)
        + "\nReturn JSON only with this shape:\n"
        + '{"linkedin_target_tags": ["..."], "gmail_target_tags": ["..."], "linkedin_message_tags": ["..."]}'
    )

    scored = call_ollama(prompt_score, base_url, model)

    linkedin_tags = scored.get("linkedin_target_tags", [])
    gmail_tags = scored.get("gmail_target_tags", [])
    message_tags = scored.get("linkedin_message_tags", [])

    return linkedin_tags, gmail_tags, message_tags


def run_persona_pack(profile: Dict, base_url: str, model: str, persona: str):
    prompt = (
        f"Select outreach tags for persona pack: {persona}.\n\n"
        + "User profile (JSON):\n"
        + yaml.safe_dump(profile)
        + "\nReturn JSON only with this shape:\n"
        + '{"linkedin_target_tags": ["..."], "gmail_target_tags": ["..."], "linkedin_message_tags": ["..."]}'
    )
    result = call_ollama(prompt, base_url, model)
    return (
        result.get("linkedin_target_tags", []),
        result.get("gmail_target_tags", []),
        result.get("linkedin_message_tags", []),
    )


def run_message_variants(profile: Dict, base_url: str, model: str):
    prompt = (
        "Generate three LinkedIn message variants (short, medium, long).\n\n"
        + "User profile (JSON):\n"
        + yaml.safe_dump(profile)
        + "\nReturn JSON only with this shape:\n"
        + '{"short": "...", "medium": "...", "long": "..."}'
    )
    result = call_ollama(prompt, base_url, model)
    return {
        "short": result.get("short", ""),
        "medium": result.get("medium", ""),
        "long": result.get("long", ""),
    }


def main() -> None:
    print("\nHireMe Onboarding - generate bot/config/config.yaml\n")

    ollama_base_url = prompt("Ollama base URL", "http://localhost:11434")
    ollama_model = prompt("Ollama model", "llama2")
    ollama_temperature = float(prompt("Ollama temperature", "0.7"))

    name = prompt("Your name", "Your Name")
    email = prompt("Your email", "your.email@example.com")
    phone = prompt("Phone", "+1234567890")
    title = prompt("Title", "Software Developer")
    linkedin_profile = prompt("LinkedIn profile", "https://linkedin.com/in/yourprofile")
    portfolio = prompt("Portfolio", "https://yourportfolio.com")
    github = prompt("GitHub", "https://github.com/yourusername")
    skills = prompt("Skills", "Python, JavaScript, React, Node.js, Docker")
    experience = prompt("Experience", "3+ years in full-stack development")
    education = prompt("Education", "B.Tech in Computer Science")
    resume_path = prompt("Resume path", "/path/to/your/resume.pdf")

    linkedin_email = prompt("LinkedIn email", "your.linkedin.email@gmail.com")
    linkedin_password = prompt("LinkedIn password", "", secret=True)
    linkedin_headless = prompt("LinkedIn headless (true/false)", "false") == "true"
    target_roles = parse_csv(
        prompt(
            "LinkedIn target roles",
            "HR Manager, Technical Recruiter, Talent Acquisition",
        ),
        ["HR Manager", "Technical Recruiter", "Talent Acquisition"],
    )
    target_industry = prompt("LinkedIn target industry", "Technology")
    job_titles = parse_csv(
        prompt(
            "LinkedIn job titles",
            "Software Engineer, Python Developer, Full Stack Developer",
        ),
        ["Software Engineer", "Python Developer", "Full Stack Developer"],
    )
    target_tags = parse_csv(
        prompt("LinkedIn target tags", ""),
        [],
    )
    message_template = prompt("LinkedIn message template", "")
    message_tags = parse_csv(prompt("LinkedIn message tags", ""), [])
    message_images = parse_csv(prompt("LinkedIn message image paths", ""), [])

    gmail_email = prompt("Gmail", "your.gmail@gmail.com")
    gmail_app_password = prompt("Gmail app password", "", secret=True)
    recipients_csv = prompt("Recipients CSV path", "config/recipients.csv")
    gmail_attachments = parse_csv(prompt("Gmail attachment paths", ""), [])
    gmail_target_tags = parse_csv(prompt("Gmail recipient tags", ""), [])

    run_wizard = prompt("Run smart tag wizard? (y/n)", "n").lower() == "y"
    if run_wizard:
        profile_snapshot = {
            "name": name,
            "title": title,
            "skills": skills,
            "experience": experience,
            "education": education,
            "target_roles": target_roles,
            "target_industry": target_industry,
            "job_titles": job_titles,
        }
        try:
            wizard_linkedin, wizard_gmail, wizard_message = run_tag_wizard(
                profile_snapshot,
                ollama_base_url,
                ollama_model,
                5,
            )
            if wizard_linkedin:
                target_tags = wizard_linkedin
            if wizard_gmail:
                gmail_target_tags = wizard_gmail
            if wizard_message:
                message_tags = wizard_message
        except Exception:
            print("\nSmart tag wizard failed. Continuing without it.\n")

    persona_pack = prompt("Apply persona pack (cto/hr/founder/skip)", "skip").lower()
    if persona_pack in {"cto", "hr", "founder"}:
        profile_snapshot = {
            "name": name,
            "title": title,
            "skills": skills,
            "experience": experience,
            "education": education,
            "target_roles": target_roles,
            "target_industry": target_industry,
            "job_titles": job_titles,
        }
        try:
            persona_linkedin, persona_gmail, persona_message = run_persona_pack(
                profile_snapshot,
                ollama_base_url,
                ollama_model,
                persona_pack,
            )
            if persona_linkedin:
                target_tags = persona_linkedin
            if persona_gmail:
                gmail_target_tags = persona_gmail
            if persona_message:
                message_tags = persona_message
        except Exception:
            print("\nPersona pack failed. Continuing without it.\n")

    message_variants = {"short": "", "medium": "", "long": ""}
    run_variants = prompt("Generate message variants? (y/n)", "n").lower() == "y"
    if run_variants:
        profile_snapshot = {
            "name": name,
            "title": title,
            "skills": skills,
            "experience": experience,
            "education": education,
            "target_roles": target_roles,
            "target_industry": target_industry,
            "job_titles": job_titles,
        }
        try:
            message_variants = run_message_variants(
                profile_snapshot,
                ollama_base_url,
                ollama_model,
            )
        except Exception:
            print("\nMessage variants failed. Continuing without them.\n")

    x_api_key = prompt("X API key", "")
    x_api_secret = prompt("X API secret", "")
    x_access_token = prompt("X access token", "")
    x_access_token_secret = prompt("X access token secret", "")
    x_bearer_token = prompt("X bearer token", "")

    job_keywords = parse_csv(
        prompt("Job keywords", "Python Developer, Software Engineer, Full Stack Developer"),
        ["Python Developer", "Software Engineer", "Full Stack Developer"],
    )

    config = {
        "ollama": {
            "base_url": ollama_base_url,
            "model": ollama_model,
            "temperature": ollama_temperature,
        },
        "user_profile": {
            "name": name,
            "email": email,
            "phone": phone,
            "title": title,
            "linkedin": linkedin_profile,
            "portfolio": portfolio,
            "github": github,
            "skills": skills,
            "experience": experience,
            "education": education,
            "resume_path": resume_path,
        },
        "linkedin": {
            "email": linkedin_email,
            "password": linkedin_password or "your_linkedin_password",
            "headless": linkedin_headless,
            "target_roles": target_roles,
            "target_industry": target_industry,
            "job_titles": job_titles,
            "target_tags": target_tags,
            "daily_connection_limit": 20,
            "daily_message_limit": 10,
            "daily_application_limit": 15,
            "max_connections_per_search": 10,
            "my_background": "Experienced software developer passionate about building scalable applications",
            "message_template": message_template,
            "message_tags": message_tags,
            "message_image_paths": message_images,
            "persona_pack": persona_pack if persona_pack != "skip" else "",
            "message_variants": message_variants,
        },
        "gmail": {
            "email": gmail_email,
            "app_password": gmail_app_password or "your_gmail_app_password",
            "recipients_csv": recipients_csv,
            "daily_email_limit": 50,
            "delay_between_emails": 60,
            "my_name": name,
            "my_title": title,
            "my_phone": phone,
            "my_linkedin": linkedin_profile,
            "my_portfolio": portfolio,
            "my_skills": "Python, React, Node.js, AWS",
            "my_experience": "3+ years building web applications",
            "attachment_paths": gmail_attachments,
            "target_tags": gmail_target_tags,
        },
        "x_twitter": {
            "api_key": x_api_key or "your_x_api_key",
            "api_secret": x_api_secret or "your_x_api_secret",
            "access_token": x_access_token or "your_x_access_token",
            "access_token_secret": x_access_token_secret or "your_x_access_token_secret",
            "bearer_token": x_bearer_token or "your_x_bearer_token",
            "daily_post_limit": 3,
            "daily_engagement_limit": 20,
            "delay_between_posts": 3600,
            "auto_reply": False,
            "post_schedule": ["09:00", "13:00", "18:00"],
            "recruiters_to_follow": [],
        },
        "job_platforms": {
            "headless": False,
            "daily_application_limit": 15,
            "unstop_email": "your.unstop.email@gmail.com",
            "unstop_password": "your_unstop_password",
            "naukri_email": "your.naukri.email@gmail.com",
            "naukri_password": "your_naukri_password",
            "internshala_email": "your.internshala.email@gmail.com",
            "internshala_password": "your_internshala_password",
            "job_keywords": job_keywords,
            "preferred_location": "Remote",
            "job_category": "Software Development",
            "my_name": name,
            "my_email": email,
            "my_phone": phone,
            "my_skills": "Python, JavaScript, React",
            "my_experience": "3 years",
            "my_education": "B.Tech Computer Science",
            "resume_path": resume_path,
        },
    }

    config_path = Path(__file__).parent / "config" / "config.yaml"
    config_path.parent.mkdir(parents=True, exist_ok=True)

    with config_path.open("w", encoding="utf-8") as file:
        yaml.safe_dump(config, file, sort_keys=False)

    print(f"\nConfig saved to {config_path}\n")


if __name__ == "__main__":
    main()
