import { Snippet } from "@heroui/snippet";
import { title, subtitle } from "@/components/primitives";

export default function DocsPage() {
  return (
    <section className="flex flex-col gap-6 py-8">
      <div>
        <h1 className={title({ size: "lg" })}>Docs</h1>
        <p className={subtitle({ class: "mt-2" })}>
          Local-first setup for the HireMe automation stack.
        </p>
      </div>

      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">Quick start</h2>
        <Snippet className="max-w-full" variant="bordered">
          npm install
        </Snippet>
        <Snippet className="max-w-full" variant="bordered">
          npm run dev
        </Snippet>
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Ollama (local AI)</h2>
        <p className="text-sm text-default-600">
          Install Ollama, then start the server and pull a model. The app uses this for resume parsing, tag wizard, and message variants.
        </p>
        <Snippet className="max-w-full" variant="bordered">
          ollama serve
        </Snippet>
        <Snippet className="max-w-full" variant="bordered">
          ollama pull llama3.2
        </Snippet>
        <p className="text-xs text-default-500">
          Or use llama3.1, llama3, mistral, etc. Choose the model in Onboarding.
        </p>
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Bot prerequisites</h2>
        <p className="text-sm text-default-600">
          Python 3 with dependencies in the <code className="rounded bg-default-200 px-1">bot</code> folder. Config is generated from Onboarding.
        </p>
        <Snippet className="max-w-full" variant="bordered">
          cd bot && pip install -r requirements.txt
        </Snippet>
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Environment variables</h2>
        <Snippet className="max-w-full" variant="bordered">
          NEXT_PUBLIC_APP_URL=http://localhost:3000
        </Snippet>
        <Snippet className="max-w-full" variant="bordered">
          OLLAMA_BASE_URL=http://localhost:11434
        </Snippet>
        <Snippet className="max-w-full" variant="bordered">
          BOT_WORKDIR=bot
        </Snippet>
        <Snippet className="max-w-full" variant="bordered">
          BOT_PYTHON_PATH=python3
        </Snippet>
        <Snippet className="max-w-full" variant="bordered">
          BOT_CONFIG_PATH=config/config.yaml
        </Snippet>
      </div>
    </section>
  );
}
