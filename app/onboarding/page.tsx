"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";

import { title, subtitle } from "@/components/primitives";

const defaultForm = {
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama2",
  ollamaTemperature: "0.7",
  userName: "codernotme",
  userEmail: "",
  userPhone: "",
  userTitle: "Software Developer",
  userLinkedin: "",
  userPortfolio: "",
  userGithub: "https://github.com/codernotme",
  userSkills: "Python, JavaScript, React, Node.js, Docker",
  userExperience: "3+ years in full-stack development",
  userEducation: "B.Tech in Computer Science",
  resumePath: "",
  linkedinEmail: "",
  linkedinPassword: "",
  linkedinTargetRoles: "HR Manager, Technical Recruiter, Talent Acquisition",
  linkedinTargetIndustry: "Technology",
  linkedinJobTitles: "Software Engineer, Python Developer, Full Stack Developer",
  linkedinDailyConnections: "20",
  linkedinDailyMessages: "10",
  linkedinDailyApplications: "15",
  linkedinMaxConnections: "10",
  linkedinBackground:
    "Experienced software developer passionate about building scalable applications",
  linkedinHeadless: false,
  gmailEmail: "",
  gmailAppPassword: "",
  gmailRecipientsCsv: "config/recipients.csv",
  gmailDailyLimit: "50",
  gmailDelay: "60",
  gmailName: "codernotme",
  gmailTitle: "Software Developer",
  gmailPhone: "",
  gmailLinkedin: "",
  gmailPortfolio: "",
  gmailSkills: "Python, React, Node.js, AWS",
  gmailExperience: "3+ years building web applications",
  xApiKey: "",
  xApiSecret: "",
  xAccessToken: "",
  xAccessTokenSecret: "",
  xBearerToken: "",
  xDailyPosts: "3",
  xDailyEngagements: "20",
  xDelayBetweenPosts: "3600",
  xAutoReply: false,
  xPostSchedule: "09:00, 13:00, 18:00",
  jobsHeadless: false,
  jobsDailyLimit: "15",
  unstopEmail: "",
  unstopPassword: "",
  naukriEmail: "",
  naukriPassword: "",
  internshalaEmail: "",
  internshalaPassword: "",
  jobsKeywords: "Python Developer, Software Engineer, Full Stack Developer",
  jobsLocation: "Remote",
  jobsCategory: "Software Development",
  jobsName: "codernotme",
  jobsEmail: "",
  jobsPhone: "",
  jobsSkills: "Python, JavaScript, React",
  jobsExperience: "3 years",
  jobsEducation: "B.Tech Computer Science",
  jobsResumePath: "",
};

type FormState = typeof defaultForm;

export default function OnboardingPage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parseStatus, setParseStatus] = useState<
    "idle" | "parsing" | "success" | "error"
  >("idle");
  const [parseMessage, setParseMessage] = useState<string>("");

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to write config file");
      }

      const data = (await response.json()) as { path?: string };
      setStatus("success");
      setMessage(`Config saved at ${data.path ?? "bot/config/config.yaml"}`);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to save configuration",
      );
    }
  };

  const mergeParsed = (data: Partial<FormState>) => {
    setForm((prev) => {
      const next = { ...prev };
      const assignIfEmpty = (key: keyof FormState, value?: string) => {
        if (value && !String(prev[key]).trim()) {
          next[key] = value as never;
        }
      };

      assignIfEmpty("userName", data.userName);
      assignIfEmpty("userEmail", data.userEmail);
      assignIfEmpty("userPhone", data.userPhone);
      assignIfEmpty("userTitle", data.userTitle);
      assignIfEmpty("userLinkedin", data.userLinkedin);
      assignIfEmpty("userPortfolio", data.userPortfolio);
      assignIfEmpty("userGithub", data.userGithub);
      assignIfEmpty("userSkills", data.userSkills);
      assignIfEmpty("userExperience", data.userExperience);
      assignIfEmpty("userEducation", data.userEducation);

      assignIfEmpty("gmailName", data.userName);
      assignIfEmpty("gmailEmail", data.userEmail);
      assignIfEmpty("gmailPhone", data.userPhone);
      assignIfEmpty("gmailTitle", data.userTitle);
      assignIfEmpty("gmailLinkedin", data.userLinkedin);
      assignIfEmpty("gmailPortfolio", data.userPortfolio);
      assignIfEmpty("gmailSkills", data.userSkills);
      assignIfEmpty("gmailExperience", data.userExperience);

      assignIfEmpty("jobsName", data.userName);
      assignIfEmpty("jobsEmail", data.userEmail);
      assignIfEmpty("jobsPhone", data.userPhone);
      assignIfEmpty("jobsSkills", data.userSkills);
      assignIfEmpty("jobsExperience", data.userExperience);
      assignIfEmpty("jobsEducation", data.userEducation);

      return next;
    });
  };

  const handleResumeParse = async () => {
    if (!resumeFile) {
      setParseStatus("error");
      setParseMessage("Please choose a resume file first.");

      return;
    }

    setParseStatus("parsing");
    setParseMessage("");

    try {
      const body = new FormData();
      body.append("file", resumeFile);
      body.append("ollamaBaseUrl", form.ollamaBaseUrl);
      body.append("ollamaModel", form.ollamaModel);

      const response = await fetch("/api/onboarding/parse-resume", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error("Resume parsing failed");
      }

      const payload = (await response.json()) as {
        data?: Partial<FormState>;
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      mergeParsed(payload.data ?? {});
      setParseStatus("success");
      setParseMessage("Resume parsed and fields filled where empty.");
    } catch (error) {
      setParseStatus("error");
      setParseMessage(
        error instanceof Error ? error.message : "Unable to parse resume",
      );
    }
  };

  return (
    <section className="flex flex-col gap-8 py-10">
      <div>
        <h1 className={title({ size: "lg" })}>Onboarding</h1>
        <p className={subtitle({ class: "mt-2" })}>
          Fill this once and generate your local bot config.
        </p>
      </div>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Resume Import</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-2">
            <input
              accept=".pdf,.txt"
              className="block w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm"
              type="file"
              onChange={(event) =>
                setResumeFile(event.target.files?.[0] ?? null)
              }
            />
            <span className="text-xs text-default-500">
              Upload a PDF or TXT resume. Ollama will extract key details locally.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              color="primary"
              isLoading={parseStatus === "parsing"}
              onPress={handleResumeParse}
              radius="full"
              variant="shadow"
            >
              Parse resume
            </Button>
            {parseStatus === "success" ? (
              <span className="text-xs text-success">{parseMessage}</span>
            ) : null}
            {parseStatus === "error" ? (
              <span className="text-xs text-danger">{parseMessage}</span>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Ollama</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Input
            label="Base URL"
            value={form.ollamaBaseUrl}
            onValueChange={(value) => update("ollamaBaseUrl", value)}
          />
          <Input
            label="Model"
            value={form.ollamaModel}
            onValueChange={(value) => update("ollamaModel", value)}
          />
          <Input
            label="Temperature"
            value={form.ollamaTemperature}
            onValueChange={(value) => update("ollamaTemperature", value)}
          />
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Profile</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Input
            label="Name"
            value={form.userName}
            onValueChange={(value) => update("userName", value)}
          />
          <Input
            label="Email"
            value={form.userEmail}
            onValueChange={(value) => update("userEmail", value)}
          />
          <Input
            label="Phone"
            value={form.userPhone}
            onValueChange={(value) => update("userPhone", value)}
          />
          <Input
            label="Title"
            value={form.userTitle}
            onValueChange={(value) => update("userTitle", value)}
          />
          <Input
            label="LinkedIn"
            value={form.userLinkedin}
            onValueChange={(value) => update("userLinkedin", value)}
          />
          <Input
            label="Portfolio"
            value={form.userPortfolio}
            onValueChange={(value) => update("userPortfolio", value)}
          />
          <Input
            label="GitHub"
            value={form.userGithub}
            onValueChange={(value) => update("userGithub", value)}
          />
          <Input
            label="Skills"
            value={form.userSkills}
            onValueChange={(value) => update("userSkills", value)}
          />
          <Input
            label="Experience"
            value={form.userExperience}
            onValueChange={(value) => update("userExperience", value)}
          />
          <Input
            label="Education"
            value={form.userEducation}
            onValueChange={(value) => update("userEducation", value)}
          />
          <Input
            label="Resume Path"
            value={form.resumePath}
            onValueChange={(value) => update("resumePath", value)}
          />
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">LinkedIn</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Input
            label="LinkedIn Email"
            value={form.linkedinEmail}
            onValueChange={(value) => update("linkedinEmail", value)}
          />
          <Input
            label="LinkedIn Password"
            type="password"
            value={form.linkedinPassword}
            onValueChange={(value) => update("linkedinPassword", value)}
          />
          <Switch
            isSelected={form.linkedinHeadless}
            onValueChange={(value) => update("linkedinHeadless", value)}
          >
            Headless mode
          </Switch>
          <Input
            label="Target roles (comma-separated)"
            value={form.linkedinTargetRoles}
            onValueChange={(value) => update("linkedinTargetRoles", value)}
          />
          <Input
            label="Target industry"
            value={form.linkedinTargetIndustry}
            onValueChange={(value) => update("linkedinTargetIndustry", value)}
          />
          <Input
            label="Job titles (comma-separated)"
            value={form.linkedinJobTitles}
            onValueChange={(value) => update("linkedinJobTitles", value)}
          />
          <Input
            label="Daily connections"
            value={form.linkedinDailyConnections}
            onValueChange={(value) => update("linkedinDailyConnections", value)}
          />
          <Input
            label="Daily messages"
            value={form.linkedinDailyMessages}
            onValueChange={(value) => update("linkedinDailyMessages", value)}
          />
          <Input
            label="Daily applications"
            value={form.linkedinDailyApplications}
            onValueChange={(value) => update("linkedinDailyApplications", value)}
          />
          <Input
            label="Max connections per search"
            value={form.linkedinMaxConnections}
            onValueChange={(value) => update("linkedinMaxConnections", value)}
          />
          <Input
            label="Background summary"
            value={form.linkedinBackground}
            onValueChange={(value) => update("linkedinBackground", value)}
          />
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Gmail</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Input
            label="Gmail"
            value={form.gmailEmail}
            onValueChange={(value) => update("gmailEmail", value)}
          />
          <Input
            label="App password"
            type="password"
            value={form.gmailAppPassword}
            onValueChange={(value) => update("gmailAppPassword", value)}
          />
          <Input
            label="Recipients CSV"
            value={form.gmailRecipientsCsv}
            onValueChange={(value) => update("gmailRecipientsCsv", value)}
          />
          <Input
            label="Daily limit"
            value={form.gmailDailyLimit}
            onValueChange={(value) => update("gmailDailyLimit", value)}
          />
          <Input
            label="Delay between emails (sec)"
            value={form.gmailDelay}
            onValueChange={(value) => update("gmailDelay", value)}
          />
          <Input
            label="Signature name"
            value={form.gmailName}
            onValueChange={(value) => update("gmailName", value)}
          />
          <Input
            label="Signature title"
            value={form.gmailTitle}
            onValueChange={(value) => update("gmailTitle", value)}
          />
          <Input
            label="Signature phone"
            value={form.gmailPhone}
            onValueChange={(value) => update("gmailPhone", value)}
          />
          <Input
            label="Signature LinkedIn"
            value={form.gmailLinkedin}
            onValueChange={(value) => update("gmailLinkedin", value)}
          />
          <Input
            label="Signature portfolio"
            value={form.gmailPortfolio}
            onValueChange={(value) => update("gmailPortfolio", value)}
          />
          <Input
            label="Signature skills"
            value={form.gmailSkills}
            onValueChange={(value) => update("gmailSkills", value)}
          />
          <Input
            label="Signature experience"
            value={form.gmailExperience}
            onValueChange={(value) => update("gmailExperience", value)}
          />
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">X (Twitter)</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Input
            label="API key"
            value={form.xApiKey}
            onValueChange={(value) => update("xApiKey", value)}
          />
          <Input
            label="API secret"
            value={form.xApiSecret}
            onValueChange={(value) => update("xApiSecret", value)}
          />
          <Input
            label="Access token"
            value={form.xAccessToken}
            onValueChange={(value) => update("xAccessToken", value)}
          />
          <Input
            label="Access token secret"
            value={form.xAccessTokenSecret}
            onValueChange={(value) => update("xAccessTokenSecret", value)}
          />
          <Input
            label="Bearer token"
            value={form.xBearerToken}
            onValueChange={(value) => update("xBearerToken", value)}
          />
          <Input
            label="Daily posts"
            value={form.xDailyPosts}
            onValueChange={(value) => update("xDailyPosts", value)}
          />
          <Input
            label="Daily engagements"
            value={form.xDailyEngagements}
            onValueChange={(value) => update("xDailyEngagements", value)}
          />
          <Input
            label="Delay between posts (sec)"
            value={form.xDelayBetweenPosts}
            onValueChange={(value) => update("xDelayBetweenPosts", value)}
          />
          <Switch
            isSelected={form.xAutoReply}
            onValueChange={(value) => update("xAutoReply", value)}
          >
            Auto-reply
          </Switch>
          <Input
            label="Post schedule (comma-separated)"
            value={form.xPostSchedule}
            onValueChange={(value) => update("xPostSchedule", value)}
          />
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Job platforms</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Switch
            isSelected={form.jobsHeadless}
            onValueChange={(value) => update("jobsHeadless", value)}
          >
            Headless mode
          </Switch>
          <Input
            label="Daily limit"
            value={form.jobsDailyLimit}
            onValueChange={(value) => update("jobsDailyLimit", value)}
          />
          <Input
            label="Unstop email"
            value={form.unstopEmail}
            onValueChange={(value) => update("unstopEmail", value)}
          />
          <Input
            label="Unstop password"
            type="password"
            value={form.unstopPassword}
            onValueChange={(value) => update("unstopPassword", value)}
          />
          <Input
            label="Naukri email"
            value={form.naukriEmail}
            onValueChange={(value) => update("naukriEmail", value)}
          />
          <Input
            label="Naukri password"
            type="password"
            value={form.naukriPassword}
            onValueChange={(value) => update("naukriPassword", value)}
          />
          <Input
            label="Internshala email"
            value={form.internshalaEmail}
            onValueChange={(value) => update("internshalaEmail", value)}
          />
          <Input
            label="Internshala password"
            type="password"
            value={form.internshalaPassword}
            onValueChange={(value) => update("internshalaPassword", value)}
          />
          <Input
            label="Job keywords (comma-separated)"
            value={form.jobsKeywords}
            onValueChange={(value) => update("jobsKeywords", value)}
          />
          <Input
            label="Preferred location"
            value={form.jobsLocation}
            onValueChange={(value) => update("jobsLocation", value)}
          />
          <Input
            label="Job category"
            value={form.jobsCategory}
            onValueChange={(value) => update("jobsCategory", value)}
          />
          <Input
            label="Name"
            value={form.jobsName}
            onValueChange={(value) => update("jobsName", value)}
          />
          <Input
            label="Email"
            value={form.jobsEmail}
            onValueChange={(value) => update("jobsEmail", value)}
          />
          <Input
            label="Phone"
            value={form.jobsPhone}
            onValueChange={(value) => update("jobsPhone", value)}
          />
          <Input
            label="Skills"
            value={form.jobsSkills}
            onValueChange={(value) => update("jobsSkills", value)}
          />
          <Input
            label="Experience"
            value={form.jobsExperience}
            onValueChange={(value) => update("jobsExperience", value)}
          />
          <Input
            label="Education"
            value={form.jobsEducation}
            onValueChange={(value) => update("jobsEducation", value)}
          />
          <Input
            label="Resume path"
            value={form.jobsResumePath}
            onValueChange={(value) => update("jobsResumePath", value)}
          />
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          color="primary"
          isLoading={status === "saving"}
          onPress={handleSubmit}
          radius="full"
          variant="shadow"
        >
          Generate config
        </Button>
        {status === "success" ? (
          <span className="text-sm text-success">{message}</span>
        ) : null}
        {status === "error" ? (
          <span className="text-sm text-danger">{message}</span>
        ) : null}
      </div>
    </section>
  );
}
