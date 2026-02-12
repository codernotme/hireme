import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { logBackend } from "@/lib/console-log";

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
  logBackend("info", "Onboarding config save requested.");
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
      name: String(payload.userName ?? ""),
      email: String(payload.userEmail ?? ""),
      phone: String(payload.userPhone ?? ""),
      title: String(payload.userTitle ?? ""),
      linkedin: String(payload.userLinkedin ?? ""),
      portfolio: String(payload.userPortfolio ?? ""),
      github: String(payload.userGithub ?? ""),
      skills: String(payload.userSkills ?? ""),
      experience: String(payload.userExperience ?? ""),
      education: String(payload.userEducation ?? ""),
      resume_path: String(payload.resumePath ?? ""),
    },
    linkedin: {
      email: String(payload.linkedinEmail ?? ""),
      password: String(payload.linkedinPassword ?? ""),
      headless: Boolean(payload.linkedinHeadless ?? false),
      allow_manual_verification: Boolean(
        payload.linkedinAllowManualVerification ?? false,
      ),
      manual_verification_timeout_seconds: Number(
        payload.linkedinManualVerificationTimeout ?? 180,
      ),
      manual_verification_poll_seconds: Number(
        payload.linkedinManualVerificationPoll ?? 5,
      ),
      target_roles: toCsvArray(String(payload.linkedinTargetRoles ?? ""), [
        "HR Manager",
        "Technical Recruiter",
        "Talent Acquisition",
      ]),
      target_tags: toCsvArray(String(payload.linkedinTargetTags ?? ""), []),
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
      message_template: String(payload.linkedinMessageTemplate ?? ""),
      message_tags: toCsvArray(String(payload.linkedinMessageTags ?? ""), []),
      message_image_paths: toCsvArray(
        String(payload.linkedinMessageImages ?? ""),
        [],
      ),
      persona_pack: String(payload.linkedinPersonaPack ?? ""),
      message_variants: {
        short: String(payload.linkedinMessageShort ?? ""),
        medium: String(payload.linkedinMessageMedium ?? ""),
        long: String(payload.linkedinMessageLong ?? ""),
      },
    },
    gmail: {
      email: String(payload.gmailEmail ?? ""),
      app_password: String(payload.gmailAppPassword ?? ""),
      recipients_csv: String(payload.gmailRecipientsCsv ?? "config/recipients.csv"),
      daily_email_limit: Number(payload.gmailDailyLimit ?? 50),
      delay_between_emails: Number(payload.gmailDelay ?? 60),
      my_name: String(payload.gmailName ?? ""),
      my_title: String(payload.gmailTitle ?? ""),
      my_phone: String(payload.gmailPhone ?? ""),
      my_linkedin: String(payload.gmailLinkedin ?? ""),
      my_portfolio: String(payload.gmailPortfolio ?? ""),
      my_skills: String(payload.gmailSkills ?? ""),
      my_experience: String(payload.gmailExperience ?? ""),
      attachment_paths: toCsvArray(String(payload.gmailAttachments ?? ""), []),
      target_tags: toCsvArray(String(payload.gmailTargetTags ?? ""), []),
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
      unstop_email: String(payload.unstopEmail ?? ""),
      unstop_password: String(payload.unstopPassword ?? ""),
      naukri_email: String(payload.naukriEmail ?? ""),
      naukri_password: String(payload.naukriPassword ?? ""),
      internshala_email: String(payload.internshalaEmail ?? ""),
      internshala_password: String(payload.internshalaPassword ?? ""),
      job_keywords: toCsvArray(String(payload.jobsKeywords ?? ""), [
        "Python Developer",
        "Software Engineer",
        "Full Stack Developer",
      ]),
      preferred_location: String(payload.jobsLocation ?? "Remote"),
      job_category: String(payload.jobsCategory ?? "Software Development"),
      my_name: String(payload.jobsName ?? ""),
      my_email: String(payload.jobsEmail ?? ""),
      my_phone: String(payload.jobsPhone ?? ""),
      my_skills: String(payload.jobsSkills ?? ""),
      my_experience: String(payload.jobsExperience ?? ""),
      my_education: String(payload.jobsEducation ?? ""),
      resume_path: String(payload.jobsResumePath ?? ""),
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

  logBackend("info", `Onboarding config saved to ${configPath}.`);

  return NextResponse.json({ ok: true, path: configPath });
}
