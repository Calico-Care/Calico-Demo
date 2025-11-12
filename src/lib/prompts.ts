import type { Patient } from "@/lib/types";

const promptModules = import.meta.glob("./prompts/*.txt", {
  as: "raw",
  eager: true,
}) as Record<string, string>;

const promptCache = Object.entries(promptModules).reduce<Record<string, string>>(
  (acc, [path, content]) => {
    const match = path.match(/\/([^/]+)\.txt$/);
    if (match?.[1]) {
      acc[match[1]] = content.trim();
    }
    return acc;
  },
  {}
);

export function loadPrompt(filename: string): string {
  const prompt = promptCache[filename];
  if (!prompt) {
    console.warn(`Prompt ${filename} not found in prompt cache.`);
  }
  return prompt ?? "";
}

export function replacePromptVariables(prompt: string, patient: Patient): string {
  const dateOfBirth = patient.dateOfBirth instanceof Date
    ? patient.dateOfBirth
    : new Date(patient.dateOfBirth);
  const age = Math.floor(
    (Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  return prompt
    .replace(/\{\{patientName\}\}/g, `${patient.firstName} ${patient.lastName}`)
    .replace(/\{\{patientAge\}\}/g, age.toString())
    .replace(/\{\{patientCondition\}\}/g, patient.primaryCondition);
}
