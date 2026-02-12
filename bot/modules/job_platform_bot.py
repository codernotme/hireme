"""
Job Platform Automation Bot
Handles applications on Unstop, Naukri, Internshala, and other platforms
"""

import logging
import time
from pathlib import Path
from typing import Dict, List, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.keys import Keys


class JobPlatformBot:
    """Automates job applications across multiple platforms"""
    
    def __init__(self, config: Dict, ai_engine):
        self.config = config
        self.ai = ai_engine
        self.logger = logging.getLogger(__name__)
        self.driver = None
        self.stats = {
            'applications_sent': 0,
            'applications_failed': 0,
            'platforms_used': []
        }
    
    def _setup_driver(self):
        """Initialize Selenium WebDriver"""
        if self.driver:
            return
        
        chrome_options = Options()
        
        if self.config.get('headless', False):
            chrome_options.add_argument('--headless')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        # Set download directory for resume
        resume_path = self.config.get('resume_path', '')
        download_dir = '/tmp'
        if resume_path:
            download_dir = str(Path(resume_path).expanduser().resolve().parent)

        prefs = {
            'download.default_directory': download_dir,
            'download.prompt_for_download': False,
        }
        chrome_options.add_experimental_option('prefs', prefs)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
        self.logger.info("WebDriver initialized for job platforms")
    
    def apply_to_jobs(self, platform: str) -> Dict:
        """Apply to jobs on specified platform"""
        if platform.lower() == 'unstop':
            return self._apply_unstop()
        elif platform.lower() == 'naukri':
            return self._apply_naukri()
        elif platform.lower() == 'internshala':
            return self._apply_internshala()
        elif platform.lower() == 'linkedin':
            return self._apply_linkedin()
        else:
            self.logger.warning(f"Platform {platform} not supported")
            return {}
    
    def _apply_unstop(self) -> Dict:
        """Apply to opportunities on Unstop"""
        self._setup_driver()
        platform_stats = {'applied': 0, 'failed': 0}
        
        try:
            # Login to Unstop
            self.driver.get('https://unstop.com/login')
            time.sleep(3)
            
            # Check if already logged in
            if 'login' in self.driver.current_url:
                # Login process
                email_field = self.wait.until(EC.presence_of_element_located((By.ID, 'email')))
                email_field.send_keys(self.config.get('unstop_email', ''))
                
                password_field = self.driver.find_element(By.ID, 'password')
                password_field.send_keys(self.config.get('unstop_password', ''))
                
                login_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                login_button.click()
                time.sleep(5)
            
            # Navigate to opportunities
            self.driver.get('https://unstop.com/hackathons')
            time.sleep(3)
            
            # Search for relevant opportunities
            search_keywords = self.config.get('job_keywords', ['developer', 'software engineer'])
            
            for keyword in search_keywords:
                try:
                    search_box = self.driver.find_element(By.CSS_SELECTOR, 'input[placeholder*="Search"]')
                    search_box.clear()
                    search_box.send_keys(keyword)
                    search_box.send_keys(Keys.RETURN)
                    time.sleep(3)
                    
                    # Find opportunities
                    opportunities = self.driver.find_elements(By.CSS_SELECTOR, '.opportunity-card')
                    
                    for opp in opportunities[:self.config.get('daily_application_limit', 10)]:
                        try:
                            # Click on opportunity
                            opp.click()
                            time.sleep(2)
                            
                            # Switch to new tab if opened
                            if len(self.driver.window_handles) > 1:
                                self.driver.switch_to.window(self.driver.window_handles[-1])
                            
                            # Click apply button
                            apply_button = self.wait.until(
                                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Apply')]"))
                            )
                            apply_button.click()
                            time.sleep(2)
                            
                            # Fill application form if needed
                            self._fill_generic_form()
                            
                            # Submit
                            submit_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Submit')]")
                            submit_button.click()
                            
                            platform_stats['applied'] += 1
                            self.stats['applications_sent'] += 1
                            self.logger.info(f"Applied to opportunity on Unstop")
                            
                            # Close tab and return to main
                            if len(self.driver.window_handles) > 1:
                                self.driver.close()
                                self.driver.switch_to.window(self.driver.window_handles[0])
                            
                            time.sleep(5)
                        
                        except Exception as e:
                            platform_stats['failed'] += 1
                            self.logger.warning(f"Failed to apply to opportunity: {e}")
                            continue
                
                except Exception as e:
                    self.logger.error(f"Search failed for keyword '{keyword}': {e}")
        
        except Exception as e:
            self.logger.error(f"Unstop automation failed: {e}")
        
        self.stats['platforms_used'].append('unstop')
        return platform_stats
    
    def _apply_naukri(self) -> Dict:
        """Apply to jobs on Naukri.com"""
        self._setup_driver()
        platform_stats = {'applied': 0, 'failed': 0}
        
        try:
            # Login
            self.driver.get('https://www.naukri.com/nlogin/login')
            time.sleep(3)
            
            # Enter credentials
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, 'usernameField')))
            email_field.send_keys(self.config.get('naukri_email', ''))
            
            password_field = self.driver.find_element(By.ID, 'passwordField')
            password_field.send_keys(self.config.get('naukri_password', ''))
            
            login_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            login_button.click()
            time.sleep(5)
            
            # Search jobs
            job_keywords = self.config.get('job_keywords', ['Python Developer'])
            
            for keyword in job_keywords:
                search_url = f"https://www.naukri.com/{keyword.replace(' ', '-')}-jobs"
                self.driver.get(search_url)
                time.sleep(3)
                
                # Get job listings
                job_cards = self.driver.find_elements(By.CSS_SELECTOR, '.jobTuple')
                
                for job_card in job_cards[:self.config.get('daily_application_limit', 15)]:
                    try:
                        # Click on job
                        job_title = job_card.find_element(By.CSS_SELECTOR, '.title')
                        job_title.click()
                        time.sleep(2)
                        
                        # Click apply
                        apply_button = self.wait.until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, '.btn-apply'))
                        )
                        apply_button.click()
                        time.sleep(2)
                        
                        platform_stats['applied'] += 1
                        self.stats['applications_sent'] += 1
                        self.logger.info(f"Applied to job on Naukri")
                        
                        time.sleep(3)
                    
                    except Exception as e:
                        platform_stats['failed'] += 1
                        self.logger.warning(f"Failed to apply on Naukri: {e}")
                        continue
        
        except Exception as e:
            self.logger.error(f"Naukri automation failed: {e}")
        
        self.stats['platforms_used'].append('naukri')
        return platform_stats
    
    def _apply_internshala(self) -> Dict:
        """Apply to internships on Internshala"""
        self._setup_driver()
        platform_stats = {'applied': 0, 'failed': 0}
        
        try:
            # Login
            self.driver.get('https://internshala.com/login')
            time.sleep(3)
            
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, 'email')))
            email_field.send_keys(self.config.get('internshala_email', ''))
            
            password_field = self.driver.find_element(By.ID, 'password')
            password_field.send_keys(self.config.get('internshala_password', ''))
            
            login_button = self.driver.find_element(By.ID, 'login_submit')
            login_button.click()
            time.sleep(5)
            
            # Search internships/jobs
            self.driver.get('https://internshala.com/internships/')
            time.sleep(3)
            
            # Apply filters
            location = self.config.get('preferred_location', 'Work From Home')
            category = self.config.get('job_category', 'Software Development')
            
            # Get internship cards
            internship_cards = self.driver.find_elements(By.CSS_SELECTOR, '.individual_internship')
            
            for card in internship_cards[:self.config.get('daily_application_limit', 10)]:
                try:
                    # Click view details
                    view_button = card.find_element(By.CSS_SELECTOR, '.view_detail_button')
                    view_button.click()
                    time.sleep(2)
                    
                    # Click apply
                    apply_button = self.wait.until(
                        EC.element_to_be_clickable((By.ID, 'continue_button'))
                    )
                    apply_button.click()
                    time.sleep(2)
                    
                    # Fill cover letter if required
                    try:
                        cover_letter_field = self.driver.find_element(By.ID, 'cover_letter')
                        
                        # Generate cover letter using AI
                        job_info = {
                            'position': 'Software Development Intern',
                            'company': card.find_element(By.CSS_SELECTOR, '.company_name').text,
                            'my_skills': self.config.get('my_skills', ''),
                            'my_experience': self.config.get('my_experience', '')
                        }
                        
                        cover_letter = self.ai.generate_cover_letter(job_info)
                        cover_letter_field.send_keys(cover_letter[:1000])  # Internshala limit
                    except NoSuchElementException:
                        pass
                    
                    # Submit application
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                    submit_button.click()
                    
                    platform_stats['applied'] += 1
                    self.stats['applications_sent'] += 1
                    self.logger.info(f"Applied on Internshala")
                    
                    # Go back
                    self.driver.back()
                    time.sleep(3)
                
                except Exception as e:
                    platform_stats['failed'] += 1
                    self.logger.warning(f"Failed to apply on Internshala: {e}")
                    continue
        
        except Exception as e:
            self.logger.error(f"Internshala automation failed: {e}")
        
        self.stats['platforms_used'].append('internshala')
        return platform_stats
    
    def _apply_linkedin(self) -> Dict:
        """Apply to LinkedIn jobs (Easy Apply)"""
        # This would integrate with the LinkedIn module
        from modules.linkedin_bot import LinkedInBot
        
        linkedin = LinkedInBot(self.config, self.ai)
        linkedin.connect()
        linkedin.apply_to_jobs()
        
        return linkedin.get_stats()
    
    def _fill_generic_form(self):
        """Fill common form fields"""
        try:
            # Name
            name_fields = self.driver.find_elements(By.CSS_SELECTOR, 'input[name*="name"]')
            for field in name_fields:
                if field.is_displayed():
                    field.send_keys(self.config.get('my_name', ''))
            
            # Email
            email_fields = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="email"]')
            for field in email_fields:
                if field.is_displayed():
                    field.send_keys(self.config.get('my_email', ''))
            
            # Phone
            phone_fields = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="tel"]')
            for field in phone_fields:
                if field.is_displayed():
                    field.send_keys(self.config.get('my_phone', ''))
            
            # Resume upload
            resume_fields = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="file"]')
            for field in resume_fields:
                if field.is_displayed():
                    field.send_keys(self.config.get('resume_path', ''))
        
        except Exception as e:
            self.logger.warning(f"Form filling encountered issues: {e}")
    
    def get_stats(self) -> Dict:
        """Return current statistics"""
        return self.stats
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.logger.info("Job platform bot closed")
