import { NextResponse } from "next/server";

import { env } from "@/config/env.server";

export const runtime = "nodejs";

type WizardQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
};

type PersonaPack = "cto" | "hr" | "founder";

const tryParseJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const callOllama = async (prompt: string, baseUrl: string, model: string) => {
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
    const body = await response.text().catch(() => "");
    throw new Error(
      `Ollama request failed (${response.status}) ${body}`.trim(),
    );
  }

  const data = (await response.json()) as { response?: string };
  return tryParseJson(data.response ?? "");
};

const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];

const normalizeTextList = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];

const defaultPersonaTags: Record<PersonaPack, {
  linkedinTargetTags: string[];
  gmailTargetTags: string[];
  linkedinMessageTags: string[];
}> = {
  cto: {
    linkedinTargetTags: [
      "CTO",
      "VP Engineering",
      "Engineering Leader",
      "Tech Strategy",
      "Platform",
      "Scale",
    ],
    gmailTargetTags: ["cto", "engineering", "platform", "leadership"],
    linkedinMessageTags: ["architecture", "scalability", "delivery"],
  },
  hr: {
    linkedinTargetTags: [
      "HR Manager",
      "Talent Acquisition",
      "Recruiter",
      "People Ops",
      "Hiring",
    ],
    gmailTargetTags: ["hr", "recruiter", "peopleops", "hiring"],
    linkedinMessageTags: ["availability", "role-fit", "pipeline"],
  },
  founder: {
    linkedinTargetTags: [
      "Founder",
      "Co-founder",
      "CEO",
      "Startup",
      "Product",
    ],
    gmailTargetTags: ["founder", "startup", "early-stage", "product"],
    linkedinMessageTags: ["ownership", "speed", "product-build"],
  },
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const action = String(payload.action ?? "");
  const baseUrl = String(payload.ollamaBaseUrl ?? env.ollamaBaseUrl);
  const model = String(payload.ollamaModel ?? "llama2");
  const mcqCount = Number(payload.mcqCount ?? 5);
  const profile = payload.profile ?? {};

  if (action === "questions") {
    const prompt = `Create ${mcqCount} multiple-choice questions to determine smart outreach tags for LinkedIn and Gmail.\n\nUser profile (JSON):\n${JSON.stringify(
      profile,
    )}\n\nReturn JSON only with this shape:\n{\n  "questions": [\n    {\n      "id": "q1",\n      "question": "...",\n      "options": [\n        {"id": "a", "text": "..."},\n        {"id": "b", "text": "..."},\n        {"id": "c", "text": "..."},\n        {"id": "d", "text": "..."}\n      ]\n    }\n  ]\n}`;

    let result: unknown = null;
    try {
      result = await callOllama(prompt, baseUrl, model);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Ollama request failed",
          hint:
            "Ensure Ollama is running and OLLAMA_BASE_URL points to it.",
        },
        { status: 503 },
      );
    }
    const questions = Array.isArray(result?.questions)
      ? (result.questions as WizardQuestion[])
      : [];

    if (!questions.length) {
      return NextResponse.json(
        { ok: false, error: "Failed to generate questions" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, questions });
  }

  if (action === "score") {
    const questions = payload.questions ?? [];
    const answers = payload.answers ?? {};

    const prompt = `You are assigning smart outreach tags based on a user's answers.\n\nUser profile (JSON):\n${JSON.stringify(
      profile,
    )}\n\nQuestions (JSON):\n${JSON.stringify(
      questions,
    )}\n\nAnswers (JSON, key=question id, value=option id):\n${JSON.stringify(
      answers,
    )}\n\nReturn JSON only with this shape:\n{\n  "linkedin_target_tags": ["..."],\n  "gmail_target_tags": ["..."],\n  "linkedin_message_tags": ["..."],\n  "explanations": ["..."]\n}`;

    let result: unknown = null;
    try {
      result = await callOllama(prompt, baseUrl, model);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Ollama request failed",
          hint:
            "Ensure Ollama is running and OLLAMA_BASE_URL points to it.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      tags: {
        linkedinTargetTags: normalizeTags(result?.linkedin_target_tags),
        gmailTargetTags: normalizeTags(result?.gmail_target_tags),
        linkedinMessageTags: normalizeTags(result?.linkedin_message_tags),
        explanations: normalizeTextList(result?.explanations),
      },
    });
  }

  if (action === "persona") {
    const persona = String(payload.persona ?? "").toLowerCase() as PersonaPack;
    const fallback = defaultPersonaTags[persona];

    if (!fallback) {
      return NextResponse.json(
        { ok: false, error: "Invalid persona" },
        { status: 400 },
      );
    }

    const prompt = `Select outreach tags for persona pack: ${persona}.\n\nUser profile (JSON):\n${JSON.stringify(
      profile,
    )}\n\nReturn JSON only with this shape:\n{\n  "linkedin_target_tags": ["..."],\n  "gmail_target_tags": ["..."],\n  "linkedin_message_tags": ["..."],\n  "explanations": ["..."]\n}`;

    let result: unknown = null;
    try {
      result = await callOllama(prompt, baseUrl, model);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Ollama request failed",
          hint:
            "Ensure Ollama is running and OLLAMA_BASE_URL points to it.",
        },
        { status: 503 },
      );
    }

    const linkedinTargetTags = normalizeTags(result?.linkedin_target_tags);
    const gmailTargetTags = normalizeTags(result?.gmail_target_tags);
    const linkedinMessageTags = normalizeTags(result?.linkedin_message_tags);
    const explanations = normalizeTextList(result?.explanations);

    return NextResponse.json({
      ok: true,
      tags: {
        linkedinTargetTags:
          linkedinTargetTags.length ? linkedinTargetTags : fallback.linkedinTargetTags,
        gmailTargetTags:
          gmailTargetTags.length ? gmailTargetTags : fallback.gmailTargetTags,
        linkedinMessageTags:
          linkedinMessageTags.length
            ? linkedinMessageTags
            : fallback.linkedinMessageTags,
        explanations: explanations.length
          ? explanations
          : [`Applied default ${persona.toUpperCase()} persona pack.`],
      },
    });
  }

  if (action === "variants") {
    const prompt = `Generate three LinkedIn message variants (short, medium, long).\n\nUser profile (JSON):\n${JSON.stringify(
      profile,
    )}\n\nReturn JSON only with this shape:\n{\n  "short": "...",\n  "medium": "...",\n  "long": "..."\n}`;

    let result: unknown = null;
    try {
      result = await callOllama(prompt, baseUrl, model);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Ollama request failed",
          hint:
            "Ensure Ollama is running and OLLAMA_BASE_URL points to it.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      variants: {
        short: String(result?.short ?? ""),
        medium: String(result?.medium ?? ""),
        long: String(result?.long ?? ""),
      },
    });
  }

  return NextResponse.json(
    { ok: false, error: "Invalid action" },
    { status: 400 },
  );
}
