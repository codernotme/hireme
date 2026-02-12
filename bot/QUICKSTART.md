# 🚀 Quick Start Guide

Get the Job Automation Bot running in 5 minutes!

## Step 1: Install Ollama

### Linux/macOS
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Download from [ollama.com/download](https://ollama.com/download)

### Pull AI Model
```bash
ollama pull llama2
```

## Step 2: Start Ollama Server

```bash
ollama serve
```

Keep this terminal open!

## Step 3: Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd job-automation-bot

# Run setup script
python setup.py
```

## Step 4: Configure Credentials

Edit `config/config.yaml`:

```yaml
user_profile:
  name: "Your Name"
  email: "your.email@gmail.com"
  skills: "Python, JavaScript, React"
  resume_path: "/path/to/resume.pdf"

linkedin:
  email: "your.linkedin@gmail.com"
  password: "your_password"

gmail:
  email: "your.gmail@gmail.com"
  app_password: "xxxx xxxx xxxx xxxx"  # App Password!
```

### 🔑 Getting Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → App Passwords
3. Generate new app password
4. Use the 16-character code in config

## Step 5: Create Recipients List

```bash
cp config/recipients_sample.csv config/recipients.csv
```

Edit `config/recipients.csv`:
```csv
name,email,company,position_type,industry
John Doe,john@company.com,TechCorp,Software Engineer,Technology
```

## Step 6: Test Run

### Test LinkedIn (Safe Mode)
```bash
python main.py --mode linkedin
```

### Test Gmail
```bash
python main.py --mode gmail
```

### Test AI Generation
```bash
python examples.py
# Choose option 6
```

## Step 7: Run Full Automation

```bash
python main.py --mode full
```

## 📊 Check Results

```bash
# View logs
tail -f logs/bot_*.log

# Check sent emails
cat logs/sent_emails.csv

# Generate report
python main.py --report
```

## ⚠️ Important Tips

### Rate Limits (Default Safe Values)
- LinkedIn: 20 connections/day, 10 messages/day
- Gmail: 50 emails/day
- X: 3 posts/day
- Job platforms: 15 applications/day

### First Time Setup
1. **Don't use headless mode** initially (set `headless: false`)
2. **Manual verification**: Complete any CAPTCHA/2FA manually
3. **Start small**: Test with 2-3 actions first
4. **Review AI output**: Check generated messages before bulk sending

### Common Issues

**"Ollama not found"**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

**"ChromeDriver error"**
```bash
pip install --upgrade webdriver-manager
```

**"LinkedIn login failed"**
- Disable headless mode
- Complete verification manually
- Check credentials in config

**"Gmail authentication failed"**
- Use App Password, not regular password
- Check if 2FA is enabled
- Verify App Password is correct

## 🎯 Daily Routine

Create a cron job (Linux/Mac) or Task Scheduler (Windows):

```bash
# Edit crontab
crontab -e

# Add daily job at 9 AM
0 9 * * * cd /path/to/job-automation-bot && python main.py --mode full
```

## 🔒 Security Best Practices

1. **Never commit `config.yaml`** - it's in `.gitignore`
2. **Use App Passwords** - not your main Gmail password
3. **Review AI messages** - before bulk sending
4. **Respect rate limits** - to avoid bans
5. **Keep Ollama local** - your data stays private

## 📖 Learn More

- Full documentation: See [README.md](README.md)
- Example scripts: Run `python examples.py`
- Customize AI: Edit prompts in `modules/ollama_ai.py`
- Add platforms: See `modules/job_platform_bot.py`

## 🆘 Need Help?

1. Check [README.md](README.md) troubleshooting section
2. Review example scripts in `examples.py`
3. Check logs in `logs/` directory
4. Create an issue on GitHub

## ✅ Checklist

Before running full automation:

- [ ] Ollama installed and running
- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Config file updated with credentials
- [ ] Gmail App Password generated
- [ ] Recipients CSV created
- [ ] Resume uploaded and path set
- [ ] Tested with small batch first
- [ ] Reviewed AI-generated messages
- [ ] Understood rate limits and platform policies

---

**Ready to automate your job search!** 🎉

Start with LinkedIn-only mode to test:
```bash
python main.py --mode linkedin
```
