"""
X (Twitter) Automation Bot
Handles posting and engagement on X for job search visibility
"""

import logging
import time
from typing import Dict, List
import tweepy
from datetime import datetime


class XBot:
    """Automates X (Twitter) engagement for job search"""
    
    def __init__(self, config: Dict, ai_engine):
        self.config = config
        self.ai = ai_engine
        self.logger = logging.getLogger(__name__)
        self.client = None
        self.api = None
        self.stats = {
            'posts_created': 0,
            'engagements': 0,
            'followers_gained': 0
        }
        
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with X API"""
        required_keys = [
            'api_key',
            'api_secret',
            'access_token',
            'access_token_secret',
            'bearer_token',
        ]
        missing = [key for key in required_keys if not self.config.get(key)]
        if missing:
            self.logger.warning(
                "X credentials missing (%s). X bot will run in mock mode.",
                ", ".join(missing),
            )
            return

        try:
            # X API v2 authentication
            self.client = tweepy.Client(
                bearer_token=self.config.get('bearer_token'),
                consumer_key=self.config.get('api_key'),
                consumer_secret=self.config.get('api_secret'),
                access_token=self.config.get('access_token'),
                access_token_secret=self.config.get('access_token_secret'),
                wait_on_rate_limit=True
            )
            
            # Also initialize API v1.1 for some features
            auth = tweepy.OAuth1UserHandler(
                self.config.get('api_key'),
                self.config.get('api_secret'),
                self.config.get('access_token'),
                self.config.get('access_token_secret')
            )
            self.api = tweepy.API(auth)
            
            # Verify credentials
            user = self.client.get_me()
            self.logger.info(f"Authenticated as @{user.data.username}")
        
        except Exception as e:
            self.logger.error(f"X authentication failed: {e}")
            self.logger.warning("X bot will run in mock mode")
            self.client = None
            self.api = None
    
    def post_job_search_updates(self) -> Dict:
        """Post engaging content about job search"""
        post_topics = [
            "my skills and expertise",
            "looking for opportunities",
            "recent projects I've worked on",
            "tech trends and learning",
            "professional growth"
        ]
        
        daily_post_limit = self.config.get('daily_post_limit', 3)
        
        for topic in post_topics[:daily_post_limit]:
            try:
                # Generate AI-powered post
                post_text = self.ai.generate_x_post(topic)
                
                # Post to X
                if self.client:
                    response = self.client.create_tweet(text=post_text)
                    self.stats['posts_created'] += 1
                    self.logger.info(f"Posted to X: {post_text[:50]}...")
                else:
                    # Mock mode
                    self.logger.info(f"[MOCK] Would post: {post_text}")
                    self.stats['posts_created'] += 1
                
                # Wait between posts
                time.sleep(self.config.get('delay_between_posts', 3600))  # 1 hour default
            
            except Exception as e:
                self.logger.error(f"Failed to post: {e}")
                continue
        
        return self.stats
    
    def create_thread(self, topic: str) -> List[str]:
        """Create a thread about a specific topic"""
        try:
            # This would use AI to generate a multi-part thread
            thread_prompt = f"Create a 3-tweet thread about: {topic}"
            
            tweets = []
            for i in range(3):
                tweet_text = self.ai.generate_x_post(f"{topic} - part {i+1} of thread")
                tweets.append(tweet_text)
            
            # Post thread
            if self.client:
                previous_tweet_id = None
                
                for tweet_text in tweets:
                    if previous_tweet_id:
                        response = self.client.create_tweet(
                            text=tweet_text,
                            in_reply_to_tweet_id=previous_tweet_id
                        )
                    else:
                        response = self.client.create_tweet(text=tweet_text)
                    
                    previous_tweet_id = response.data['id']
                    self.stats['posts_created'] += 1
                    time.sleep(5)
                
                self.logger.info(f"Thread created about: {topic}")
            else:
                self.logger.info(f"[MOCK] Would create thread: {tweets}")
            
            return tweets
        
        except Exception as e:
            self.logger.error(f"Failed to create thread: {e}")
            return []
    
    def engage_with_recruiters(self):
        """Like and reply to recruiter posts"""
        try:
            # Search for relevant posts
            search_queries = [
                "#hiring software engineer",
                "#jobopening developer",
                "#techjobs",
                "#nowhiring",
                "hiring python developer"
            ]
            
            engagement_limit = self.config.get('daily_engagement_limit', 20)
            engagements = 0
            
            for query in search_queries:
                if engagements >= engagement_limit:
                    break
                
                if not self.client:
                    self.logger.info(f"[MOCK] Would search: {query}")
                    continue
                
                try:
                    # Search recent tweets
                    tweets = self.client.search_recent_tweets(
                        query=query,
                        max_results=10,
                        tweet_fields=['author_id', 'created_at']
                    )
                    
                    if not tweets.data:
                        continue
                    
                    for tweet in tweets.data:
                        if engagements >= engagement_limit:
                            break
                        
                        try:
                            # Like the tweet
                            self.client.like(tweet.id)
                            engagements += 1
                            self.logger.info(f"Liked tweet: {tweet.id}")
                            
                            # Optionally reply
                            if self.config.get('auto_reply', False):
                                reply_text = self._generate_reply(tweet.text)
                                if reply_text:
                                    self.client.create_tweet(
                                        text=reply_text,
                                        in_reply_to_tweet_id=tweet.id
                                    )
                                    engagements += 1
                                    self.logger.info(f"Replied to tweet: {tweet.id}")
                            
                            time.sleep(5)  # Rate limiting
                        
                        except Exception as e:
                            self.logger.warning(f"Engagement failed for tweet {tweet.id}: {e}")
                            continue
                
                except Exception as e:
                    self.logger.error(f"Search failed for '{query}': {e}")
                    continue
            
            self.stats['engagements'] = engagements
            self.logger.info(f"Completed {engagements} engagements")
        
        except Exception as e:
            self.logger.error(f"Recruiter engagement failed: {e}")
    
    def _generate_reply(self, original_tweet: str) -> str:
        """Generate appropriate reply to a tweet"""
        try:
            # Use AI to generate contextual reply
            prompt = f"Generate a professional, brief reply to this hiring tweet: {original_tweet}"
            reply = self.ai.generate_x_post(prompt)
            
            # Ensure it's not too long
            if len(reply) > 280:
                reply = reply[:277] + "..."
            
            return reply
        
        except Exception as e:
            self.logger.error(f"Reply generation failed: {e}")
            return ""
    
    def follow_recruiters(self, usernames: List[str] = None):
        """Follow tech recruiters and hiring managers"""
        if usernames is None:
            usernames = self.config.get('recruiters_to_follow', [])
        
        for username in usernames:
            try:
                if self.client:
                    user = self.client.get_user(username=username)
                    self.client.follow_user(user.data.id)
                    self.stats['followers_gained'] += 1
                    self.logger.info(f"Followed @{username}")
                else:
                    self.logger.info(f"[MOCK] Would follow @{username}")
                
                time.sleep(5)
            
            except Exception as e:
                self.logger.error(f"Failed to follow @{username}: {e}")
    
    def update_bio(self, status: str = "open to work"):
        """Update profile bio to show job search status"""
        try:
            if self.api:
                current_bio = self.api.get_user(self.api.verify_credentials().screen_name).description
                
                # Add job search status if not already present
                if "#OpenToWork" not in current_bio:
                    new_bio = f"{current_bio} | #OpenToWork #Hiring"
                    
                    # Update profile
                    self.api.update_profile(description=new_bio[:160])
                    self.logger.info("Updated profile bio with #OpenToWork")
            else:
                self.logger.info("[MOCK] Would update bio")
        
        except Exception as e:
            self.logger.error(f"Failed to update bio: {e}")
    
    def schedule_posts(self, post_times: List[str] = None):
        """Schedule posts for optimal times"""
        # This would integrate with a scheduling system
        # For now, just log the intent
        if post_times is None:
            post_times = self.config.get('post_schedule', ['09:00', '13:00', '18:00'])
        
        self.logger.info(f"Posts would be scheduled for: {', '.join(post_times)}")
    
    def get_stats(self) -> Dict:
        """Return current statistics"""
        return self.stats
    
    def analyze_engagement(self) -> Dict:
        """Analyze engagement metrics"""
        try:
            if self.client:
                me = self.client.get_me(user_fields=['public_metrics'])
                metrics = me.data.public_metrics
                
                return {
                    'followers': metrics['followers_count'],
                    'following': metrics['following_count'],
                    'tweets': metrics['tweet_count']
                }
            else:
                return {'status': 'mock_mode'}
        
        except Exception as e:
            self.logger.error(f"Analytics failed: {e}")
            return {}
