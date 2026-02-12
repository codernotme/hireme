import { Card, CardBody } from "@heroui/card";

import { title, subtitle } from "@/components/primitives";

export default function PricingPage() {
  return (
    <section className="flex flex-col gap-6 py-8">
      <div>
        <h1 className={title({ size: "lg" })}>Pricing</h1>
        <p className={subtitle({ class: "mt-2" })}>
          HireMe runs locally, so you only pay for your own infrastructure.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Local",
            copy: "Use your own Ollama models and keep everything on-device.",
          },
          {
            title: "Transparent",
            copy: "No hidden API charges. You control the runtime costs.",
          },
          {
            title: "Scalable",
            copy: "Swap models or scale workers as your workflow grows.",
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
