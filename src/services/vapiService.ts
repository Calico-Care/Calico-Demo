// VAPI Service for making API calls to VAPI

import {
  vapiPromptStore,
  vapiScheduleStore,
  vapiCallStore,
  replacePromptVariables,
  patientStore,
  type VAPIPrompt,
  type VAPICallSchedule,
  type VAPICall,
  type RecurrenceType,
  type Patient,
  type VAPIEndOfCallReport,
  type VAPICallAnalysis,
  type VAPICallTranscriptEntry,
} from "@/store/mockData";

// Configuration - these should be set from environment variables or settings
export const VAPI_CONFIG = {
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || "assistant-id-placeholder",
  phoneNumberId: import.meta.env.VITE_VAPI_PHONE_NUMBER_ID || "phone-number-id-placeholder",
  apiKey: import.meta.env.VITE_VAPI_API_KEY || "api-key-placeholder",
  baseUrl: "https://api.vapi.ai",
};

const mapApiStatusToLocal = (status?: string): VAPICall["status"] => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "finished":
      return "completed";
    case "failed":
    case "error":
      return "failed";
    case "in-progress":
    case "running":
    case "live":
      return "in-progress";
    default:
      return "pending";
  }
};

const formatTranscript = (
  entries?: VAPICallTranscriptEntry[]
): string | undefined => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return undefined;
  }

  return entries
    .map((entry) => {
      const timestamp =
        typeof entry.time === "number" ? `[${entry.time.toFixed(1)}s] ` : "";
      const speaker = entry.role ? entry.role.toUpperCase() : "SPEAKER";
      return `${timestamp}${speaker}: ${entry.message}`;
    })
    .join("\n");
};

const mergeAnalysis = (
  existing: VAPICallAnalysis | undefined,
  incoming?: VAPICallAnalysis
): VAPICallAnalysis | undefined => {
  if (!existing && !incoming) {
    return undefined;
  }

  return {
    summary: incoming?.summary ?? existing?.summary,
    structuredData: incoming?.structuredData ?? existing?.structuredData,
    successEvaluation:
      incoming?.successEvaluation ?? existing?.successEvaluation,
  };
};

const mapApiAnalysis = (
  analysis?: VapiCallAnalysisResponse
): VAPICallAnalysis | undefined => {
  if (!analysis) {
    return undefined;
  }

  return {
    summary: analysis.summary,
    structuredData: analysis.structuredData,
    successEvaluation: analysis.successEvaluation,
  };
};

const buildAnalysisPlan = (
  patient: Patient,
  promptName: string
): Record<string, unknown> => ({
  summaryPrompt: `You are a clinical documentation specialist summarizing an outreach call with ${patient.firstName} ${patient.lastName}. Highlight symptoms, medication adherence, and follow-up needs in 2-3 sentences.`,
  structuredDataPrompt: `Produce a JSON end-of-call report for ${patient.firstName} ${patient.lastName}. Stick to the schema, set patientId to ${patient.id}, patientName to "${patient.firstName} ${patient.lastName}", and callPurpose to "${promptName}".`,
  structuredDataSchema: {
    type: "object",
    properties: {
      patientId: { type: "string" },
      patientName: { type: "string" },
      callPurpose: { type: "string" },
      conversationOutcome: {
        type: "string",
        enum: ["completed", "voicemail", "no-answer", "rescheduled", "unknown"],
      },
      summary: { type: "string" },
      riskLevel: { type: "string", enum: ["low", "moderate", "high"] },
      symptomsDiscussed: {
        type: "array",
        items: { type: "string" },
        default: [],
      },
      medicationAdherence: {
        type: "string",
        enum: ["on-track", "missed-dose", "not-discussed", "stopped"],
      },
      escalationNeeded: { type: "boolean" },
      followUpType: {
        type: "string",
        enum: ["none", "call", "visit", "escalate"],
      },
      recommendedActions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            owner: {
              type: "string",
              enum: ["care-team", "patient", "family", "automation"],
            },
            action: { type: "string" },
            urgency: { type: "string", enum: ["low", "medium", "high"] },
            dueBy: { type: ["string", "null"] },
          },
          required: ["owner", "action", "urgency"],
        },
        default: [],
      },
      notes: { type: "string" },
    },
    required: [
      "patientId",
      "patientName",
      "conversationOutcome",
      "summary",
      "riskLevel",
      "followUpType",
      "escalationNeeded",
    ],
    additionalProperties: true,
  },
  successEvaluationPrompt:
    "Based on the transcript and system prompt, decide if the call achieved its objectives (connect with patient, assess symptoms, review meds, plan next steps).",
  successEvaluationRubric: "PassFail",
});

const buildArtifactPlan = (patient: Patient): Record<string, unknown> => ({
  recordingEnabled: true,
  loggingEnabled: true,
  transcriptPlan: {
    enabled: true,
    assistantName: "Cali",
    userName: patient.firstName || "Patient",
  },
});

const extractTextFromAny = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractTextFromAny(item))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === "string") {
      return obj.text;
    }
    if (typeof obj.message === "string") {
      return obj.message;
    }
    if (typeof obj.content === "string") {
      return obj.content;
    }
    if (obj.content) {
      return extractTextFromAny(obj.content);
    }
    if (obj.message) {
      return extractTextFromAny(obj.message);
    }
  }

  return "";
};

const toTranscriptEntry = (entry: unknown): VAPICallTranscriptEntry | null => {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    return {
      role: "speaker",
      message: entry,
    };
  }

  if (typeof entry !== "object") {
    return null;
  }

  const obj = entry as Record<string, unknown>;
  const role =
    typeof obj.role === "string"
      ? obj.role
      : typeof obj.speaker === "string"
        ? obj.speaker
        : "speaker";

  const message =
    typeof obj.message === "string"
      ? obj.message
      : typeof obj.content === "string"
        ? obj.content
        : typeof obj.text === "string"
          ? obj.text
          : extractTextFromAny(obj.message) ||
            extractTextFromAny(obj.content) ||
            extractTextFromAny(obj.text);

  if (!message) {
    return null;
  }

  const time = typeof obj.time === "number" ? obj.time : undefined;

  return {
    role,
    message,
    time,
  };
};

const normalizeTranscriptEntries = (
  raw: unknown
): VAPICallTranscriptEntry[] | undefined => {
  if (!raw) {
    return undefined;
  }

  const candidates: unknown[] = [raw];

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    candidates.push(obj.entries, obj.messages, obj.transcript, obj.items);
  }

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    const entries = candidate
      .map((entry) => toTranscriptEntry(entry))
      .filter((entry): entry is VAPICallTranscriptEntry => Boolean(entry));

    if (entries.length) {
      return entries;
    }
  }

  return undefined;
};

const extractTranscriptFromArtifact = (
  artifact?: VapiCallDetailsResponse["artifact"]
): { entries?: VAPICallTranscriptEntry[]; formatted?: string } => {
  if (!artifact) {
    return {};
  }

  const entries =
    normalizeTranscriptEntries(artifact.transcript) ??
    normalizeTranscriptEntries(artifact.messages) ??
    normalizeTranscriptEntries(artifact.messagesOpenAIFormatted);

  return {
    entries,
    formatted: formatTranscript(entries),
  };
};

interface CreateCallParams {
  patientId: string;
  promptId: string;
  phoneNumber: string;
}

interface ScheduleCallParams {
  patientId: string;
  promptId: string;
  type: "one-time" | "recurring" | "now";
  scheduledTime?: Date;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

interface VAPICallResponse {
  id: string;
  status: string;
  createdAt?: string;
}

interface VAPIAssistantResponse {
  id: string;
  model?: {
    provider?: string;
    model?: string;
    messages?: Array<{ role: string; content: string }>;
  };
}

interface VapiCallAnalysisResponse {
  summary?: string;
  structuredData?: VAPIEndOfCallReport | Record<string, unknown>;
  successEvaluation?: Record<string, unknown>;
}

interface VapiCallDetailsResponse extends VAPICallResponse {
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  artifact?: {
    recording?: string;
    logUrl?: string;
    transcript?: unknown;
    transcriptUrl?: string;
    messages?: unknown;
    messagesOpenAIFormatted?: unknown;
  };
  analysis?: VapiCallAnalysisResponse;
}

// Store original prompt outside the service object
let originalPrompt: string | null = null;

export const vapiService = {
  /**
   * Get the current assistant to save the original prompt
   */
  async getAssistant(): Promise<VAPIAssistantResponse | null> {
    try {
      const response = await fetch(`${VAPI_CONFIG.baseUrl}/assistant/${VAPI_CONFIG.assistantId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${VAPI_CONFIG.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get assistant:", error);
      return null;
    }
  },

  /**
   * Update assistant's system message (prompt only)
   */
  async updateAssistantPrompt(prompt: string): Promise<void> {
    const response = await fetch(`${VAPI_CONFIG.baseUrl}/assistant/${VAPI_CONFIG.assistantId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${VAPI_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: {
          messages: [
            {
              role: "system",
              content: prompt,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update assistant prompt: ${response.status}`);
    }
  },

  /**
   * Create an immediate call using VAPI API
   * Overrides the assistant's prompt for this specific call without modifying the assistant
   */
  async createCall(params: CreateCallParams): Promise<VAPICall> {
    const patient = patientStore.getById(params.patientId);
    const prompt = vapiPromptStore.getById(params.promptId);

    if (!patient || !prompt) {
      throw new Error("Patient or prompt not found");
    }

    // Replace variables in prompt
    const resolvedPrompt = replacePromptVariables(prompt.prompt, patient);

    try {
      // Get the assistant to preserve its model configuration
      const assistant = await this.getAssistant();
      if (!assistant || !assistant.model) {
        throw new Error("Failed to fetch assistant configuration");
      }

      // Extract provider and model from assistant to keep everything the same
      const modelProvider = assistant.model.provider || "openai";
      const modelName = assistant.model.model || "gpt-4o-mini";
      const analysisPlan = buildAnalysisPlan(patient, prompt.name);
      const artifactPlan = buildArtifactPlan(patient);

      // Make the call with assistantOverrides to override the prompt for this call only
      const response = await fetch(`${VAPI_CONFIG.baseUrl}/call`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VAPI_CONFIG.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: VAPI_CONFIG.assistantId,
          phoneNumberId: VAPI_CONFIG.phoneNumberId,
          customer: {
            number: params.phoneNumber,
          },
          // Override the assistant's model messages for this call only
          // Keep everything else exactly the same as the assistant
          assistantOverrides: {
            model: {
              provider: modelProvider,
              model: modelName,
              messages: [
                {
                  role: "system",
                  content: resolvedPrompt,
                },
              ],
            },
            analysisPlan,
            artifactPlan,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API call failed with status ${response.status}`);
      }

      const data: VAPICallResponse = await response.json();
      const status = mapApiStatusToLocal(data.status);

      // Create call record in mock store
      const call = vapiCallStore.create({
        patientId: params.patientId,
        promptId: params.promptId,
        phoneNumber: params.phoneNumber,
        status,
        providerCallId: data.id,
      });

      if (status === "in-progress") {
        vapiCallStore.update(call.id, {
          startedAt: new Date(),
        });
      }

      return call;
    } catch (error) {
      // Create failed call record
      const call = vapiCallStore.create({
        patientId: params.patientId,
        promptId: params.promptId,
        phoneNumber: params.phoneNumber,
        status: "failed",
      });

      throw error;
    }
  },

  /**
   * Schedule a call (one-time or recurring)
   * NOTE: For demo purposes, this only creates a local schedule record.
   * Actual scheduling is disabled - only "Call Now" initiates real calls.
   */
  async scheduleCall(params: ScheduleCallParams): Promise<VAPICallSchedule> {
    const patient = patientStore.getById(params.patientId);
    const prompt = vapiPromptStore.getById(params.promptId);
    
    if (!patient || !prompt) {
      throw new Error("Patient or prompt not found");
    }

    // For demo purposes, we only create local schedule records
    // No actual API calls are made for scheduling
    const schedule = vapiScheduleStore.create({
      patientId: params.patientId,
      promptId: params.promptId,
      type: params.type,
      scheduledTime: params.scheduledTime,
      recurrenceType: params.recurrenceType,
      recurrenceEndDate: params.recurrenceEndDate,
      dayOfWeek: params.dayOfWeek,
      dayOfMonth: params.dayOfMonth,
      isActive: true,
    });

    return schedule;
  },

  /**
   * Cancel a scheduled call
   */
  async cancelSchedule(scheduleId: string): Promise<boolean> {
    const schedule = vapiScheduleStore.getById(scheduleId);
    if (!schedule) {
      return false;
    }

    vapiScheduleStore.update(scheduleId, { isActive: false });
    return true;
  },

  /**
   * Get call status
   */
  async getCallStatus(callId: string): Promise<VAPICall | undefined> {
    return vapiCallStore.getById(callId);
  },

  /**
   * Fetches the latest transcript, artifacts, and analysis for a call
   */
  async refreshCallDetails(callId: string): Promise<VAPICall | undefined> {
    const localCall = vapiCallStore.getById(callId);
    if (!localCall) {
      throw new Error("Call not found");
    }

    if (!localCall.providerCallId) {
      throw new Error("This call does not yet have a Vapi call ID to sync.");
    }

    const response = await fetch(
      `${VAPI_CONFIG.baseUrl}/call/${localCall.providerCallId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VAPI_CONFIG.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch call details with status ${response.status}`
      );
    }

    const data: VapiCallDetailsResponse = await response.json();
    const transcriptInfo = extractTranscriptFromArtifact(data.artifact);
    const incomingAnalysis = mapApiAnalysis(data.analysis);

    return vapiCallStore.update(callId, {
      status: mapApiStatusToLocal(data.status),
      startedAt: data.startedAt ? new Date(data.startedAt) : localCall.startedAt,
      completedAt: data.completedAt
        ? new Date(data.completedAt)
        : localCall.completedAt,
      duration:
        typeof data.duration === "number" ? data.duration : localCall.duration,
      transcriptEntries:
        transcriptInfo.entries ?? localCall.transcriptEntries,
      transcript: transcriptInfo.formatted ?? localCall.transcript,
      analysis: mergeAnalysis(localCall.analysis, incomingAnalysis),
      artifacts: {
        recording: data.artifact?.recording ?? localCall.artifacts?.recording,
        logUrl: data.artifact?.logUrl ?? localCall.artifacts?.logUrl,
        transcriptUrl:
          data.artifact?.transcriptUrl ?? localCall.artifacts?.transcriptUrl,
      },
    });
  },

  /**
   * Create a prompt for a patient
   */
  createPrompt(patientId: string, name: string, prompt: string): VAPIPrompt {
    return vapiPromptStore.create({
      patientId,
      name,
      prompt,
      isActive: true,
    });
  },

  /**
   * Delete a prompt
   */
  deletePrompt(promptId: string): boolean {
    return vapiPromptStore.delete(promptId);
  },
};

