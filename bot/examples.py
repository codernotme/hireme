#!/usr/bin/env python3
"""
Example Usage Script
Demonstrates different ways to use the Job Automation Bot
"""

from main import JobAutomationBot
import logging

# Configure logging to see what's happening
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


def example_1_linkedin_only():
    """Example: LinkedIn automation only"""
    print("\n=== Example 1: LinkedIn Automation Only ===\n")
    
    bot = JobAutomationBot()
    
    # Custom target roles
    target_roles = ['Python Developer Recruiter', 'Tech HR Manager']
    
    # Run LinkedIn outreach
    results = bot.run_linkedin_outreach(target_roles=target_roles)
    
    print(f"\nResults: {results}")


def example_2_gmail_campaign():
    """Example: Gmail cold email campaign"""
    print("\n=== Example 2: Gmail Cold Email Campaign ===\n")
    
    bot = JobAutomationBot()
    
    # Custom recipient list
    recipients = [
        {
            'name': 'John Doe',
            'email': 'john@techcorp.com',
            'company': 'TechCorp',
            'position_type': 'Software Engineer'
        },
        {
            'name': 'Jane Smith',
            'email': 'jane@startup.io',
            'company': 'Startup Inc',
            'position_type': 'Full Stack Developer'
        }
    ]
    
    # Send emails
    results = bot.run_gmail_campaign(recipient_list=recipients)
    
    print(f"\nResults: {results}")


def example_3_x_engagement():
    """Example: X (Twitter) engagement"""
    print("\n=== Example 3: X (Twitter) Engagement ===\n")
    
    bot = JobAutomationBot()
    
    # Post job search updates
    results = bot.run_x_engagement()
    
    print(f"\nResults: {results}")


def example_4_job_applications():
    """Example: Multi-platform job applications"""
    print("\n=== Example 4: Job Applications ===\n")
    
    bot = JobAutomationBot()
    
    # Apply on specific platforms
    platforms = ['unstop', 'naukri', 'internshala']
    
    results = bot.run_job_applications(platforms=platforms)
    
    print(f"\nResults: {results}")


def example_5_full_automation():
    """Example: Complete automation across all platforms"""
    print("\n=== Example 5: Full Automation ===\n")
    
    bot = JobAutomationBot()
    
    # Run everything
    results = bot.run_full_campaign()
    
    print(f"\nResults: {results}")


def example_6_custom_ai_messages():
    """Example: Using AI to generate custom messages"""
    print("\n=== Example 6: Custom AI Messages ===\n")
    
    from modules.ollama_ai import OllamaAI
    
    # Initialize AI
    ai = OllamaAI({
        'base_url': 'http://localhost:11434',
        'model': 'llama2'
    })
    
    # Check if Ollama is available
    if not ai.check_model_availability():
        print("⚠️  Ollama is not running or model not found")
        return
    
    # Generate LinkedIn message
    recipient_info = {
        'name': 'Sarah Johnson',
        'title': 'Senior Technical Recruiter',
        'company': 'Google',
        'industry': 'Technology',
        'my_background': 'Full-stack developer with 4 years experience',
        'my_interest': 'exploring senior engineering roles'
    }
    
    linkedin_msg = ai.generate_linkedin_message(recipient_info)
    print(f"\nLinkedIn Message:\n{linkedin_msg}\n")
    
    # Generate cold email
    email_info = {
        'name': 'Mike Chen',
        'company': 'Microsoft',
        'position_type': 'Software Engineering',
        'my_skills': 'Python, React, AWS, Docker',
        'my_experience': '4+ years building scalable web applications'
    }
    
    email = ai.generate_cold_email(email_info)
    print(f"\nCold Email:")
    print(f"Subject: {email['subject']}")
    print(f"\nBody:\n{email['body']}\n")
    
    # Generate X post
    x_post = ai.generate_x_post("looking for new opportunities in AI/ML")
    print(f"\nX Post:\n{x_post}\n")


def example_7_daily_routine():
    """Example: Set up a daily job search routine"""
    print("\n=== Example 7: Daily Routine ===\n")
    
    bot = JobAutomationBot()
    
    # Morning: LinkedIn outreach
    print("Morning: LinkedIn outreach...")
    linkedin_results = bot.run_linkedin_outreach()
    
    # Afternoon: Gmail campaign
    print("\nAfternoon: Email campaign...")
    gmail_results = bot.run_gmail_campaign()
    
    # Evening: X engagement
    print("\nEvening: Social media engagement...")
    x_results = bot.run_x_engagement()
    
    # Throughout the day: Job applications
    print("\nThroughout the day: Job applications...")
    job_results = bot.run_job_applications()
    
    # Generate daily report
    print("\nGenerating daily report...")
    report = bot.generate_daily_report()
    
    print(f"\n📊 Daily Summary:")
    print(f"  LinkedIn connections: {linkedin_results.get('connections_sent', 0)}")
    print(f"  Emails sent: {gmail_results.get('emails_sent', 0)}")
    print(f"  X posts: {x_results.get('posts_created', 0)}")
    print(f"  Applications: {job_results.get('unstop', {}).get('applied', 0)}")


def main():
    """Run examples"""
    
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║         Job Automation Bot - Example Usage               ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    
    Choose an example to run:
    
    1. LinkedIn automation only
    2. Gmail cold email campaign
    3. X (Twitter) engagement
    4. Multi-platform job applications
    5. Full automation (all platforms)
    6. Custom AI message generation
    7. Daily job search routine
    
    0. Exit
    """)
    
    examples = {
        '1': example_1_linkedin_only,
        '2': example_2_gmail_campaign,
        '3': example_3_x_engagement,
        '4': example_4_job_applications,
        '5': example_5_full_automation,
        '6': example_6_custom_ai_messages,
        '7': example_7_daily_routine
    }
    
    choice = input("\nEnter your choice (0-7): ").strip()
    
    if choice == '0':
        print("Exiting...")
        return
    
    if choice in examples:
        try:
            examples[choice]()
        except Exception as e:
            print(f"\n❌ Example failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("Invalid choice!")


if __name__ == "__main__":
    main()
