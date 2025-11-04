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
} from "@/store/mockData";

// Configuration - these should be set from environment variables or settings
export const VAPI_CONFIG = {
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || "assistant-id-placeholder",
  phoneNumberId: import.meta.env.VITE_VAPI_PHONE_NUMBER_ID || "phone-number-id-placeholder",
  apiKey: import.meta.env.VITE_VAPI_API_KEY || "api-key-placeholder",
  baseUrl: "https://api.vapi.ai",
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
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API call failed with status ${response.status}`);
      }

      const data: VAPICallResponse = await response.json();

      // Create call record in mock store
      const call = vapiCallStore.create({
        patientId: params.patientId,
        promptId: params.promptId,
        phoneNumber: params.phoneNumber,
        status: "pending",
        createdAt: new Date(),
      });

      // Update with actual call ID from VAPI
      vapiCallStore.update(call.id, {
        status: "in-progress",
        startedAt: new Date(),
      });

      return call;
    } catch (error) {
      // Create failed call record
      const call = vapiCallStore.create({
        patientId: params.patientId,
        promptId: params.promptId,
        phoneNumber: params.phoneNumber,
        status: "failed",
        createdAt: new Date(),
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

