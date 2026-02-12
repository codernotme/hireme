import { Card, CardBody } from "@heroui/card";

import { title, subtitle } from "@/components/primitives";

export default function BlogPage() {
  return (
    <section className="flex flex-col gap-6 py-8">
      <div>
        <h1 className={title({ size: "lg" })}>Updates</h1>
        <p className={subtitle({ class: "mt-2" })}>
          Release notes and platform automation tips.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Local automation checklist",
            copy: "Make sure Ollama, Python, and browser automation are aligned.",
          },
          {
            title: "Safe outreach defaults",
            copy: "Rate limits, review steps, and logging best practices.",
          },
          {
            title: "Multi-platform coverage",
            copy: "How we keep adapters in sync across job boards.",
          },
          {
            title: "Next roadmap",
            copy: "Follow-ups, dashboards, and campaign analytics.",
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
