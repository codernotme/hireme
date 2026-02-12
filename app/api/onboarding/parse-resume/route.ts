import { NextResponse } from "next/server";
import pdf from "pdf-parse";

import { env } from "@/config/env.server";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024;

const sanitize = (value: string) => value.replace(/\s+/g, " ").trim();

const extractBasics = (text: string) => {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/\+?\d[\d\s().-]{8,}\d/);
  const githubMatch = text.match(/https?:\/\/github\.com\/[^\s)]+/i);
  const linkedinMatch = text.match(
    /https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i,
  );
  const portfolioMatch = text.match(/https?:\/\/(?!www\.)[^\s)]+/i);

  return {
    userEmail: emailMatch?.[0] ?? "",
    userPhone: phoneMatch?.[0] ?? "",
    userGithub: githubMatch?.[0] ?? "",
    userLinkedin: linkedinMatch?.[0] ?? "",
    userPortfolio: portfolioMatch?.[0] ?? "",
  };
};

const tryParseJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const callOllama = async (text: string, baseUrl: string, model: string) => {
  const prompt = `Extract resume details as JSON with keys: name, email, phone, title, linkedin, portfolio, github, skills, experience, education. Use empty string when unknown. Resume text:\n\n${text}`;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama request failed");
  }

  const data = (await response.json()) as { response?: string };

  return tryParseJson(data.response ?? "");
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const baseUrl = String(formData.get("ollamaBaseUrl") || env.ollamaBaseUrl);
  const model = String(formData.get("ollamaModel") || "llama2");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No file uploaded" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large (max 6MB)." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    const parsed = await pdf(buffer);
    text = parsed.text ?? "";
  } else {
    text = buffer.toString("utf-8");
  }

  text = sanitize(text);

  if (!text) {
    return NextResponse.json(
      { ok: false, error: "Unable to read resume text" },
      { status: 400 },
    );
  }

  const basics = extractBasics(text);

  let aiData = null;

  try {
    aiData = await callOllama(text.slice(0, 4000), baseUrl, model);
  } catch {
    aiData = null;
  }

  const normalized = aiData ?? {};

  return NextResponse.json({
    ok: true,
    data: {
      userName: normalized.name ?? "",
      userEmail: normalized.email ?? basics.userEmail ?? "",
      userPhone: normalized.phone ?? basics.userPhone ?? "",
      userTitle: normalized.title ?? "",
      userLinkedin: normalized.linkedin ?? basics.userLinkedin ?? "",
      userPortfolio: normalized.portfolio ?? basics.userPortfolio ?? "",
      userGithub: normalized.github ?? basics.userGithub ?? "",
      userSkills: normalized.skills ?? "",
      userExperience: normalized.experience ?? "",
      userEducation: normalized.education ?? "",
    },
  });
}
