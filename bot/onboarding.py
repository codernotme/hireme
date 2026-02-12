#!/usr/bin/env python3
"""
Interactive onboarding to generate bot/config/config.yaml.
"""

from __future__ import annotations

import getpass
from pathlib import Path
from typing import List

import yaml


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


def main() -> None:
    print("\nHireMe Onboarding - generate bot/config/config.yaml\n")

    ollama_base_url = prompt("Ollama base URL", "http://localhost:11434")
    ollama_model = prompt("Ollama model", "llama2")
    ollama_temperature = float(prompt("Ollama temperature", "0.7"))

    name = prompt("Your name", "codernotme")
    email = prompt("Your email", "your.email@gmail.com")
    phone = prompt("Phone", "+1234567890")
    title = prompt("Title", "Software Developer")
    linkedin_profile = prompt("LinkedIn profile", "https://linkedin.com/in/yourprofile")
    portfolio = prompt("Portfolio", "https://yourportfolio.com")
    github = prompt("GitHub", "https://github.com/codernotme")
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

    gmail_email = prompt("Gmail", "your.gmail@gmail.com")
    gmail_app_password = prompt("Gmail app password", "", secret=True)
    recipients_csv = prompt("Recipients CSV path", "config/recipients.csv")

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
            "daily_connection_limit": 20,
            "daily_message_limit": 10,
            "daily_application_limit": 15,
            "max_connections_per_search": 10,
            "my_background": "Experienced software developer passionate about building scalable applications",
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
