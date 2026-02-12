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
  userName: "",
  userEmail: "",
  userPhone: "",
  userTitle: "",
  userLinkedin: "",
  userPortfolio: "",
  userGithub: "",
  userSkills: "",
  userExperience: "",
  userEducation: "",
  resumePath: "",
  linkedinEmail: "",
  linkedinPassword: "",
  linkedinTargetRoles: "HR Manager, Technical Recruiter, Talent Acquisition",
  linkedinTargetTags: "",
  linkedinTargetIndustry: "Technology",
  linkedinJobTitles: "Software Engineer, Python Developer, Full Stack Developer",
  linkedinDailyConnections: "20",
  linkedinDailyMessages: "10",
  linkedinDailyApplications: "15",
  linkedinMaxConnections: "10",
  linkedinBackground:
    "Experienced software developer passionate about building scalable applications",
  linkedinMessageTemplate: "",
  linkedinMessageTags: "",
  linkedinMessageImages: "",
  linkedinMessageShort: "",
  linkedinMessageMedium: "",
  linkedinMessageLong: "",
  linkedinPersonaPack: "",
  linkedinHeadless: false,
  linkedinAllowManualVerification: false,
  linkedinManualVerificationTimeout: "180",
  linkedinManualVerificationPoll: "5",
  gmailEmail: "",
  gmailAppPassword: "",
  gmailRecipientsCsv: "config/recipients.csv",
  gmailDailyLimit: "50",
  gmailDelay: "60",
  gmailName: "",
  gmailTitle: "",
  gmailPhone: "",
  gmailLinkedin: "",
  gmailPortfolio: "",
  gmailSkills: "",
  gmailExperience: "",
  gmailAttachments: "",
  gmailTargetTags: "",
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
  jobsName: "",
  jobsEmail: "",
  jobsPhone: "",
  jobsSkills: "",
  jobsExperience: "",
  jobsEducation: "",
  jobsResumePath: "",
};

type FormState = typeof defaultForm;

type WizardQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
};

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
  const [resumeUploadStatus, setResumeUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [resumeUploadMessage, setResumeUploadMessage] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUploadStatus, setImageUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [imageUploadMessage, setImageUploadMessage] = useState<string>("");
  const [wizardStatus, setWizardStatus] = useState<
    "idle" | "loading" | "ready" | "scoring" | "success" | "error"
  >("idle");
  const [wizardMessage, setWizardMessage] = useState<string>("");
  const [wizardQuestions, setWizardQuestions] = useState<WizardQuestion[]>([]);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>(
    {},
  );
  const [wizardExplanations, setWizardExplanations] = useState<string[]>([]);
  const [personaStatus, setPersonaStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [personaMessage, setPersonaMessage] = useState<string>("");
  const [variantStatus, setVariantStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [variantMessage, setVariantMessage] = useState<string>("");

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

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setResumeUploadStatus("error");
      setResumeUploadMessage("Please choose a resume file first.");

      return;
    }

    setResumeUploadStatus("uploading");
    setResumeUploadMessage("");

    try {
      const body = new FormData();
      body.append("kind", "resume");
      body.append("file", resumeFile);

      const response = await fetch("/api/onboarding/upload", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error("Resume upload failed");
      }

      const payload = (await response.json()) as {
        paths?: string[];
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      const resumePath = payload.paths?.[0];

      if (resumePath) {
        update("resumePath", resumePath);
        update("jobsResumePath", resumePath);
      }

      setResumeUploadStatus("success");
      setResumeUploadMessage("Resume saved locally.");
    } catch (error) {
      setResumeUploadStatus("error");
      setResumeUploadMessage(
        error instanceof Error ? error.message : "Unable to upload resume",
      );
    }
  };

  const handleImageUpload = async () => {
    if (!imageFiles.length) {
      setImageUploadStatus("error");
      setImageUploadMessage("Please choose image files first.");

      return;
    }

    setImageUploadStatus("uploading");
    setImageUploadMessage("");

    try {
      const body = new FormData();
      body.append("kind", "images");
      imageFiles.forEach((file) => body.append("files", file));

      const response = await fetch("/api/onboarding/upload", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const payload = (await response.json()) as {
        paths?: string[];
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      const imagePaths = payload.paths ?? [];
      const joined = imagePaths.join(", ");

      if (joined) {
        update("linkedinMessageImages", joined);
        update("gmailAttachments", joined);
      }

      setImageUploadStatus("success");
      setImageUploadMessage("Images saved locally.");
    } catch (error) {
      setImageUploadStatus("error");
      setImageUploadMessage(
        error instanceof Error ? error.message : "Unable to upload images",
      );
    }
  };

  const getProfileSnapshot = () => ({
    name: form.userName,
    title: form.userTitle,
    skills: form.userSkills,
    experience: form.userExperience,
    education: form.userEducation,
    targetRoles: form.linkedinTargetRoles,
    targetIndustry: form.linkedinTargetIndustry,
    jobTitles: form.linkedinJobTitles,
  });

  const handleWizardStart = async () => {
    setWizardStatus("loading");
    setWizardMessage("");

    try {
      const response = await fetch("/api/onboarding/tag-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "questions",
          mcqCount: 5,
          ollamaBaseUrl: form.ollamaBaseUrl,
          ollamaModel: form.ollamaModel,
          profile: getProfileSnapshot(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const payload = (await response.json()) as {
        questions?: WizardQuestion[];
        error?: string;
      };

      if (payload.error || !payload.questions?.length) {
        throw new Error(payload.error ?? "No questions returned");
      }

      setWizardQuestions(payload.questions);
      setWizardAnswers({});
      setWizardExplanations([]);
      setWizardStatus("ready");
    } catch (error) {
      setWizardStatus("error");
      setWizardMessage(
        error instanceof Error ? error.message : "Unable to start wizard",
      );
    }
  };

  const handleWizardScore = async () => {
    setWizardStatus("scoring");
    setWizardMessage("");

    try {
      const response = await fetch("/api/onboarding/tag-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "score",
          ollamaBaseUrl: form.ollamaBaseUrl,
          ollamaModel: form.ollamaModel,
          profile: getProfileSnapshot(),
          questions: wizardQuestions,
          answers: wizardAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to score tags");
      }

      const payload = (await response.json()) as {
        tags?: {
          linkedinTargetTags?: string[];
          gmailTargetTags?: string[];
          linkedinMessageTags?: string[];
          explanations?: string[];
        };
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      const linkedinTargetTags = payload.tags?.linkedinTargetTags ?? [];
      const gmailTargetTags = payload.tags?.gmailTargetTags ?? [];
      const linkedinMessageTags = payload.tags?.linkedinMessageTags ?? [];
      const explanations = payload.tags?.explanations ?? [];

      update("linkedinTargetTags", linkedinTargetTags.join(", "));
      update("gmailTargetTags", gmailTargetTags.join(", "));
      update("linkedinMessageTags", linkedinMessageTags.join(", "));
      setWizardExplanations(explanations);

      setWizardStatus("success");
      setWizardMessage("Tags updated from the smart wizard.");
    } catch (error) {
      setWizardStatus("error");
      setWizardMessage(
        error instanceof Error ? error.message : "Unable to score tags",
      );
    }
  };

  const handlePersonaPack = async (persona: string) => {
    setPersonaStatus("loading");
    setPersonaMessage("");
    setWizardExplanations([]);

    try {
      const response = await fetch("/api/onboarding/tag-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "persona",
          persona,
          ollamaBaseUrl: form.ollamaBaseUrl,
          ollamaModel: form.ollamaModel,
          profile: getProfileSnapshot(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply persona pack");
      }

      const payload = (await response.json()) as {
        tags?: {
          linkedinTargetTags?: string[];
          gmailTargetTags?: string[];
          linkedinMessageTags?: string[];
          explanations?: string[];
        };
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      const linkedinTargetTags = payload.tags?.linkedinTargetTags ?? [];
      const gmailTargetTags = payload.tags?.gmailTargetTags ?? [];
      const linkedinMessageTags = payload.tags?.linkedinMessageTags ?? [];
      const explanations = payload.tags?.explanations ?? [];

      update("linkedinTargetTags", linkedinTargetTags.join(", "));
      update("gmailTargetTags", gmailTargetTags.join(", "));
      update("linkedinMessageTags", linkedinMessageTags.join(", "));
      update("linkedinPersonaPack", persona);
      setWizardExplanations(explanations);

      setPersonaStatus("success");
      setPersonaMessage("Persona pack applied.");
    } catch (error) {
      setPersonaStatus("error");
      setPersonaMessage(
        error instanceof Error ? error.message : "Unable to apply persona pack",
      );
    }
  };

  const handleGenerateVariants = async () => {
    setVariantStatus("loading");
    setVariantMessage("");

    try {
      const response = await fetch("/api/onboarding/tag-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "variants",
          ollamaBaseUrl: form.ollamaBaseUrl,
          ollamaModel: form.ollamaModel,
          profile: getProfileSnapshot(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate variants");
      }

      const payload = (await response.json()) as {
        variants?: {
          short?: string;
          medium?: string;
          long?: string;
        };
        error?: string;
      };

      if (payload.error) {
        throw new Error(payload.error);
      }

      update("linkedinMessageShort", payload.variants?.short ?? "");
      update("linkedinMessageMedium", payload.variants?.medium ?? "");
      update("linkedinMessageLong", payload.variants?.long ?? "");

      setVariantStatus("success");
      setVariantMessage("Message variants generated.");
    } catch (error) {
      setVariantStatus("error");
      setVariantMessage(
        error instanceof Error ? error.message : "Unable to generate variants",
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
        <CardBody className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
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
          <div className="flex flex-col gap-2">
            <Button
              color="secondary"
              isLoading={resumeUploadStatus === "uploading"}
              onPress={handleResumeUpload}
              radius="full"
              variant="flat"
            >
              Save resume locally
            </Button>
            {resumeUploadStatus === "success" ? (
              <span className="text-xs text-success">{resumeUploadMessage}</span>
            ) : null}
            {resumeUploadStatus === "error" ? (
              <span className="text-xs text-danger">{resumeUploadMessage}</span>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Local Media</CardHeader>
        <Divider />
        <CardBody className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-2">
            <input
              accept="image/*"
              className="block w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm"
              type="file"
              multiple
              onChange={(event) =>
                setImageFiles(Array.from(event.target.files ?? []))
              }
            />
            <span className="text-xs text-default-500">
              Upload images for LinkedIn/Gmail messages. Paths fill in automatically.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              color="secondary"
              isLoading={imageUploadStatus === "uploading"}
              onPress={handleImageUpload}
              radius="full"
              variant="flat"
            >
              Save images locally
            </Button>
            {imageUploadStatus === "success" ? (
              <span className="text-xs text-success">{imageUploadMessage}</span>
            ) : null}
            {imageUploadStatus === "error" ? (
              <span className="text-xs text-danger">{imageUploadMessage}</span>
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
          <Switch
            isSelected={form.linkedinAllowManualVerification}
            onValueChange={(value) => update("linkedinAllowManualVerification", value)}
          >
            Allow manual verification
          </Switch>
          <Input
            label="Manual verification timeout (seconds)"
            value={form.linkedinManualVerificationTimeout}
            onValueChange={(value) =>
              update("linkedinManualVerificationTimeout", value)
            }
          />
          <Input
            label="Manual verification poll interval (seconds)"
            value={form.linkedinManualVerificationPoll}
            onValueChange={(value) => update("linkedinManualVerificationPoll", value)}
          />
          <Input
            label="Target roles (comma-separated)"
            value={form.linkedinTargetRoles}
            onValueChange={(value) => update("linkedinTargetRoles", value)}
          />
          <Input
            label="Target tags (comma-separated)"
            value={form.linkedinTargetTags}
            onValueChange={(value) => update("linkedinTargetTags", value)}
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
          <div className="flex flex-col gap-2 md:col-span-3">
            <label className="text-sm font-medium" htmlFor="linkedin-message-template">
              Message template
            </label>
            <textarea
              id="linkedin-message-template"
              className="min-h-[120px] w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm"
              placeholder="Hi {name}, I noticed your work in {industry}..."
              value={form.linkedinMessageTemplate}
              onChange={(event) =>
                update("linkedinMessageTemplate", event.target.value)
              }
            />
            <span className="text-xs text-default-500">
              Use placeholders like {"{name}"}, {"{title}"}, {"{company}"}.
            </span>
          </div>
          <Input
            label="Message tags (comma-separated)"
            value={form.linkedinMessageTags}
            onValueChange={(value) => update("linkedinMessageTags", value)}
          />
          <Input
            label="Message image paths (comma-separated)"
            value={form.linkedinMessageImages}
            onValueChange={(value) => update("linkedinMessageImages", value)}
          />
          <Input
            label="Persona pack"
            value={form.linkedinPersonaPack}
            onValueChange={(value) => update("linkedinPersonaPack", value)}
          />
          <div className="flex flex-col gap-2 md:col-span-3">
            <label className="text-sm font-medium" htmlFor="linkedin-message-short">
              Message variants
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                color="secondary"
                isLoading={variantStatus === "loading"}
                onPress={handleGenerateVariants}
                radius="full"
                variant="flat"
              >
                Generate short/medium/long
              </Button>
              {variantStatus === "success" ? (
                <span className="text-xs text-success">{variantMessage}</span>
              ) : null}
              {variantStatus === "error" ? (
                <span className="text-xs text-danger">{variantMessage}</span>
              ) : null}
            </div>
            <textarea
              id="linkedin-message-short"
              className="min-h-[100px] w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm"
              placeholder="Short variant"
              value={form.linkedinMessageShort}
              onChange={(event) =>
                update("linkedinMessageShort", event.target.value)
              }
            />
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm"
              placeholder="Medium variant"
              value={form.linkedinMessageMedium}
              onChange={(event) =>
                update("linkedinMessageMedium", event.target.value)
              }
            />
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm"
              placeholder="Long variant"
              value={form.linkedinMessageLong}
              onChange={(event) =>
                update("linkedinMessageLong", event.target.value)
              }
            />
          </div>
        </CardBody>
      </Card>

      <Card className="border border-default-200/60">
        <CardHeader className="text-lg font-semibold">Smart Tag Wizard</CardHeader>
        <Divider />
        <CardBody className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              color="secondary"
              isLoading={personaStatus === "loading"}
              onPress={() => handlePersonaPack("cto")}
              radius="full"
              variant="flat"
            >
              Apply CTO pack
            </Button>
            <Button
              color="secondary"
              isLoading={personaStatus === "loading"}
              onPress={() => handlePersonaPack("hr")}
              radius="full"
              variant="flat"
            >
              Apply HR pack
            </Button>
            <Button
              color="secondary"
              isLoading={personaStatus === "loading"}
              onPress={() => handlePersonaPack("founder")}
              radius="full"
              variant="flat"
            >
              Apply Founder pack
            </Button>
            {personaStatus === "success" ? (
              <span className="text-xs text-success">{personaMessage}</span>
            ) : null}
            {personaStatus === "error" ? (
              <span className="text-xs text-danger">{personaMessage}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              color="secondary"
              isLoading={wizardStatus === "loading"}
              onPress={handleWizardStart}
              radius="full"
              variant="flat"
            >
              Generate MCQs
            </Button>
            <Button
              color="primary"
              isDisabled={wizardStatus !== "ready"}
              isLoading={wizardStatus === "scoring"}
              onPress={handleWizardScore}
              radius="full"
              variant="shadow"
            >
              Apply tags
            </Button>
            {wizardStatus === "success" ? (
              <span className="text-xs text-success">{wizardMessage}</span>
            ) : null}
            {wizardStatus === "error" ? (
              <span className="text-xs text-danger">{wizardMessage}</span>
            ) : null}
          </div>
          {wizardExplanations.length ? (
            <div className="rounded-xl border border-default-200 bg-default-50 p-4 text-xs text-default-600">
              <div className="text-sm font-medium">Why these tags</div>
              <ul className="mt-2 list-disc pl-5">
                {wizardExplanations.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {wizardQuestions.length ? (
            <div className="grid gap-4">
              {wizardQuestions.map((question) => (
                <div
                  key={question.id}
                  className="rounded-xl border border-default-200 bg-default-50 p-4"
                >
                  <p className="text-sm font-medium">{question.question}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          checked={wizardAnswers[question.id] === option.id}
                          name={question.id}
                          type="radio"
                          value={option.id}
                          onChange={(event) =>
                            setWizardAnswers((prev) => ({
                              ...prev,
                              [question.id]: event.target.value,
                            }))
                          }
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
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
          <Input
            label="Attachment paths (comma-separated)"
            value={form.gmailAttachments}
            onValueChange={(value) => update("gmailAttachments", value)}
          />
          <Input
            label="Recipient tags (comma-separated)"
            value={form.gmailTargetTags}
            onValueChange={(value) => update("gmailTargetTags", value)}
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
