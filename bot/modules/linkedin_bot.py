"""
LinkedIn Automation Bot
Handles LinkedIn connection requests, messaging, and outreach
"""

import time
import logging
from typing import Dict, List, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class LinkedInBot:
    """Automates LinkedIn outreach and job applications"""
    
    def __init__(self, config: Dict, ai_engine):
        self.config = config
        self.ai = ai_engine
        self.logger = logging.getLogger(__name__)
        self.driver = None
        self.stats = {
            'connections_sent': 0,
            'messages_sent': 0,
            'jobs_applied': 0
        }

    def _unique_list(self, items: List[str]) -> List[str]:
        seen = set()
        ordered = []
        for item in items:
            cleaned = item.strip()
            if not cleaned or cleaned in seen:
                continue
            seen.add(cleaned)
            ordered.append(cleaned)
        return ordered

    def _build_message(self, recipient_info: Dict) -> str:
        template = self.config.get('message_template', '').strip()
        message_tags = self.config.get('message_tags', [])

        if template:
            variables = {
                **recipient_info,
                'tags': ", ".join(message_tags) if message_tags else "",
            }
            try:
                return self.ai.personalize_template(template, variables)
            except Exception as e:
                self.logger.warning(f"Failed to personalize template: {e}")
                return template

        return self.ai.generate_linkedin_message(recipient_info)

    def _attach_images(self, image_paths: List[str]) -> None:
        if not image_paths:
            return

        try:
            file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            file_input.send_keys("\n".join(image_paths))
            time.sleep(2)
        except NoSuchElementException:
            self.logger.warning("No attachment input found for LinkedIn message")
        except Exception as e:
            self.logger.warning(f"Failed to attach images: {e}")
    
    def _setup_driver(self):
        """Initialize Selenium WebDriver"""
        chrome_options = Options()
        
        if self.config.get('headless', False):
            chrome_options.add_argument('--headless')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
        self.logger.info("WebDriver initialized for LinkedIn")
    
    def connect(self):
        """Login to LinkedIn"""
        if not self.driver:
            self._setup_driver()
        
        try:
            self.driver.get('https://www.linkedin.com/login')
            
            # Login
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, 'username')))
            email_field.send_keys(self.config['email'])
            
            password_field = self.driver.find_element(By.ID, 'password')
            password_field.send_keys(self.config['password'])
            
            login_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            login_button.click()
            
            # Wait for homepage
            time.sleep(5)
            
            # Check if 2FA or verification needed
            if 'checkpoint' in self.driver.current_url or 'challenge' in self.driver.current_url:
                self.logger.warning("LinkedIn verification required. Please complete manually.")
                input("Press Enter after completing verification...")
            
            self.logger.info("Successfully logged into LinkedIn")
            
        except Exception as e:
            self.logger.error(f"LinkedIn login failed: {e}")
            raise
    
    def search_people(self, keywords: List[str], filters: Dict = None) -> List[Dict]:
        """Search for people on LinkedIn"""
        results = []
        
        for keyword in keywords:
            try:
                search_url = f"https://www.linkedin.com/search/results/people/?keywords={keyword}"
                
                if filters:
                    if filters.get('current_company'):
                        search_url += f"&currentCompany={filters['current_company']}"
                    if filters.get('industry'):
                        search_url += f"&industry={filters['industry']}"
                
                self.driver.get(search_url)
                time.sleep(3)
                
                # Scroll to load results
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                
                # Extract profile information
                profiles = self.driver.find_elements(By.CSS_SELECTOR, '.entity-result__item')
                
                for profile in profiles[:self.config.get('max_connections_per_search', 10)]:
                    try:
                        name_elem = profile.find_element(By.CSS_SELECTOR, '.entity-result__title-text a')
                        name = name_elem.text
                        profile_url = name_elem.get_attribute('href')
                        
                        title_elem = profile.find_element(By.CSS_SELECTOR, '.entity-result__primary-subtitle')
                        title = title_elem.text
                        
                        results.append({
                            'name': name,
                            'title': title,
                            'url': profile_url,
                            'keyword': keyword
                        })
                    
                    except NoSuchElementException:
                        continue
                
                time.sleep(2)
            
            except Exception as e:
                self.logger.error(f"Search failed for keyword '{keyword}': {e}")
        
        self.logger.info(f"Found {len(results)} potential connections")
        return results
    
    def send_connection_requests(self, target_roles: List[str] = None) -> Dict:
        """Send personalized connection requests"""
        if target_roles is None:
            target_roles = self.config.get('target_roles', ['HR Manager', 'Technical Recruiter', 'Talent Acquisition'])

        target_tags = self.config.get('target_tags', [])
        search_keywords = self._unique_list([*target_roles, *target_tags])
        
        filters = {
            'industry': self.config.get('target_industry', None)
        }
        
        people = self.search_people(search_keywords, filters)
        
        for person in people:
            try:
                # Generate personalized message
                recipient_info = {
                    'name': person['name'],
                    'title': person['title'],
                    'my_background': self.config.get('my_background', ''),
                    'my_interest': 'exploring opportunities in ' + person['keyword']
                }
                
                message = self._build_message(recipient_info)
                
                # Visit profile
                self.driver.get(person['url'])
                time.sleep(3)
                
                # Click Connect button
                try:
                    connect_button = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, "//button[contains(@aria-label, 'Invite')]"))
                    )
                    connect_button.click()
                    time.sleep(2)
                    
                    # Add note if possible
                    try:
                        add_note_button = self.driver.find_element(By.CSS_SELECTOR, 'button[aria-label*="note"]')
                        add_note_button.click()
                        time.sleep(1)
                        
                        note_field = self.driver.find_element(By.ID, 'custom-message')
                        note_field.send_keys(message[:300])  # LinkedIn limit
                        
                        send_button = self.driver.find_element(By.CSS_SELECTOR, 'button[aria-label*="Send"]')
                        send_button.click()
                        
                        self.stats['connections_sent'] += 1
                        self.logger.info(f"Connection request sent to {person['name']} with note")
                    
                    except NoSuchElementException:
                        # Send without note
                        send_button = self.driver.find_element(By.CSS_SELECTOR, 'button[aria-label*="Send"]')
                        send_button.click()
                        self.stats['connections_sent'] += 1
                        self.logger.info(f"Connection request sent to {person['name']} (no note)")
                    
                    time.sleep(5)  # Rate limiting
                
                except TimeoutException:
                    self.logger.warning(f"Could not send connection to {person['name']}")
            
            except Exception as e:
                self.logger.error(f"Failed to connect with {person.get('name', 'Unknown')}: {e}")
                continue
            
            # Respect rate limits
            if self.stats['connections_sent'] >= self.config.get('daily_connection_limit', 20):
                self.logger.info("Daily connection limit reached")
                break
        
        return self.stats
    
    def send_messages(self, message_list: List[Dict] = None):
        """Send messages to existing connections"""
        try:
            self.driver.get('https://www.linkedin.com/messaging/')
            time.sleep(3)
            
            # Get recent conversations
            conversations = self.driver.find_elements(By.CSS_SELECTOR, '.msg-conversation-listitem')
            
            for conv in conversations[:self.config.get('daily_message_limit', 10)]:
                try:
                    conv.click()
                    time.sleep(2)
                    
                    # Generate follow-up message
                    context = "Following up on job opportunities and networking"
                    message = self._build_message({
                        'name': 'there',
                        'title': '',
                        'company': '',
                        'industry': '',
                        'my_background': self.config.get('my_background', ''),
                        'my_interest': context
                    })
                    
                    message_field = self.driver.find_element(By.CSS_SELECTOR, '.msg-form__contenteditable')
                    message_field.send_keys(message)

                    image_paths = self.config.get('message_image_paths', [])
                    self._attach_images(image_paths)
                    
                    send_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                    send_button.click()
                    
                    self.stats['messages_sent'] += 1
                    time.sleep(5)
                
                except Exception as e:
                    self.logger.error(f"Failed to send message: {e}")
                    continue
        
        except Exception as e:
            self.logger.error(f"Messaging failed: {e}")
    
    def apply_to_jobs(self, job_titles: List[str] = None):
        """Apply to jobs on LinkedIn"""
        if job_titles is None:
            job_titles = self.config.get('job_titles', ['Software Engineer', 'Python Developer'])
        
        for title in job_titles:
            try:
                search_url = f"https://www.linkedin.com/jobs/search/?keywords={title}&f_AL=true"  # Easy Apply filter
                self.driver.get(search_url)
                time.sleep(3)
                
                job_cards = self.driver.find_elements(By.CSS_SELECTOR, '.job-card-container')
                
                for job_card in job_cards[:self.config.get('daily_application_limit', 15)]:
                    try:
                        job_card.click()
                        time.sleep(2)
                        
                        # Click Easy Apply
                        easy_apply = self.driver.find_element(By.CSS_SELECTOR, 'button[aria-label*="Easy Apply"]')
                        easy_apply.click()
                        time.sleep(2)
                        
                        # Fill application form (simplified)
                        # Note: This is a basic implementation and may need customization
                        submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[aria-label*="Submit"]')
                        submit_button.click()
                        
                        self.stats['jobs_applied'] += 1
                        self.logger.info(f"Applied to job: {title}")
                        time.sleep(3)
                    
                    except Exception as e:
                        self.logger.warning(f"Could not apply to job: {e}")
                        continue
            
            except Exception as e:
                self.logger.error(f"Job application search failed: {e}")
    
    def get_stats(self) -> Dict:
        """Return current statistics"""
        return self.stats
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.logger.info("LinkedIn bot closed")
