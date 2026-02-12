import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";

import { BotRunner } from "@/components/bot-runner";
import { BotStatus } from "@/components/bot-status";
import { title, subtitle } from "@/components/primitives";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <section className="flex flex-col gap-16 py-10">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Chip color="success" variant="flat">
              Local-first AI
            </Chip>
            <Chip color="primary" variant="flat">
              Human-approved outreach
            </Chip>
            <Chip color="warning" variant="flat">
              Multi-platform
            </Chip>
          </div>
          <div className="reveal">
            <span className={title({ size: "lg" })}>Automate the</span>
            <span className={title({ color: "ocean", size: "lg" })}> job hunt</span>
            <span className={title({ size: "lg" })}> without losing your</span>
            <span className={title({ color: "ember", size: "lg" })}> voice</span>
            <p className="mt-3 text-sm text-default-500">
              Built by {siteConfig.developer.name} for local-first automation.
            </p>
            <div className={subtitle({ class: "mt-4" })}>
              HireMe runs an Ollama-powered outreach pipeline on your machine,
              generates drafts, and keeps you in control before anything goes
              out.
            </div>
          </div>
          <div className="flex flex-wrap gap-3 reveal-delayed">
            <Button
              as={Link}
              color="primary"
              href="/#run"
              radius="full"
              variant="shadow"
            >
              Run locally
            </Button>
            <Button
              as={Link}
              href={siteConfig.links.docs}
              radius="full"
              variant="bordered"
            >
              Read docs
            </Button>
            <Button
              as={Link}
              href={siteConfig.links.github}
              radius="full"
              variant="flat"
            >
              View source
            </Button>
          </div>
        </div>
        <div className="surface-grid rounded-3xl border border-default-200/60 bg-background/70 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Workflow at a glance</h2>
            <div className="grid gap-3">
              {[
                "Sync targets and job boards",
                "Generate drafts with Ollama",
                "Review, edit, approve",
                "Send + track responses",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-default-200/70 bg-default-50 px-4 py-3 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <Snippet className="max-w-full" variant="bordered">
              Local only. Your data stays on your machine.
            </Snippet>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3" id="how-it-works">
        {[
          {
            title: "Outreach Engine",
            copy: "Queue LinkedIn DMs, Gmail cold emails, and X posts with safe rate limits.",
          },
          {
            title: "Job Applications",
            copy: "Automate submissions to Unstop, Naukri, Internshala, and more.",
          },
          {
            title: "Review Center",
            copy: "Approve drafts, track status, and keep a clean audit trail.",
          },
        ].map((feature) => (
          <Card key={feature.title} className="border border-default-200/60">
            <CardBody className="gap-3">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-default-600">{feature.copy}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" id="status">
        <BotStatus />
        <Card className="border border-default-200/60">
          <CardBody className="gap-3">
            <h3 className="text-lg font-semibold">Local requirements</h3>
            <p className="text-sm text-default-600">
              HireMe expects Ollama and Python to be available on your machine.
              The UI below runs the same commands you would run from the
              terminal.
            </p>
            <Snippet className="max-w-full" variant="bordered">
              ollama serve
            </Snippet>
            <Snippet className="max-w-full" variant="bordered">
              python3 bot/main.py --mode full
            </Snippet>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" id="run">
        <BotRunner />
        <Card className="border border-default-200/60">
          <CardBody className="gap-4">
            <h3 className="text-lg font-semibold">Environment setup</h3>
            <p className="text-sm text-default-600">
              Configure everything once and reuse it across the UI and API.
            </p>
            <Snippet className="max-w-full" variant="bordered">
              NEXT_PUBLIC_APP_URL=http://localhost:3000
            </Snippet>
            <Snippet className="max-w-full" variant="bordered">
              OLLAMA_BASE_URL=http://localhost:11434
            </Snippet>
            <Snippet className="max-w-full" variant="bordered">
              BOT_WORKDIR=bot
            </Snippet>
            <Link className="text-sm text-primary" href="/docs">
              Full setup instructions
            </Link>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
