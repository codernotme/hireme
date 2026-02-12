#!/usr/bin/env python3
"""
Setup Script for Job Automation Bot
Helps users get started quickly
"""

import subprocess
import sys
import os
from pathlib import Path


def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")


def check_python_version():
    """Check if Python version is compatible"""
    print_header("Checking Python Version")
    
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required!")
        sys.exit(1)
    
    print("✅ Python version is compatible")


def check_ollama():
    """Check if Ollama is installed and running"""
    print_header("Checking Ollama")
    
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            print("✅ Ollama is installed")
            print("\nInstalled models:")
            print(result.stdout)
            
            if "llama2" not in result.stdout:
                print("\n⚠️  Llama2 not found. Pulling model...")
                subprocess.run(["ollama", "pull", "llama2"])
                print("✅ Llama2 model downloaded")
        else:
            print("❌ Ollama is installed but not responding")
            print("Please run: ollama serve")
    
    except FileNotFoundError:
        print("❌ Ollama is not installed!")
        print("\nInstallation instructions:")
        print("  Linux:   curl -fsSL https://ollama.com/install.sh | sh")
        print("  macOS:   brew install ollama")
        print("  Windows: Download from https://ollama.com/download")
        print("\nAfter installation, run: ollama pull llama2")
        sys.exit(1)
    
    except Exception as e:
        print(f"⚠️  Could not verify Ollama: {e}")


def install_dependencies():
    """Install Python dependencies"""
    print_header("Installing Dependencies")
    
    try:
        print("Installing packages from requirements.txt...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            check=True
        )
        print("✅ Dependencies installed successfully")
    
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)


def create_directory_structure():
    """Create necessary directories"""
    print_header("Creating Directory Structure")
    
    directories = [
        "config",
        "logs",
        "templates",
        "modules"
    ]
    
    for directory in directories:
        path = Path(directory)
        path.mkdir(exist_ok=True)
        print(f"✅ Created {directory}/")


def create_config():
    """Create initial configuration"""
    print_header("Creating Configuration")
    
    from config.settings import Settings
    
    settings = Settings()
    
    if Path("config/config.yaml").exists():
        print("⚠️  Configuration file already exists")
        response = input("Do you want to overwrite it? (y/N): ")
        
        if response.lower() != 'y':
            print("Keeping existing configuration")
            return
    
    # Config is auto-created by Settings class
    print("✅ Configuration file created at config/config.yaml")
    print("\n⚠️  IMPORTANT: Please edit config/config.yaml with your credentials!")


def create_sample_files():
    """Create sample files"""
    print_header("Creating Sample Files")
    
    # Create sample recipients CSV
    from modules.gmail_bot import GmailBot
    
    gmail_bot = GmailBot({}, None)
    gmail_bot.create_sample_recipients_csv()
    
    print("✅ Sample files created")


def print_next_steps():
    """Print instructions for next steps"""
    print_header("Setup Complete!")
    
    print("""
Next steps:

1. Start Ollama server (in a separate terminal):
   $ ollama serve

2. Edit the configuration file with your credentials:
   $ nano config/config.yaml
   
   Required credentials:
   - LinkedIn email and password
   - Gmail email and App Password
   - X (Twitter) API credentials
   - Platform credentials (Unstop, Naukri, etc.)

3. Create your recipients list (for Gmail):
   $ cp config/recipients_sample.csv config/recipients.csv
   $ nano config/recipients.csv

4. Test the bot:
   $ python main.py --mode linkedin  # Test LinkedIn only
   $ python main.py --mode gmail     # Test Gmail only

5. Run full automation:
   $ python main.py --mode full

For more information, see README.md

Happy job hunting! 🎉
    """)


def main():
    """Main setup function"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║           Job Automation Bot - Setup Script              ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    try:
        check_python_version()
        check_ollama()
        create_directory_structure()
        install_dependencies()
        create_config()
        create_sample_files()
        print_next_steps()
    
    except KeyboardInterrupt:
        print("\n\nSetup interrupted by user")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n\n❌ Setup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
