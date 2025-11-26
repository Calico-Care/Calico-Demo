import { supabase } from "@/lib/supabaseClient";
import type {
  RecurrenceType,
  VAPICall,
  VAPICallAnalysis,
  VAPICallArtifacts,
  VAPICallSchedule,
  VAPICallStatus,
  VAPICallTranscriptEntry,
  VAPIPrompt,
} from "@/lib/types";

interface PromptRow {
  id: string;
  patient_id: string;
  name: string;
  prompt: string;
  created_at: string;
  is_active: boolean;
}

interface ScheduleRow {
  id: string;
  patient_id: string;
  prompt_id: string;
  type: "one-time" | "recurring" | "now";
  scheduled_time: string | null;
  recurrence_type: RecurrenceType | null;
  recurrence_end_date: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
  created_at: string;
  is_active: boolean;
}

interface CallRow {
  id: string;
  patient_id: string;
  prompt_id: string;
  schedule_id: string | null;
  phone_number: string;
  provider_call_id: string | null;
  status: VAPICallStatus;
  started_at: string | null;
  completed_at: string | null;
  duration: number | null;
  transcript: string | null;
  transcript_entries: VAPICallTranscriptEntry[] | null;
  artifacts: VAPICallArtifacts | null;
  analysis: VAPICallAnalysis | null;
  created_at: string;
}

const mapPrompt = (row: PromptRow): VAPIPrompt => ({
  id: row.id,
  patientId: row.patient_id,
  name: row.name,
  prompt: row.prompt,
  createdAt: new Date(row.created_at),
  isActive: row.is_active,
});

const mapSchedule = (row: ScheduleRow): VAPICallSchedule => ({
  id: row.id,
  patientId: row.patient_id,
  promptId: row.prompt_id,
  type: row.type,
  scheduledTime: row.scheduled_time ? new Date(row.scheduled_time) : undefined,
  recurrenceType: row.recurrence_type ?? undefined,
  recurrenceEndDate: row.recurrence_end_date
    ? new Date(row.recurrence_end_date)
    : undefined,
  dayOfWeek: row.day_of_week ?? undefined,
  dayOfMonth: row.day_of_month ?? undefined,
  createdAt: new Date(row.created_at),
  isActive: row.is_active,
});

const mapCall = (row: CallRow): VAPICall => ({
  id: row.id,
  patientId: row.patient_id,
  promptId: row.prompt_id,
  scheduleId: row.schedule_id ?? undefined,
  phoneNumber: row.phone_number,
  providerCallId: row.provider_call_id ?? undefined,
  status: row.status,
  startedAt: row.started_at ? new Date(row.started_at) : undefined,
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  duration: row.duration ?? undefined,
  transcript: row.transcript ?? undefined,
  transcriptEntries: row.transcript_entries ?? undefined,
  artifacts: row.artifacts ?? undefined,
  analysis: row.analysis ?? undefined,
  createdAt: new Date(row.created_at),
});

export type CreatePromptPayload = {
  patientId: string;
  name: string;
  prompt: string;
};

export type CreateSchedulePayload = {
  patientId: string;
  promptId: string;
  type: "one-time" | "recurring" | "now";
  scheduledTime?: Date;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  dayOfWeek?: number;
  dayOfMonth?: number;
};

export type CreateCallRecordPayload = {
  patientId: string;
  promptId: string;
  scheduleId?: string;
  phoneNumber: string;
  providerCallId?: string;
  status: VAPICallStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  transcript?: string;
  transcriptEntries?: VAPICallTranscriptEntry[];
  artifacts?: VAPICallArtifacts;
  analysis?: VAPICallAnalysis;
};

export type UpdateCallRecordPayload = Partial<CreateCallRecordPayload>;

const buildCallPayload = (
  payload: CreateCallRecordPayload | UpdateCallRecordPayload
) => {
  const body: Record<string, unknown> = {};
  if ("patientId" in payload && payload.patientId !== undefined) {
    body.patient_id = payload.patientId;
  }
  if ("promptId" in payload && payload.promptId !== undefined) {
    body.prompt_id = payload.promptId;
  }
  if ("scheduleId" in payload) {
    body.schedule_id = payload.scheduleId ?? null;
  }
  if ("phoneNumber" in payload && payload.phoneNumber !== undefined) {
    body.phone_number = payload.phoneNumber;
  }
  if ("providerCallId" in payload) {
    body.provider_call_id = payload.providerCallId ?? null;
  }
  if ("status" in payload && payload.status !== undefined) {
    body.status = payload.status;
  }
  if ("startedAt" in payload) {
    body.started_at = payload.startedAt ? payload.startedAt.toISOString() : null;
  }
  if ("completedAt" in payload) {
    body.completed_at = payload.completedAt
      ? payload.completedAt.toISOString()
      : null;
  }
  if ("duration" in payload) {
    body.duration = payload.duration ?? null;
  }
  if ("transcript" in payload) {
    body.transcript = payload.transcript ?? null;
  }
  if ("transcriptEntries" in payload) {
    body.transcript_entries = payload.transcriptEntries ?? null;
  }
  if ("artifacts" in payload) {
    body.artifacts = payload.artifacts ?? null;
  }
  if ("analysis" in payload) {
    body.analysis = payload.analysis ?? null;
  }
  return body;
};

export const vapiRepository = {
  // Prompts
  async listPrompts(patientId: string): Promise<VAPIPrompt[]> {
    const { data, error } = await supabase
      .from("vapi_prompts")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapPrompt);
  },

  async getPromptById(id: string): Promise<VAPIPrompt | null> {
    const { data, error } = await supabase
      .from("vapi_prompts")
      .select("*")
      .eq("id", id)
      .maybeSingle<PromptRow>();

    if (error) throw new Error(error.message);
    return data ? mapPrompt(data) : null;
  },

  async createPrompt(payload: CreatePromptPayload): Promise<VAPIPrompt> {
    const { data, error } = await supabase
      .from("vapi_prompts")
      .insert({
        patient_id: payload.patientId,
        name: payload.name,
        prompt: payload.prompt,
        is_active: true,
      })
      .select("*")
      .single<PromptRow>();

    if (error) throw new Error(error.message);
    return mapPrompt(data);
  },

  async updatePrompt(id: string, updates: { name?: string; prompt?: string }): Promise<VAPIPrompt> {
    const { data, error } = await supabase
      .from("vapi_prompts")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single<PromptRow>();

    if (error) throw new Error(error.message);
    return mapPrompt(data);
  },

  async deletePrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from("vapi_prompts")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Schedules
  async listSchedules(patientId: string): Promise<VAPICallSchedule[]> {
    const { data, error } = await supabase
      .from("vapi_call_schedules")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSchedule);
  },

  async getScheduleById(id: string): Promise<VAPICallSchedule | null> {
    const { data, error } = await supabase
      .from("vapi_call_schedules")
      .select("*")
      .eq("id", id)
      .maybeSingle<ScheduleRow>();

    if (error) throw new Error(error.message);
    return data ? mapSchedule(data) : null;
  },

  async createSchedule(payload: CreateSchedulePayload): Promise<VAPICallSchedule> {
    const { data, error } = await supabase
      .from("vapi_call_schedules")
      .insert({
        patient_id: payload.patientId,
        prompt_id: payload.promptId,
        type: payload.type,
        scheduled_time: payload.scheduledTime
          ? payload.scheduledTime.toISOString()
          : null,
        recurrence_type: payload.recurrenceType ?? null,
        recurrence_end_date: payload.recurrenceEndDate
          ? payload.recurrenceEndDate.toISOString()
          : null,
        day_of_week: payload.dayOfWeek ?? null,
        day_of_month: payload.dayOfMonth ?? null,
        is_active: true,
      })
      .select("*")
      .single<ScheduleRow>();

    if (error) throw new Error(error.message);
    return mapSchedule(data);
  },

  async deactivateSchedule(id: string): Promise<VAPICallSchedule> {
    const { data, error } = await supabase
      .from("vapi_call_schedules")
      .update({ is_active: false })
      .eq("id", id)
      .select("*")
      .single<ScheduleRow>();

    if (error) throw new Error(error.message);
    return mapSchedule(data);
  },

  async listDueSchedules(): Promise<VAPICallSchedule[]> {
    const now = new Date();
    const { data, error } = await supabase
      .from("vapi_call_schedules")
      .select("*")
      .eq("is_active", true)
      .eq("type", "one-time")
      .lte("scheduled_time", now.toISOString());

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSchedule);
  },

  async updateSchedule(id: string, updates: Partial<CreateSchedulePayload> & { lastExecutedAt?: Date }): Promise<VAPICallSchedule> {
    const patch: Record<string, unknown> = {};
    if (updates.scheduledTime !== undefined) {
      patch.scheduled_time = updates.scheduledTime ? updates.scheduledTime.toISOString() : null;
    }
    if (updates.recurrenceEndDate !== undefined) {
      patch.recurrence_end_date = updates.recurrenceEndDate ? updates.recurrenceEndDate.toISOString() : null;
    }
    if (updates.lastExecutedAt !== undefined) {
      patch.last_executed_at = updates.lastExecutedAt.toISOString();
    }
    
    const { data, error } = await supabase
      .from("vapi_call_schedules")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single<ScheduleRow>();

    if (error) throw new Error(error.message);
    return mapSchedule(data);
  },

  // Calls
  async listCalls(patientId: string): Promise<VAPICall[]> {
    const { data, error } = await supabase
      .from("vapi_calls")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCall);
  },

  async getCallById(id: string): Promise<VAPICall | null> {
    const { data, error } = await supabase
      .from("vapi_calls")
      .select("*")
      .eq("id", id)
      .maybeSingle<CallRow>();

    if (error) throw new Error(error.message);
    return data ? mapCall(data) : null;
  },

  async createCall(payload: CreateCallRecordPayload): Promise<VAPICall> {
    const insertPayload = buildCallPayload(payload);
    const { data, error } = await supabase
      .from("vapi_calls")
      .insert(insertPayload)
      .select("*")
      .single<CallRow>();

    if (error) throw new Error(error.message);
    return mapCall(data);
  },

  async updateCall(id: string, updates: UpdateCallRecordPayload): Promise<VAPICall> {
    const patch = buildCallPayload(updates);
    const { data, error } = await supabase
      .from("vapi_calls")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single<CallRow>();

    if (error) throw new Error(error.message);
    return mapCall(data);
  },
};
