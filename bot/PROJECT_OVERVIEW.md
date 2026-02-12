# Job Automation Bot - Project Overview

## 📦 What's Included

This comprehensive automation bot helps streamline your job search across multiple platforms:

### Core Features
✅ **LinkedIn Automation** - Automated connection requests and messaging
✅ **Gmail Cold Emails** - AI-powered personalized email campaigns
✅ **X (Twitter) Engagement** - Automated posts and recruiter engagement
✅ **Multi-Platform Applications** - Unstop, Naukri, Internshala, LinkedIn
✅ **Local AI with Ollama** - Privacy-first, runs entirely on your machine
✅ **Smart Rate Limiting** - Prevents platform bans
✅ **Comprehensive Logging** - Track all activities

### Project Structure

```
job_automation_bot/
├── main.py                    # Main bot controller
├── setup.py                   # Automated setup script
├── examples.py                # Usage examples
├── requirements.txt           # Python dependencies
├── README.md                  # Full documentation
├── QUICKSTART.md             # Quick start guide
├── LICENSE                    # MIT License
├── .gitignore                # Git ignore rules
│
├── modules/                   # Bot modules
│   ├── __init__.py
│   ├── ollama_ai.py          # AI integration
│   ├── linkedin_bot.py       # LinkedIn automation
│   ├── gmail_bot.py          # Gmail automation
│   ├── x_bot.py              # X (Twitter) automation
│   └── job_platform_bot.py   # Job platforms automation
│
├── config/                    # Configuration
│   ├── __init__.py
│   └── settings.py           # Settings management
│
├── templates/                 # Message templates (auto-created)
└── logs/                      # Activity logs (auto-created)
```

## 🚀 Getting Started

### Prerequisites
1. **Ollama** - Local AI model server
2. **Python 3.8+** - Programming language
3. **Chrome** - For web automation
4. **Platform accounts** - LinkedIn, Gmail, X, etc.

### Quick Setup (3 Steps)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama2
ollama serve  # Keep running

# 2. Run setup
python setup.py

# 3. Edit config
nano config/config.yaml  # Add your credentials
```

### First Run

```bash
# Test LinkedIn only
python main.py --mode linkedin

# Test Gmail only
python main.py --mode gmail

# Full automation
python main.py --mode full
```

## 🎯 Key Features Explained

### 1. LinkedIn Automation (`linkedin_bot.py`)
- Searches for HR managers and recruiters
- Sends personalized connection requests
- Follows up with messages
- Applies to jobs (Easy Apply)
- **Rate limit**: 20 connections/day, 10 messages/day

### 2. Gmail Campaign (`gmail_bot.py`)
- Loads recipients from CSV
- Generates personalized cold emails
- Tracks sent emails
- Schedules follow-ups
- **Rate limit**: 50 emails/day

### 3. X (Twitter) Bot (`x_bot.py`)
- Posts job search updates
- Engages with recruiter tweets
- Updates profile (#OpenToWork)
- Follows relevant accounts
- **Rate limit**: 3 posts/day, 20 engagements/day

### 4. Job Platform Bot (`job_platform_bot.py`)
Supports:
- **Unstop** - Hackathons, competitions
- **Naukri.com** - Job applications
- **Internshala** - Internships
- **LinkedIn** - Easy Apply jobs
- **Rate limit**: 15 applications/day per platform

### 5. Ollama AI (`ollama_ai.py`)
- Generates LinkedIn messages
- Creates cold email content
- Writes X posts
- Personalizes cover letters
- **100% local** - No external API calls

## 📋 Configuration Guide

### config/config.yaml

```yaml
# AI Configuration
ollama:
  base_url: http://localhost:11434
  model: llama2  # or mistral, codellama, etc.

# Your Profile
user_profile:
  name: "Your Name"
  email: "your@email.com"
  skills: "Python, React, AWS"
  resume_path: "/path/to/resume.pdf"

# Platform Credentials
linkedin:
  email: "your.linkedin@gmail.com"
  password: "your_password"
  daily_connection_limit: 20

gmail:
  email: "your.gmail@gmail.com"
  app_password: "xxxx xxxx xxxx xxxx"  # NOT your Gmail password!
  daily_email_limit: 50

x_twitter:
  api_key: "your_api_key"
  api_secret: "your_api_secret"
  access_token: "your_access_token"
  access_token_secret: "your_access_token_secret"

job_platforms:
  unstop_email: "your@email.com"
  naukri_email: "your@email.com"
  internshala_email: "your@email.com"
```

### Recipients CSV (config/recipients.csv)

```csv
name,email,company,position_type,industry
John Doe,john@techcorp.com,TechCorp,Software Engineer,Technology
Jane Smith,jane@startup.io,Startup Inc,Full Stack Developer,Technology
```

## 💡 Usage Examples

### Example 1: LinkedIn Only
```python
from main import JobAutomationBot

bot = JobAutomationBot()
results = bot.run_linkedin_outreach(
    target_roles=['Python Developer Recruiter', 'Tech HR']
)
```

### Example 2: Custom Email Campaign
```python
recipients = [
    {'name': 'John', 'email': 'john@company.com', 'company': 'TechCo'}
]
bot.run_gmail_campaign(recipient_list=recipients)
```

### Example 3: AI Message Generation
```python
from modules.ollama_ai import OllamaAI

ai = OllamaAI({'model': 'llama2'})
message = ai.generate_linkedin_message({
    'name': 'Sarah',
    'title': 'Tech Recruiter',
    'company': 'Google'
})
```

## 🛡️ Safety Features

### Rate Limiting
- Configurable daily limits
- Delays between actions
- Prevents account bans

### Privacy
- 100% local AI processing
- No external API calls for AI
- Credentials stored locally
- No data collection

### Logging
- All actions logged
- Email tracking
- Daily reports
- Error monitoring

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
tail -f logs/bot_*.log

# Sent emails
cat logs/sent_emails.csv

# Daily report
cat logs/report_2024-01-15.json
```

### Generate Report
```bash
python main.py --report
```

## 🔧 Customization

### Add New Platform
1. Create new module in `modules/`
2. Implement platform-specific logic
3. Add to `main.py`
4. Update config

### Customize AI Prompts
Edit system prompts in `modules/ollama_ai.py`

### Add Templates
Create templates in `templates/` directory

## ⚠️ Important Warnings

### Legal Compliance
- Check each platform's Terms of Service
- Automation may violate platform policies
- Use responsibly and ethically
- Author not responsible for misuse

### Account Safety
- Start with low limits
- Test thoroughly first
- Don't use headless mode initially
- Complete manual verifications
- Vary your messages

### Best Practices
1. **Review AI output** before bulk sending
2. **Test with small batches** first
3. **Respect rate limits** strictly
4. **Keep credentials secure**
5. **Monitor logs** regularly
6. **Personalize messages** appropriately
7. **Follow platform guidelines**

## 🐛 Troubleshooting

### Ollama Not Working
```bash
# Check status
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama
ollama serve
```

### ChromeDriver Issues
```bash
pip install --upgrade webdriver-manager
```

### LinkedIn Login Failed
- Disable headless mode
- Complete 2FA manually
- Check credentials

### Gmail Authentication
- Use App Password (not regular password)
- Enable 2-Step Verification
- Generate new App Password

## 📚 Additional Resources

- **README.md** - Full documentation
- **QUICKSTART.md** - Quick start guide
- **examples.py** - Usage examples
- **setup.py** - Automated setup

## 🎓 Learning Path

1. **Day 1**: Setup and configuration
2. **Day 2**: Test individual modules
3. **Day 3**: Run limited campaigns
4. **Day 4**: Analyze results and adjust
5. **Day 5**: Full automation with monitoring

## 🔄 Typical Workflow

```
Morning:
  → Start Ollama server
  → Run LinkedIn automation
  → Check logs

Afternoon:
  → Send Gmail campaign
  → Apply to jobs on platforms
  → Monitor results

Evening:
  → X engagement
  → Review daily report
  → Adjust strategy

Weekly:
  → Analyze success metrics
  → Update recipients list
  → Fine-tune AI prompts
  → Adjust rate limits
```

## 📈 Expected Results

### Week 1
- 100+ LinkedIn connections
- 200+ cold emails sent
- 20+ X posts
- 50+ job applications

### Month 1
- 500+ network connections
- 1000+ emails sent
- Improved visibility
- Multiple interviews

### Success Metrics
- Response rate to emails
- LinkedIn acceptance rate
- Interview callbacks
- Job offers

## 🚀 Advanced Features

### Coming Soon
- Resume tailoring per job
- Interview preparation mode
- Response tracking
- Analytics dashboard
- Mobile notifications
- Better duplicate detection

### Contribution Welcome
- Add new platforms
- Improve AI prompts
- Enhance error handling
- Better analytics

## 📞 Support

### Issues
- Check logs first
- Review troubleshooting section
- Check examples
- Create GitHub issue

### Feature Requests
- Suggest improvements
- Submit pull requests
- Share feedback

## 🎉 Success Tips

1. **Quality over quantity** - Focus on relevant targets
2. **Personalization matters** - Review AI messages
3. **Consistency wins** - Run daily routines
4. **Track metrics** - Monitor what works
5. **Stay professional** - Even with automation
6. **Network genuinely** - Automation scales, doesn't replace
7. **Be patient** - Results take time

---

**Good luck with your job search!** 🌟

Remember: This tool amplifies your efforts but doesn't replace genuine networking and skill development.

Use responsibly, ethically, and always comply with platform policies.
