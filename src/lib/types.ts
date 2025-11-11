export type PrimaryCondition = "CHF" | "COPD";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  timeZone?: string;
  primaryCondition: PrimaryCondition;
  createdAt: Date;
}

export interface HealthMetric {
  id: string;
  patientId: string;
  timestamp: Date;
  weight?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  spO2?: number;
  heartRate?: number;
}

export interface VAPIPrompt {
  id: string;
  patientId: string;
  name: string;
  prompt: string;
  createdAt: Date;
  isActive: boolean;
}

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface VAPICallSchedule {
  id: string;
  patientId: string;
  promptId: string;
  type: "one-time" | "recurring" | "now";
  scheduledTime?: Date;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  dayOfWeek?: number;
  dayOfMonth?: number;
  createdAt: Date;
  isActive: boolean;
}

export interface VAPIRecommendedAction {
  owner: "care-team" | "patient" | "family" | "automation";
  action: string;
  urgency: "low" | "medium" | "high";
  dueBy?: string | null;
}

export interface VAPIEndOfCallReport {
  patientId: string;
  patientName: string;
  callPurpose: string;
  conversationOutcome:
    | "completed"
    | "voicemail"
    | "no-answer"
    | "rescheduled"
    | "unknown";
  summary: string;
  riskLevel: "low" | "moderate" | "high";
  symptomsDiscussed: string[];
  medicationAdherence:
    | "on-track"
    | "missed-dose"
    | "not-discussed"
    | "stopped";
  escalationNeeded: boolean;
  followUpType: "none" | "call" | "visit" | "escalate";
  recommendedActions: VAPIRecommendedAction[];
  notes?: string;
}

export interface VAPICallTranscriptEntry {
  role: string;
  message: string;
  time?: number;
}

export interface VAPICallArtifacts {
  recording?: string;
  logUrl?: string;
  transcriptUrl?: string;
}

export interface VAPICallAnalysis {
  summary?: string;
  structuredData?: VAPIEndOfCallReport | Record<string, unknown>;
  successEvaluation?:
    | {
        result?: string;
        rubric?: string;
        score?: number;
        notes?: string;
      }
    | Record<string, unknown>;
}

export type VAPICallStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "failed";

export interface VAPICall {
  id: string;
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
  createdAt: Date;
}
