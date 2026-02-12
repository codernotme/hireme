"""
Gmail Automation Bot
Handles cold email campaigns for job outreach
"""

import logging
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, List, Optional
import csv
from pathlib import Path


class GmailBot:
    """Automates cold email campaigns via Gmail"""
    
    def __init__(self, config: Dict, ai_engine):
        self.config = config
        self.ai = ai_engine
        self.logger = logging.getLogger(__name__)
        self.log_dir = Path(__file__).resolve().parent.parent / 'logs'
        self.stats = {
            'emails_sent': 0,
            'emails_failed': 0
        }
        
        # Gmail SMTP settings
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
    
    def _connect_smtp(self):
        """Connect to Gmail SMTP server"""
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.config['email'], self.config['app_password'])
            self.logger.info("Connected to Gmail SMTP")
            return server
        except Exception as e:
            self.logger.error(f"SMTP connection failed: {e}")
            raise
    
    def load_recipients(self, csv_file: str = None) -> List[Dict]:
        """Load recipient list from CSV file"""
        if csv_file is None:
            csv_file = self.config.get('recipients_csv', 'config/recipients.csv')
        
        recipients = []
        csv_path = Path(csv_file)
        
        if not csv_path.exists():
            self.logger.warning(f"Recipients file not found: {csv_file}")
            return []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    recipients.append(row)

            target_tags = set(self.config.get('target_tags', []))
            if target_tags:
                filtered = []
                for recipient in recipients:
                    tags_raw = recipient.get('tags', '')
                    tags = {t.strip() for t in tags_raw.split(',') if t.strip()}
                    if tags & target_tags:
                        filtered.append(recipient)
                recipients = filtered
            
            self.logger.info(f"Loaded {len(recipients)} recipients from {csv_file}")
            return recipients
        
        except Exception as e:
            self.logger.error(f"Failed to load recipients: {e}")
            return []
    
    def create_email(self, recipient: Dict) -> MIMEMultipart:
        """Create personalized email message"""
        # Generate AI-powered email content
        recipient_info = {
            'name': recipient.get('name', 'Hiring Manager'),
            'company': recipient.get('company', 'Your Company'),
            'position_type': recipient.get('position_type', 'Software Engineering'),
            'my_skills': self.config.get('my_skills', 'Python, React, Node.js'),
            'my_experience': self.config.get('my_experience', '3+ years in software development')
        }
        
        email_content = self.ai.generate_cold_email(recipient_info)
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['From'] = self.config['email']
        msg['To'] = recipient['email']
        msg['Subject'] = email_content['subject']
        
        # Create text and HTML versions
        text_body = email_content['body']
        
        # Enhanced HTML version with professional formatting
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            {email_content['body'].replace(chr(10), '<br>')}
            
            <br><br>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 5px 0;"><strong>{self.config.get('my_name', 'Your Name')}</strong></p>
                <p style="margin: 5px 0;">{self.config.get('my_title', 'Software Developer')}</p>
                <p style="margin: 5px 0;">
                    Email: {self.config['email']}<br>
                    Phone: {self.config.get('my_phone', '')}
                </p>
                {f'<p style="margin: 5px 0;">LinkedIn: <a href="{self.config.get("my_linkedin", "")}">{self.config.get("my_linkedin", "")}</a></p>' if self.config.get('my_linkedin') else ''}
                {f'<p style="margin: 5px 0;">Portfolio: <a href="{self.config.get("my_portfolio", "")}">{self.config.get("my_portfolio", "")}</a></p>' if self.config.get('my_portfolio') else ''}
            </div>
        </body>
        </html>
        """
        
        # Attach both versions
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        
        msg.attach(part1)
        msg.attach(part2)

        attachment_paths = self.config.get('attachment_paths', [])
        for attachment in attachment_paths:
            if not attachment:
                continue
            path = Path(attachment)
            if not path.exists():
                self.logger.warning(f"Attachment not found: {attachment}")
                continue

            try:
                with open(path, 'rb') as file:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(file.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename="{path.name}"'
                )
                msg.attach(part)
            except Exception as e:
                self.logger.warning(f"Failed to attach {attachment}: {e}")
        
        return msg
    
    def send_cold_emails(self, recipient_list: List[Dict] = None) -> Dict:
        """Send cold emails to recipients"""
        if recipient_list is None:
            recipient_list = self.load_recipients()
        
        if not recipient_list:
            self.logger.warning("No recipients to send emails to")
            return self.stats
        
        server = self._connect_smtp()
        
        daily_limit = self.config.get('daily_email_limit', 50)
        delay_between_emails = self.config.get('delay_between_emails', 60)  # seconds
        
        for i, recipient in enumerate(recipient_list):
            if self.stats['emails_sent'] >= daily_limit:
                self.logger.info("Daily email limit reached")
                break
            
            try:
                # Create personalized email
                msg = self.create_email(recipient)
                
                # Send email
                server.send_message(msg)
                
                self.stats['emails_sent'] += 1
                self.logger.info(f"Email sent to {recipient.get('name', 'Unknown')} ({recipient['email']})")
                
                # Log sent email
                self._log_sent_email(recipient, msg['Subject'])
                
                # Rate limiting
                if i < len(recipient_list) - 1:
                    time.sleep(delay_between_emails)
            
            except Exception as e:
                self.stats['emails_failed'] += 1
                self.logger.error(f"Failed to send email to {recipient.get('email', 'Unknown')}: {e}")
                continue
        
        server.quit()
        self.logger.info(f"Email campaign completed. Sent: {self.stats['emails_sent']}, Failed: {self.stats['emails_failed']}")
        
        return self.stats
    
    def send_follow_up_emails(self, days_since_last: int = 7):
        """Send follow-up emails to non-respondents"""
        # Load sent email log
        sent_log = self._load_sent_log()
        
        # Filter for follow-up candidates
        # This is a simplified version - you'd implement actual tracking
        follow_up_candidates = []
        
        for recipient in follow_up_candidates:
            try:
                recipient_info = {
                    'name': recipient.get('name'),
                    'company': recipient.get('company'),
                    'position_type': recipient.get('position_type')
                }
                
                # Create follow-up message
                msg = MIMEMultipart()
                msg['From'] = self.config['email']
                msg['To'] = recipient['email']
                msg['Subject'] = f"Following up - {recipient.get('position_type', 'Opportunity')}"
                
                body = f"""
                Hi {recipient.get('name', 'there')},
                
                I wanted to follow up on my previous email about opportunities at {recipient.get('company')}.
                
                I remain very interested in exploring how my skills in {self.config.get('my_skills')} could 
                contribute to your team.
                
                Would you have a few minutes for a brief call this week?
                
                Best regards,
                {self.config.get('my_name')}
                """
                
                msg.attach(MIMEText(body, 'plain'))
                
                server = self._connect_smtp()
                server.send_message(msg)
                server.quit()
                
                self.logger.info(f"Follow-up sent to {recipient['email']}")
                time.sleep(self.config.get('delay_between_emails', 60))
            
            except Exception as e:
                self.logger.error(f"Follow-up failed for {recipient.get('email')}: {e}")
    
    def _log_sent_email(self, recipient: Dict, subject: str):
        """Log sent email details"""
        log_file = self.log_dir / 'sent_emails.csv'
        log_file.parent.mkdir(exist_ok=True)
        
        file_exists = log_file.exists()
        
        with open(log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            if not file_exists:
                writer.writerow(['timestamp', 'recipient_email', 'recipient_name', 'subject', 'company'])
            
            from datetime import datetime
            writer.writerow([
                datetime.now().isoformat(),
                recipient.get('email', ''),
                recipient.get('name', ''),
                subject,
                recipient.get('company', '')
            ])
    
    def _load_sent_log(self) -> List[Dict]:
        """Load sent email log"""
        log_file = self.log_dir / 'sent_emails.csv'
        
        if not log_file.exists():
            return []
        
        sent_emails = []
        with open(log_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            sent_emails = list(reader)
        
        return sent_emails
    
    def get_stats(self) -> Dict:
        """Return current statistics"""
        return self.stats
    
    def create_sample_recipients_csv(self):
        """Create a sample recipients CSV file"""
        csv_path = Path('config/recipients_sample.csv')
        csv_path.parent.mkdir(exist_ok=True)
        
        sample_data = [
            {
                'name': 'John Doe',
                'email': 'john.doe@example.com',
                'company': 'Tech Corp',
                'position_type': 'Software Engineer',
                'industry': 'Technology'
            },
            {
                'name': 'Jane Smith',
                'email': 'jane.smith@example.com',
                'company': 'Startup Inc',
                'position_type': 'Full Stack Developer',
                'industry': 'Technology'
            }
        ]
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['name', 'email', 'company', 'position_type', 'industry']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sample_data)
        
        self.logger.info(f"Sample recipients file created at {csv_path}")
