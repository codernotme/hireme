export const env = {
  botWorkdir: process.env.BOT_WORKDIR ?? "bot",
  botPython: process.env.BOT_PYTHON_PATH ?? "python3",
  botConfigPath: process.env.BOT_CONFIG_PATH ?? "config/config.yaml",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
};
