#!/usr/bin/env python3
"""
Job Automation Bot - Main Controller
Automates job applications and outreach across multiple platforms
"""

import argparse
import logging
from datetime import datetime
from pathlib import Path

from modules.ollama_ai import OllamaAI
from modules.linkedin_bot import LinkedInBot
from modules.gmail_bot import GmailBot
from modules.x_bot import XBot
from modules.job_platform_bot import JobPlatformBot
from config.settings import Settings


class JobAutomationBot:
    """Main bot controller orchestrating all automation tasks"""
    
    def __init__(self, config_path: str = "config/config.yaml"):
        self.setup_logging()
        self.settings = Settings(config_path)
        self.ai = OllamaAI(self.settings.ollama_config)
        
        # Initialize platform bots
        self.linkedin = LinkedInBot(self.settings.linkedin_config, self.ai)
        self.gmail = GmailBot(self.settings.gmail_config, self.ai)
        self.x_bot = XBot(self.settings.x_config, self.ai)
        self.job_platforms = JobPlatformBot(self.settings.job_platforms_config, self.ai)
        
        self.logger.info("Job Automation Bot initialized successfully")
    
    def setup_logging(self):
        """Configure logging for the bot"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"bot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def run_linkedin_outreach(self, target_roles: list = None):
        """Send automated LinkedIn messages to HRs and recruiters"""
        self.logger.info("Starting LinkedIn outreach campaign")
        try:
            self.linkedin.connect()
            results = self.linkedin.send_connection_requests(target_roles)
            self.linkedin.send_messages()
            self.logger.info(f"LinkedIn outreach completed: {results}")
            return results
        except Exception as e:
            self.logger.error(f"LinkedIn outreach failed: {e}")
            raise
    
    def run_gmail_campaign(self, recipient_list: list = None):
        """Send cold emails via Gmail"""
        self.logger.info("Starting Gmail cold email campaign")
        try:
            results = self.gmail.send_cold_emails(recipient_list)
            self.logger.info(f"Gmail campaign completed: {results}")
            return results
        except Exception as e:
            self.logger.error(f"Gmail campaign failed: {e}")
            raise
    
    def run_x_engagement(self):
        """Post and engage on X (Twitter)"""
        self.logger.info("Starting X (Twitter) engagement")
        try:
            results = self.x_bot.post_job_search_updates()
            self.x_bot.engage_with_recruiters()
            self.logger.info(f"X engagement completed: {results}")
            return results
        except Exception as e:
            self.logger.error(f"X engagement failed: {e}")
            raise
    
    def run_job_applications(self, platforms: list = None):
        """Apply to jobs on various platforms"""
        self.logger.info("Starting automated job applications")
        try:
            if platforms is None:
                platforms = ['unstop', 'linkedin', 'naukri', 'internshala']
            
            results = {}
            for platform in platforms:
                platform_results = self.job_platforms.apply_to_jobs(platform)
                results[platform] = platform_results
            
            self.logger.info(f"Job applications completed: {results}")
            return results
        except Exception as e:
            self.logger.error(f"Job applications failed: {e}")
            raise
    
    def run_full_campaign(self):
        """Run complete automation across all platforms"""
        self.logger.info("Starting full automation campaign")
        
        results = {
            'linkedin': self.run_linkedin_outreach(),
            'gmail': self.run_gmail_campaign(),
            'x': self.run_x_engagement(),
            'job_platforms': self.run_job_applications()
        }
        
        self.logger.info("Full campaign completed successfully")
        return results
    
    def generate_daily_report(self):
        """Generate and save daily activity report"""
        report = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'linkedin_connections': self.linkedin.get_stats(),
            'emails_sent': self.gmail.get_stats(),
            'x_posts': self.x_bot.get_stats(),
            'applications': self.job_platforms.get_stats()
        }
        
        report_path = Path("logs") / f"report_{report['date']}.json"
        import json
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.logger.info(f"Daily report saved to {report_path}")
        return report


def main():
    parser = argparse.ArgumentParser(description='Job Automation Bot')
    parser.add_argument('--mode', choices=['full', 'linkedin', 'gmail', 'x', 'jobs'],
                        default='full', help='Operation mode')
    parser.add_argument('--config', default='config/config.yaml',
                        help='Path to configuration file')
    parser.add_argument('--report', action='store_true',
                        help='Generate daily report')
    
    args = parser.parse_args()
    
    bot = JobAutomationBot(args.config)
    
    if args.report:
        bot.generate_daily_report()
        return
    
    if args.mode == 'full':
        bot.run_full_campaign()
    elif args.mode == 'linkedin':
        bot.run_linkedin_outreach()
    elif args.mode == 'gmail':
        bot.run_gmail_campaign()
    elif args.mode == 'x':
        bot.run_x_engagement()
    elif args.mode == 'jobs':
        bot.run_job_applications()


if __name__ == "__main__":
    main()
