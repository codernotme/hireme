import { NextResponse } from "next/server";

import { env } from "@/config/env.server";
import { logBackend } from "@/lib/console-log";

export const runtime = "nodejs";

type WizardQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
};

type PersonaPack = "cto" | "hr" | "founder";

const getQuestions = (value: unknown): WizardQuestion[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const maybeQuestions = (value as { questions?: unknown }).questions;
  return Array.isArray(maybeQuestions)
    ? (maybeQuestions as WizardQuestion[])
    : [];
};

const tryParseJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const callOllama = async (prompt: string, baseUrl: string, model: string) => {
  logBackend(
    "info",
    `Ollama generate start (model=${model}, promptChars=${prompt.length}).`,
  );
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
    logBackend(
      "error",
      `Ollama generate failed (${response.status}) ${body}`.trim(),
    );
    throw new Error(
      `Ollama request failed (${response.status}) ${body}`.trim(),
    );
  }

  const data = (await response.json()) as { response?: string };
  const parsed = tryParseJson(data.response ?? "");
  logBackend("info", "Ollama generate completed.");
  return parsed;
};

const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];

const normalizeTextList = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];

const getTagField = (value: unknown, key: string) => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
};

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

  logBackend(
    "info",
    `Tag wizard request (action=${action || "-"}, model=${model}).`,
  );

  if (action === "questions") {
    logBackend("info", `Generating ${mcqCount} tag wizard questions.`);
    const prompt = `Create ${mcqCount} multiple-choice questions to determine smart outreach tags for LinkedIn and Gmail.\n\nUser profile (JSON):\n${JSON.stringify(
      profile,
    )}\n\nReturn JSON only with this shape:\n{\n  "questions": [\n    {\n      "id": "q1",\n      "question": "...",\n      "options": [\n        {"id": "a", "text": "..."},\n        {"id": "b", "text": "..."},\n        {"id": "c", "text": "..."},\n        {"id": "d", "text": "..."}\n      ]\n    }\n  ]\n}`;

    let result: unknown = null;
    try {
      result = await callOllama(prompt, baseUrl, model);
    } catch (error) {
      logBackend(
        "error",
        `Tag wizard question generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
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
    const questions = getQuestions(result);

    if (!questions.length) {
      logBackend("error", "Tag wizard returned empty question list.");
      return NextResponse.json(
        { ok: false, error: "Failed to generate questions" },
        { status: 500 },
      );
    }

    logBackend("info", `Tag wizard generated ${questions.length} questions.`);
    return NextResponse.json({ ok: true, questions });
  }

  if (action === "score") {
    logBackend("info", "Scoring tag wizard answers.");
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
      logBackend(
        "error",
        `Tag wizard scoring failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
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

    logBackend("info", "Tag wizard scoring completed.");
    return NextResponse.json({
      ok: true,
      tags: {
        linkedinTargetTags: normalizeTags(
          getTagField(result, "linkedin_target_tags"),
        ),
        gmailTargetTags: normalizeTags(getTagField(result, "gmail_target_tags")),
        linkedinMessageTags: normalizeTags(
          getTagField(result, "linkedin_message_tags"),
        ),
        explanations: normalizeTextList(getTagField(result, "explanations")),
      },
    });
  }

  if (action === "persona") {
    const persona = String(payload.persona ?? "").toLowerCase() as PersonaPack;
    const fallback = defaultPersonaTags[persona];

    logBackend("info", `Applying persona pack (${persona || "-"}).`);

    if (!fallback) {
      logBackend("warn", `Invalid persona requested: ${persona || "-"}.`);
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
      logBackend(
        "error",
        `Persona pack generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
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

    const linkedinTargetTags = normalizeTags(
      getTagField(result, "linkedin_target_tags"),
    );
    const gmailTargetTags = normalizeTags(
      getTagField(result, "gmail_target_tags"),
    );
    const linkedinMessageTags = normalizeTags(
      getTagField(result, "linkedin_message_tags"),
    );
    const explanations = normalizeTextList(getTagField(result, "explanations"));

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
    logBackend("info", "Generating LinkedIn message variants.");
    const prompt = `Generate three LinkedIn message variants (short, medium, long).\n\nUser profile (JSON):\n${JSON.stringify(
      profile,
    )}\n\nReturn JSON only with this shape:\n{\n  "short": "...",\n  "medium": "...",\n  "long": "..."\n}`;

    let result: unknown = null;
    try {
      result = await callOllama(prompt, baseUrl, model);
    } catch (error) {
      logBackend(
        "error",
        `Variant generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
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

    logBackend("info", "LinkedIn message variants generated.");
    return NextResponse.json({
      ok: true,
      variants: {
        short: String((result as Record<string, unknown>)?.short ?? ""),
        medium: String((result as Record<string, unknown>)?.medium ?? ""),
        long: String((result as Record<string, unknown>)?.long ?? ""),
      },
    });
  }

  logBackend("warn", `Invalid tag wizard action: ${action || "-"}.`);
  return NextResponse.json(
    { ok: false, error: "Invalid action" },
    { status: 400 },
  );
}
