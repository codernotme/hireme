import { Card, CardBody } from "@heroui/card";

import { title, subtitle } from "@/components/primitives";

export default function AboutPage() {
  return (
    <section className="flex flex-col gap-6 py-8">
      <div>
        <h1 className={title({ size: "lg" })}>About HireMe</h1>
        <p className={subtitle({ class: "mt-2" })}>
          A local-first automation companion for modern job outreach.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Human-first",
            copy: "Every message starts as a draft and stays under your control.",
          },
          {
            title: "Local AI",
            copy: "Ollama keeps personalization on-device with no external calls.",
          },
          {
            title: "Multi-channel",
            copy: "Reach recruiters across LinkedIn, Gmail, X, and job boards.",
          },
          {
            title: "Audit-ready",
            copy: "Logs, rate limits, and approvals are built in by default.",
          },
        ].map((item) => (
          <Card key={item.title} className="border border-default-200/60">
            <CardBody className="gap-2">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-default-600">{item.copy}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
