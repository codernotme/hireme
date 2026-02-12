import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

const toCsvArray = (value: string | undefined, fallback: string[]) => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const config = {
    ollama: {
      base_url: String(payload.ollamaBaseUrl ?? "http://localhost:11434"),
      model: String(payload.ollamaModel ?? "llama2"),
      temperature: Number(payload.ollamaTemperature ?? 0.7),
    },
    user_profile: {
      name: String(payload.userName ?? "codernotme"),
      email: String(payload.userEmail ?? "your.email@gmail.com"),
      phone: String(payload.userPhone ?? "+1234567890"),
      title: String(payload.userTitle ?? "Software Developer"),
      linkedin: String(payload.userLinkedin ?? "https://linkedin.com/in/yourprofile"),
      portfolio: String(payload.userPortfolio ?? "https://yourportfolio.com"),
      github: String(payload.userGithub ?? "https://github.com/codernotme"),
      skills: String(payload.userSkills ?? "Python, JavaScript, React, Node.js, Docker"),
      experience: String(payload.userExperience ?? "3+ years in full-stack development"),
      education: String(payload.userEducation ?? "B.Tech in Computer Science"),
      resume_path: String(payload.resumePath ?? "/path/to/your/resume.pdf"),
    },
    linkedin: {
      email: String(payload.linkedinEmail ?? "your.linkedin.email@gmail.com"),
      password: String(payload.linkedinPassword ?? "your_linkedin_password"),
      headless: Boolean(payload.linkedinHeadless ?? false),
      target_roles: toCsvArray(String(payload.linkedinTargetRoles ?? ""), [
        "HR Manager",
        "Technical Recruiter",
        "Talent Acquisition",
      ]),
      target_industry: String(payload.linkedinTargetIndustry ?? "Technology"),
      job_titles: toCsvArray(String(payload.linkedinJobTitles ?? ""), [
        "Software Engineer",
        "Python Developer",
        "Full Stack Developer",
      ]),
      daily_connection_limit: Number(payload.linkedinDailyConnections ?? 20),
      daily_message_limit: Number(payload.linkedinDailyMessages ?? 10),
      daily_application_limit: Number(payload.linkedinDailyApplications ?? 15),
      max_connections_per_search: Number(payload.linkedinMaxConnections ?? 10),
      my_background: String(
        payload.linkedinBackground ??
          "Experienced software developer passionate about building scalable applications",
      ),
    },
    gmail: {
      email: String(payload.gmailEmail ?? "your.gmail@gmail.com"),
      app_password: String(payload.gmailAppPassword ?? "your_gmail_app_password"),
      recipients_csv: String(payload.gmailRecipientsCsv ?? "config/recipients.csv"),
      daily_email_limit: Number(payload.gmailDailyLimit ?? 50),
      delay_between_emails: Number(payload.gmailDelay ?? 60),
      my_name: String(payload.gmailName ?? "codernotme"),
      my_title: String(payload.gmailTitle ?? "Software Developer"),
      my_phone: String(payload.gmailPhone ?? "+1234567890"),
      my_linkedin: String(payload.gmailLinkedin ?? "https://linkedin.com/in/yourprofile"),
      my_portfolio: String(payload.gmailPortfolio ?? "https://yourportfolio.com"),
      my_skills: String(payload.gmailSkills ?? "Python, React, Node.js, AWS"),
      my_experience: String(payload.gmailExperience ?? "3+ years building web applications"),
    },
    x_twitter: {
      api_key: String(payload.xApiKey ?? "your_x_api_key"),
      api_secret: String(payload.xApiSecret ?? "your_x_api_secret"),
      access_token: String(payload.xAccessToken ?? "your_x_access_token"),
      access_token_secret: String(payload.xAccessTokenSecret ?? "your_x_access_token_secret"),
      bearer_token: String(payload.xBearerToken ?? "your_x_bearer_token"),
      daily_post_limit: Number(payload.xDailyPosts ?? 3),
      daily_engagement_limit: Number(payload.xDailyEngagements ?? 20),
      delay_between_posts: Number(payload.xDelayBetweenPosts ?? 3600),
      auto_reply: Boolean(payload.xAutoReply ?? false),
      post_schedule: toCsvArray(String(payload.xPostSchedule ?? ""), [
        "09:00",
        "13:00",
        "18:00",
      ]),
      recruiters_to_follow: [],
    },
    job_platforms: {
      headless: Boolean(payload.jobsHeadless ?? false),
      daily_application_limit: Number(payload.jobsDailyLimit ?? 15),
      unstop_email: String(payload.unstopEmail ?? "your.unstop.email@gmail.com"),
      unstop_password: String(payload.unstopPassword ?? "your_unstop_password"),
      naukri_email: String(payload.naukriEmail ?? "your.naukri.email@gmail.com"),
      naukri_password: String(payload.naukriPassword ?? "your_naukri_password"),
      internshala_email: String(payload.internshalaEmail ?? "your.internshala.email@gmail.com"),
      internshala_password: String(payload.internshalaPassword ?? "your_internshala_password"),
      job_keywords: toCsvArray(String(payload.jobsKeywords ?? ""), [
        "Python Developer",
        "Software Engineer",
        "Full Stack Developer",
      ]),
      preferred_location: String(payload.jobsLocation ?? "Remote"),
      job_category: String(payload.jobsCategory ?? "Software Development"),
      my_name: String(payload.jobsName ?? "codernotme"),
      my_email: String(payload.jobsEmail ?? "your.email@gmail.com"),
      my_phone: String(payload.jobsPhone ?? "+1234567890"),
      my_skills: String(payload.jobsSkills ?? "Python, JavaScript, React"),
      my_experience: String(payload.jobsExperience ?? "3 years"),
      my_education: String(payload.jobsEducation ?? "B.Tech Computer Science"),
      resume_path: String(payload.jobsResumePath ?? "/path/to/resume.pdf"),
    },
  };

  const configPath = path.resolve(
    process.cwd(),
    "bot",
    "config",
    "config.yaml",
  );

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, yaml.dump(config, { sortKeys: false }));

  return NextResponse.json({ ok: true, path: configPath });
}
