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
        self.uploads_dir = Path(__file__).resolve().parent.parent / 'uploads'
        self.ai_enabled = True
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
    
    def _normalize_tags(self, tags: object) -> List[str]:
        if isinstance(tags, list):
            return [str(tag).strip() for tag in tags if str(tag).strip()]
        if isinstance(tags, str):
            return [tag.strip() for tag in tags.split(',') if tag.strip()]
        return []

    def _matches_tags(self, tags: List[str], target_tags: List[str], mode: str) -> bool:
        if not target_tags or mode == 'keywords':
            return True

        tags_lower = {tag.lower() for tag in tags if tag}
        target_lower = {tag.lower() for tag in target_tags if tag}

        if not tags_lower:
            return False

        if mode == 'all':
            return target_lower.issubset(tags_lower)

        return bool(tags_lower & target_lower)

    def _extract_email(self, row: Dict) -> str:
        direct = row.get('email') or row.get('Email') or row.get('E-mail')
        if direct:
            return str(direct).strip()

        for key, value in row.items():
            if not value:
                continue
            key_lower = str(key).lower()
            if 'email' in key_lower or 'e-mail' in key_lower:
                return str(value).strip()
        return ""

    def _load_recipients_from_csv(self, csv_file: str, source: str) -> List[Dict]:
        recipients: List[Dict] = []
        csv_path = Path(csv_file)

        if not csv_path.exists():
            self.logger.warning(f"Recipients file not found: {csv_file}")
            return recipients

        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    email = self._extract_email(row)
                    if not email:
                        continue

                    tags = row.get('tags') or row.get('tag') or row.get('labels') or row.get('categories')
                    if tags is not None:
                        row['tags'] = tags

                    row['email'] = email
                    row['source'] = row.get('source', source)
                    recipients.append(row)

            self.logger.info(f"Loaded {len(recipients)} recipients from {csv_file}")
            return recipients

        except Exception as e:
            self.logger.error(f"Failed to load recipients from {csv_file}: {e}")
            return []

    def _merge_recipients(self, sources: List[List[Dict]]) -> List[Dict]:
        merged: Dict[str, Dict] = {}

        for source_list in sources:
            for recipient in source_list:
                email = str(recipient.get('email', '')).strip().lower()
                if not email:
                    continue

                if email not in merged:
                    merged[email] = recipient
                    continue

                existing = merged[email]
                existing_tags = self._normalize_tags(existing.get('tags', ''))
                incoming_tags = self._normalize_tags(recipient.get('tags', ''))
                if incoming_tags:
                    combined = sorted({*existing_tags, *incoming_tags})
                    existing['tags'] = ", ".join(combined)

                for key, value in recipient.items():
                    if key not in existing or not existing.get(key):
                        existing[key] = value

        return list(merged.values())

    def _filter_recipients_by_tags(self, recipients: List[Dict]) -> List[Dict]:
        target_tags = self._normalize_tags(self.config.get('target_tags', []))
        mode = str(self.config.get('tag_match_mode', 'any')).lower()

        if not target_tags or mode == 'keywords':
            return recipients

        filtered = []
        for recipient in recipients:
            raw_tags = recipient.get('tags') or recipient.get('matched_tags') or ''
            tags = self._normalize_tags(raw_tags)
            if self._matches_tags(tags, target_tags, mode):
                filtered.append(recipient)

        return filtered

    def load_recipients(self, csv_file: str = None) -> List[Dict]:
        """Load recipient list from CSV file(s)"""
        base_csv = csv_file or self.config.get('recipients_csv', 'config/recipients.csv')
        linkedin_csv = self.config.get('linkedin_recipients_csv') or self.config.get('linkedin_export_csv')
        google_csv = self.config.get('google_contacts_csv')
        extra_csvs = self.config.get('additional_recipient_csvs', []) or []

        csv_entries = [(base_csv, 'gmail')]
        if linkedin_csv:
            csv_entries.append((linkedin_csv, 'linkedin'))
        if google_csv:
            csv_entries.append((google_csv, 'google'))
        for extra in extra_csvs:
            csv_entries.append((extra, 'extra'))

        sources: List[List[Dict]] = []
        for path, source in csv_entries:
            if not path:
                continue
            sources.append(self._load_recipients_from_csv(path, source))

        recipients = self._merge_recipients(sources)
        recipients = self._filter_recipients_by_tags(recipients)

        self.logger.info(f"Prepared {len(recipients)} recipients after filtering")
        return recipients

    def _resolve_resume_attachment(self) -> Optional[Path]:
        resume_path = self.config.get('resume_path') or self.config.get('resume_file')
        if resume_path:
            path = Path(resume_path).expanduser()
            if path.exists():
                return path

        if not self.config.get('auto_attach_resume', True):
            return None

        resume_dir = self.uploads_dir / 'resume'
        if not resume_dir.exists():
            return None

        candidates = [path for path in resume_dir.iterdir() if path.is_file()]
        if not candidates:
            return None

        return max(candidates, key=lambda p: p.stat().st_mtime)

    def _score_email_candidate(self, candidate: Dict[str, str], recipient_info: Dict) -> int:
        subject = candidate.get('subject', '') or ''
        body = candidate.get('body', '') or ''
        score = 0

        if subject.strip():
            score += 2
        if body.strip():
            score += 2

        company = recipient_info.get('company', '').lower()
        name = recipient_info.get('name', '').lower()
        position = recipient_info.get('position_type', '').lower()
        combined = f"{subject} {body}".lower()

        if company and company in combined:
            score += 2
        if name and name in combined:
            score += 1
        if position and position in combined:
            score += 1

        word_count = len(body.split())
        if 40 <= word_count <= 320:
            score += 1

        lowered = combined
        if 'unknown' in lowered or 'lorem' in lowered or 'subject:' in lowered:
            score -= 2

        return score

    def _select_best_candidate(
        self,
        candidates: List[Dict[str, str]],
        recipient_info: Dict,
    ) -> Optional[Dict[str, str]]:
        if not candidates:
            return None

        best = None
        best_score = -1
        for candidate in candidates:
            score = self._score_email_candidate(candidate, recipient_info)
            if score > best_score:
                best = candidate
                best_score = score

        return best
    
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
        
        message_subject = (
            self.config.get('message_subject')
            or self.config.get('custom_subject')
            or ""
        )
        message_body = (
            self.config.get('message_body')
            or self.config.get('custom_message')
            or self.config.get('message_template')
            or ""
        )

        email_content = None
        if message_body:
            variables = {
                **recipient_info,
                'email': recipient.get('email', ''),
                'tags': recipient.get('tags', ''),
                'my_name': self.config.get('my_name', 'Your Name'),
                'my_title': self.config.get('my_title', ''),
            }
            personalized_body = message_body
            if self.ai_enabled and self.config.get('personalize_custom_message', True):
                try:
                    personalized_body = self.ai.personalize_template(message_body, variables)
                except Exception as e:
                    self.logger.warning(f"Template personalization failed, using raw message: {e}")
                    self.ai_enabled = False

            subject = message_subject or f"Exploring opportunities at {recipient_info.get('company', 'your company')}"
            email_content = {"subject": subject, "body": personalized_body}
        else:
            if self.ai_enabled:
                try:
                    use_multi = bool(self.config.get('use_multi_model', False))
                    raw_models = self.config.get('multi_models')
                    models = None
                    if isinstance(raw_models, str):
                        models = [m.strip() for m in raw_models.split(',') if m.strip()]
                    elif isinstance(raw_models, list):
                        models = [str(m).strip() for m in raw_models if str(m).strip()]

                    if use_multi and hasattr(self.ai, 'generate_cold_email_candidates'):
                        candidates = self.ai.generate_cold_email_candidates(recipient_info, models=models)
                        email_content = self._select_best_candidate(candidates, recipient_info)

                    if not email_content:
                        email_content = self.ai.generate_cold_email(recipient_info)
                except Exception as e:
                    self.logger.warning(f"AI email generation failed, using fallback: {e}")
                    self.ai_enabled = False

            if not email_content:
                subject = f"Exploring opportunities at {recipient_info.get('company', 'your company')}"
                body = (
                    f"Hi {recipient_info.get('name', 'there')},\n\n"
                    f"I am exploring opportunities in {recipient_info.get('position_type', 'software engineering')} "
                    f"and would love to connect. My background includes {self.config.get('my_skills', '')}.\n\n"
                    "If you are open to a quick chat, I would appreciate it.\n\n"
                    f"Best,\n{self.config.get('my_name', 'Your Name')}"
                )
                email_content = {"subject": subject, "body": body}
        
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

        attachment_paths = list(self.config.get('attachment_paths', []) or [])
        resume_attachment = self._resolve_resume_attachment()
        if resume_attachment and str(resume_attachment) not in attachment_paths:
            attachment_paths.append(str(resume_attachment))
        for attachment in sorted({path for path in attachment_paths if path}):
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
        else:
            recipient_list = self._filter_recipients_by_tags(recipient_list)
        
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
