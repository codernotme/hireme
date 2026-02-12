# 🤖 Job Automation Bot

An intelligent automation bot that helps streamline your job search by automatically sending connection requests on LinkedIn, cold emails via Gmail, posting on X (Twitter), and applying to jobs on platforms like Unstop, Naukri, and Internshala. Powered by **Ollama** for local AI-generated personalized messages.

## ✨ Features

- 🔗 **LinkedIn Automation**
  - Automated connection requests to HR and recruiters
  - Personalized messages using AI
  - Automatic job applications (Easy Apply)
  - Message follow-ups

- 📧 **Gmail Cold Email Campaigns**
  - AI-generated personalized cold emails
  - Bulk email sending with rate limiting
  - Follow-up email automation
  - Professional email templates

- 🐦 **X (Twitter) Engagement**
  - Automated job search posts
  - Engagement with recruiter tweets
  - Profile optimization (#OpenToWork)
  - Thread creation for visibility

- 💼 **Multi-Platform Job Applications**
  - Unstop (competitions and opportunities)
  - Naukri.com (jobs)
  - Internshala (internships)
  - LinkedIn (Easy Apply)
  - AI-generated cover letters

- 🧠 **Local AI with Ollama**
  - All message generation happens locally
  - No data sent to external AI APIs
  - Customizable AI models
  - Privacy-first approach

## 📋 Prerequisites

### 1. Install Ollama

```bash
# For Linux
curl -fsSL https://ollama.com/install.sh | sh

# For macOS
brew install ollama

# For Windows
# Download from https://ollama.com/download
```

### 2. Pull AI Model

```bash
# Pull Llama 2 (default)
ollama pull llama2

# Or use other models:
# ollama pull mistral
# ollama pull codellama
# ollama pull neural-chat
```

### 3. Python Requirements

- Python 3.8 or higher
- Chrome browser (for Selenium automation)
- ChromeDriver (will be installed automatically)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/job-automation-bot.git
cd job-automation-bot
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install ChromeDriver (if not auto-installed)

```bash
# Linux
sudo apt-get install chromium-chromedriver

# macOS
brew install chromedriver

# Or use webdriver-manager (automatic)
python -c "from selenium import webdriver; webdriver.Chrome()"
```

## ⚙️ Configuration

### 1. Run Initial Setup

```bash
python main.py
```

This will create a default `config/config.yaml` file.

### 2. Edit Configuration

Open `config/config.yaml` and update with your credentials:

```yaml
ollama:
  base_url: http://localhost:11434
  model: llama2  # or mistral, codellama, etc.

user_profile:
  name: "Your Name"
  email: "your.email@gmail.com"
  phone: "+1234567890"
  title: "Software Developer"
  skills: "Python, JavaScript, React, Docker"
  resume_path: "/path/to/your/resume.pdf"

linkedin:
  email: "your.linkedin@gmail.com"
  password: "your_password"
  daily_connection_limit: 20
  daily_application_limit: 15

gmail:
  email: "your.gmail@gmail.com"
  app_password: "xxxx xxxx xxxx xxxx"  # Generate App Password!
  daily_email_limit: 50

x_twitter:
  api_key: "your_api_key"
  api_secret: "your_api_secret"
  access_token: "your_access_token"
  access_token_secret: "your_access_token_secret"
```

### 3. Gmail App Password

⚠️ **Important**: Don't use your regular Gmail password!

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this 16-character password in config

### 4. X (Twitter) API Credentials

1. Go to https://developer.twitter.com/
2. Create a new app
3. Generate API keys and tokens
4. Add them to config

### 5. Create Recipients List (for Gmail)

Create `config/recipients.csv`:

```csv
name,email,company,position_type,industry
John Doe,john@example.com,Tech Corp,Software Engineer,Technology
Jane Smith,jane@startup.com,Startup Inc,Full Stack Developer,Technology
```

## 📝 Usage

### Start Ollama Server

```bash
ollama serve
```

Keep this running in a separate terminal.

### Run Full Automation

```bash
python main.py --mode full
```

### Run Specific Modules

```bash
# LinkedIn only
python main.py --mode linkedin

# Gmail only
python main.py --mode gmail

# X (Twitter) only
python main.py --mode x

# Job platforms only
python main.py --mode jobs
```

### Generate Daily Report

```bash
python main.py --report
```

### Custom Configuration

```bash
python main.py --config /path/to/custom/config.yaml
```

## 🎯 How It Works

### 1. LinkedIn Automation
```
Search for HRs/Recruiters → Generate personalized message with AI → 
Send connection request → Follow up after connection → Apply to jobs
```

### 2. Gmail Campaign
```
Load recipients → Generate personalized email with AI → 
Send email → Log sent emails → Schedule follow-ups
```

### 3. X Engagement
```
Generate engaging posts with AI → Post at optimal times → 
Search for hiring posts → Engage (like/reply) → Follow recruiters
```

### 4. Job Applications
```
Login to platform → Search relevant jobs → 
Generate cover letter with AI → Fill application → Submit → Track
```

## 🛡️ Safety & Best Practices

### Rate Limiting
- LinkedIn: Max 20 connections/day, 10 messages/day
- Gmail: Max 50 emails/day
- X: Max 3 posts/day, 20 engagements/day
- Job Platforms: Max 15 applications/day

### Avoid Bans
- Use realistic delays between actions
- Don't run in headless mode initially (LinkedIn detection)
- Vary your messages (AI helps with this)
- Don't exceed daily limits

### Privacy
- All AI processing happens locally (Ollama)
- Credentials stored locally in config
- No data sent to external APIs (except platform APIs)

## 📊 Monitoring & Logs

### View Logs
```bash
tail -f logs/bot_*.log
```

### Check Statistics
Logs are saved in `logs/` directory:
- `bot_YYYYMMDD_HHMMSS.log` - Main bot logs
- `sent_emails.csv` - Email tracking
- `report_YYYY-MM-DD.json` - Daily reports

## 🔧 Troubleshooting

### Ollama Not Connecting
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama
ollama serve
```

### ChromeDriver Issues
```bash
# Update ChromeDriver
pip install --upgrade webdriver-manager

# Or manually download matching version
# Check Chrome version: chrome://version
```

### LinkedIn Login Issues
- Disable headless mode
- Complete verification manually
- Use session cookies (advanced)

### Gmail Authentication Failed
- Verify App Password is correct
- Enable "Less secure app access" (not recommended)
- Use OAuth2 instead (advanced)

## 🚨 Disclaimer

**Important Legal Notice:**

- This bot is for **educational purposes** only
- Automated actions may violate platform Terms of Service
- Use at your own risk
- Author is not responsible for account bans or legal issues
- Always review and comply with each platform's automation policies
- Consider using official APIs where available

**Recommended Usage:**
- Use for personal job search automation
- Don't spam or harass
- Personalize messages appropriately
- Respect rate limits
- Follow platform guidelines

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Ollama](https://ollama.com/) - Local AI models
- [Selenium](https://www.selenium.dev/) - Web automation
- [Tweepy](https://www.tweepy.org/) - X (Twitter) API

## 📧 Support

For issues or questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Read the troubleshooting section

## 🗺️ Roadmap

- [ ] Add more job platforms (Indeed, Glassdoor, etc.)
- [ ] Email response tracking
- [ ] Advanced AI conversation handling
- [ ] Better duplicate detection
- [ ] Analytics dashboard
- [ ] Mobile app notifications
- [ ] Resume tailoring per job
- [ ] Interview preparation mode

## 💡 Tips for Success

1. **Start Small**: Test with a few connections/emails first
2. **Personalize**: Review AI-generated messages before bulk sending
3. **Be Patient**: Respect rate limits and delays
4. **Update Profile**: Ensure your LinkedIn/resume is current
5. **Track Results**: Review logs and adjust strategy
6. **Stay Professional**: AI helps, but always maintain professionalism
7. **Network Genuinely**: Use automation to scale, not replace, real networking

---

**Happy Job Hunting! 🎉**

If this tool helps you land your dream job, consider giving it a ⭐ on GitHub!
