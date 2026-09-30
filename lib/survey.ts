import { sections, type Answers } from "../app/questions";

export function validateAnswers(value: unknown): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("validation");
  const input = value as Record<string, unknown>;
  const clean: Answers = {};

  for (const question of sections.flatMap((section) => section.questions)) {
    const raw = input[question.id];
    if (raw === undefined || raw === "") {
      if (question.required) throw new Error("validation");
      continue;
    }

    if (question.kind === "multi") {
      if (!Array.isArray(raw) || raw.length > (question.options?.length ?? 0)) throw new Error("validation");
      const values = raw.filter((item): item is string => typeof item === "string");
      if (values.length !== raw.length || values.some((item) => !question.options?.includes(item))) throw new Error("validation");
      clean[question.id] = Array.from(new Set(values));
      continue;
    }

    if (typeof raw !== "string" || raw.length > 3000 || (question.required && !raw.trim())) throw new Error("validation");
    if (question.options && !question.options.includes(raw)) throw new Error("validation");
    if (question.kind === "number" && (!Number.isFinite(Number(raw)) || Number(raw) < 0 || Number(raw) > 10000)) throw new Error("validation");
    clean[question.id] = raw.trim();
  }

  return clean;
}
