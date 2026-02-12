"""
Settings Configuration Module
Handles loading and managing bot configuration
"""

import yaml
import logging
from pathlib import Path
from typing import Dict, Any


class Settings:
    """Manages bot configuration settings"""
    
    def __init__(self, config_path: str = "config/config.yaml"):
        self.config_path = Path(config_path)
        self.logger = logging.getLogger(__name__)
        self.config = self._load_config()
        
        # Parse individual configurations
        self.ollama_config = self.config.get('ollama', {})
        self.linkedin_config = self.config.get('linkedin', {})
        self.gmail_config = self.config.get('gmail', {})
        self.x_config = self.config.get('x_twitter', {})
        self.job_platforms_config = self.config.get('job_platforms', {})
        self.user_profile = self.config.get('user_profile', {})
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            self.logger.warning(f"Config file not found: {self.config_path}")
            self.logger.info("Creating default configuration")
            self._create_default_config()
        
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
            
            self.logger.info(f"Configuration loaded from {self.config_path}")
            return config
        
        except Exception as e:
            self.logger.error(f"Failed to load config: {e}")
            return {}
    
    def _create_default_config(self):
        """Create default configuration file"""
        default_config = {
            'ollama': {
                'base_url': 'http://localhost:11434',
                'model': 'llama2',
                'temperature': 0.7
            },
            
            'user_profile': {
                'name': 'Your Name',
                'email': 'your.email@gmail.com',
                'phone': '+1234567890',
                'title': 'Software Developer',
                'linkedin': 'https://linkedin.com/in/yourprofile',
                'portfolio': 'https://yourportfolio.com',
                'github': 'https://github.com/yourusername',
                'skills': 'Python, JavaScript, React, Node.js, Docker',
                'experience': '3+ years in full-stack development',
                'education': 'B.Tech in Computer Science',
                'resume_path': '/path/to/your/resume.pdf'
            },
            
            'linkedin': {
                'email': 'your.linkedin.email@gmail.com',
                'password': 'your_linkedin_password',
                'headless': False,
                'target_roles': ['HR Manager', 'Technical Recruiter', 'Talent Acquisition'],
                'target_tags': [],
                'target_industry': 'Technology',
                'job_titles': ['Software Engineer', 'Python Developer', 'Full Stack Developer'],
                'daily_connection_limit': 20,
                'daily_message_limit': 10,
                'daily_application_limit': 15,
                'max_connections_per_search': 10,
                'my_background': 'Experienced software developer passionate about building scalable applications',
                'message_template': '',
                'message_tags': [],
                'message_image_paths': [],
                'persona_pack': '',
                'message_variants': {
                    'short': '',
                    'medium': '',
                    'long': ''
                }
            },
            
            'gmail': {
                'email': 'your.gmail@gmail.com',
                'app_password': 'your_gmail_app_password',  # Use App Password, not regular password
                'recipients_csv': 'config/recipients.csv',
                'daily_email_limit': 50,
                'delay_between_emails': 60,  # seconds
                'my_name': 'Your Name',
                'my_title': 'Software Developer',
                'my_phone': '+1234567890',
                'my_linkedin': 'https://linkedin.com/in/yourprofile',
                'my_portfolio': 'https://yourportfolio.com',
                'my_skills': 'Python, React, Node.js, AWS',
                'my_experience': '3+ years building web applications',
                'attachment_paths': [],
                'target_tags': []
            },
            
            'x_twitter': {
                'api_key': 'your_x_api_key',
                'api_secret': 'your_x_api_secret',
                'access_token': 'your_x_access_token',
                'access_token_secret': 'your_x_access_token_secret',
                'bearer_token': 'your_x_bearer_token',
                'daily_post_limit': 3,
                'daily_engagement_limit': 20,
                'delay_between_posts': 3600,  # 1 hour
                'auto_reply': False,
                'post_schedule': ['09:00', '13:00', '18:00'],
                'recruiters_to_follow': []
            },
            
            'job_platforms': {
                'headless': False,
                'daily_application_limit': 15,
                
                # Unstop
                'unstop_email': 'your.unstop.email@gmail.com',
                'unstop_password': 'your_unstop_password',
                
                # Naukri
                'naukri_email': 'your.naukri.email@gmail.com',
                'naukri_password': 'your_naukri_password',
                
                # Internshala
                'internshala_email': 'your.internshala.email@gmail.com',
                'internshala_password': 'your_internshala_password',
                
                # Common settings
                'job_keywords': ['Python Developer', 'Software Engineer', 'Full Stack Developer'],
                'preferred_location': 'Remote',
                'job_category': 'Software Development',
                'my_name': 'Your Name',
                'my_email': 'your.email@gmail.com',
                'my_phone': '+1234567890',
                'my_skills': 'Python, JavaScript, React',
                'my_experience': '3 years',
                'my_education': 'B.Tech Computer Science',
                'resume_path': '/path/to/resume.pdf'
            }
        }
        
        # Create config directory if it doesn't exist
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save default config
        with open(self.config_path, 'w') as f:
            yaml.dump(default_config, f, default_flow_style=False, sort_keys=False)
        
        self.logger.info(f"Default configuration created at {self.config_path}")
        self.logger.warning("Please update the configuration file with your actual credentials!")
    
    def get(self, key: str, default=None):
        """Get configuration value by key"""
        return self.config.get(key, default)
    
    def update(self, key: str, value: Any):
        """Update configuration value"""
        self.config[key] = value
        self._save_config()
    
    def _save_config(self):
        """Save current configuration to file"""
        try:
            with open(self.config_path, 'w') as f:
                yaml.dump(self.config, f, default_flow_style=False, sort_keys=False)
            
            self.logger.info("Configuration saved")
        
        except Exception as e:
            self.logger.error(f"Failed to save config: {e}")
    
    def validate(self) -> bool:
        """Validate configuration"""
        required_fields = {
            'ollama': ['base_url', 'model'],
            'user_profile': ['name', 'email']
        }
        
        for section, fields in required_fields.items():
            if section not in self.config:
                self.logger.error(f"Missing configuration section: {section}")
                return False
            
            for field in fields:
                if field not in self.config[section]:
                    self.logger.error(f"Missing required field: {section}.{field}")
                    return False
        
        return True
