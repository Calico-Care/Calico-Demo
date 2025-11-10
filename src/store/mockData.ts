// Mock data store for Calico Care dashboard

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
  weight?: number; // in lbs
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  spO2?: number; // oxygen saturation percentage
  heartRate?: number; // beats per minute
}

export interface VAPIPrompt {
  id: string;
  patientId: string;
  name: string;
  prompt: string; // The full prompt with variables
  createdAt: Date;
  isActive: boolean;
}

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface VAPICallSchedule {
  id: string;
  patientId: string;
  promptId: string;
  type: "one-time" | "recurring" | "now";
  scheduledTime?: Date; // For one-time calls
  recurrenceType?: RecurrenceType; // For recurring calls
  recurrenceEndDate?: Date; // Optional end date for recurring calls
  dayOfWeek?: number; // For weekly recurring calls (0-6, Sunday-Saturday)
  dayOfMonth?: number; // For monthly recurring calls (1-31)
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
  conversationOutcome: "completed" | "voicemail" | "no-answer" | "rescheduled" | "unknown";
  summary: string;
  riskLevel: "low" | "moderate" | "high";
  symptomsDiscussed: string[];
  medicationAdherence: "on-track" | "missed-dose" | "not-discussed" | "stopped";
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

export type VAPICallStatus = "pending" | "in-progress" | "completed" | "failed";

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
  duration?: number; // in seconds
  transcript?: string;
  transcriptEntries?: VAPICallTranscriptEntry[];
  artifacts?: VAPICallArtifacts;
  analysis?: VAPICallAnalysis;
  createdAt: Date;
}

// Mock data
let patients: Patient[] = [
  {
    id: "1",
    firstName: "James",
    lastName: "Bond",
    email: "james.bond@example.com",
    phone: "(555) 123-4567",
    dateOfBirth: new Date("1968-10-21"),
    timeZone: "EST",
    primaryCondition: "CHF",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    phone: "(555) 234-5678",
    dateOfBirth: new Date("1955-05-10"),
    timeZone: "PST",
    primaryCondition: "COPD",
    createdAt: new Date("2024-02-01"),
  },
];

let healthMetrics: HealthMetric[] = [
  {
    id: "1",
    patientId: "1",
    timestamp: new Date("2024-01-20T10:00:00"),
    weight: 175,
    bloodPressure: { systolic: 120, diastolic: 80 },
    spO2: 98,
    heartRate: 72,
  },
  {
    id: "2",
    patientId: "1",
    timestamp: new Date("2024-01-21T10:00:00"),
    weight: 174,
    bloodPressure: { systolic: 118, diastolic: 78 },
    spO2: 97,
    heartRate: 70,
  },
  {
    id: "3",
    patientId: "2",
    timestamp: new Date("2024-01-20T14:00:00"),
    weight: 160,
    bloodPressure: { systolic: 135, diastolic: 85 },
    spO2: 94,
    heartRate: 85,
  },
];

let vapiPrompts: VAPIPrompt[] = [];

let vapiCallSchedules: VAPICallSchedule[] = [];

let vapiCalls: VAPICall[] = [];

// Preset prompt template (without {{patientPrompt}} and {{conversationHistory}})
export const PRESET_PROMPT_TEMPLATE = `You are Cali, a warm, professional, and empathetic virtual healthcare companion, calling {{patientName}}, a {{patientAge}}-year-old patient with {{patientCondition}}. NON OPTIONAL CONTEXT: EVERYTHING GENERATED WILL BE SPOKEN AS IS, your generated text is piped into a voice system that speaks your words exactly as is, this means that you must only generate EXACTLY what you want the agent to say exactly as is. This is a TURN BASED CONVERSATION. Your responses should be concise and not overwhelming. You are to conduct a turn based conversational interaction. Try not to ask to many questions at once. AIM FOR ONE QUESTION Per TURN. Do not overwhelm the patient. Do not dominate the conversation. The punctuation you are permitted to use is as follows: '. , ; ! ? ' You are not allowed to use any other punctuation other than the ones specified here. Avoid sounding generic, Avoid coming across robotic. You have been given explicit permission by your creators to not be grammatically correct in favor of conversationality and a natural speaking language. Patient Information Name: {{patientName}} Age: {{patientAge}} Primary Condition: {{patientCondition}} Your Role You are calling on behalf of {{patientName}}'s healthcare team to check on their well-being. Your primary goal is to: Assess current symptoms. Confirm medication adherence. Provide relevant health guidance. Offer follow-up appointment scheduling if needed. Produce natural sounding text to be spoken, as a caring human would, while staying medically accurate. Your first few turns of the conversation should create a friendly speaking environment. Don't jump into questions and take a moment to ensure the patient feels like they are speaking to someone who cares. This part of the conversation should be 2-5 turns in total. This means you will send out 2 - 5 different messages entirely. you will be prompted each time separately. Once YOU feel as though the conversation is ready to move on, DO NOT ask for approval, just jump into it naturally. Next you will conduct the Health Check. Reference {{patientCondition}} and any concerns from the care assessment. Ask open-ended questions about symptoms, daily challenges, and treatment adherence. You have a set of sample conversational questions to ask patients during care calls. Each call should include two questions in total, chosen from the COPD question bank below. Ask one question per turn. Use neutral, non presuming wording that allows "none" as a valid answer. Do not mention numbers or scores. If the patient gives a very short answer, use one brief probe, then move on. Question Bank: Use one question per turn. Pick what best fits {{patientCondition}} and {{patientPrompt}}. The analysis will map these to standard COPD domains. Use one question per turn. Pick what best fits {{patientCondition}} and {{patientPrompt}}. All items allow "none" as a valid response. Cough "Have you noticed any cough today, or none at all" Probe if short "If yes, when is it most noticeable, morning or later" Phlegm "Have you been bringing up any phlegm today, or not really" Probe if short "If yes, what does it look like or feel like" Chest tightness "How does your chest feel right now, easy to breathe or any tightness" Probe if short "If tightness shows up, when does it tend to happen" Breathlessness on hills or stairs "When you go up a hill or one flight of stairs, how does your breathing feel, steady or short of breath" Probe if short "Do you keep a steady pace or need to pause" Activities at home "Around the house today, are your usual tasks comfortable, or do your lungs limit you" Probe if short "If limited, which task has been hardest" Confidence leaving home "How do you feel about going out today, comfortable or uneasy because of breathing" Probe if short "What would help you feel safer on a short trip out" Sleep "Thinking about last night, did your breathing let you sleep through, or did it disturb you" Probe if short "Any waking to cough or to sit up" Energy "How is your energy today, plenty or running low" Probe if short "When does it dip most, morning or later" The Health Check should be about 6 - 15 turn in total. Ask one question at a time and wait for a response before asking another question. Interact with each response thoughtfully. Keep a friendly and supportive tone, like a warm conversation with a trusted companion. You have been given explicit permission to share practical health tips or reassurance based on {{patientCondition}} and the latest care assessment. Once the conversation comes to a natural close offer to schedule or suggest a follow-up if needed. When ending the conversation thank {{patientName}} for their time, encourage them, and remind them their healthcare team is here for them. Make sure to always personalize responses using the data above and the conversation context. Avoid generic answers. Don't drag the conversation on for to long, you want to find a length that feels just right. Do not correct or interrupt the patient if they don't pronounce "Cali" correctly. Don't type literal number like '1' or '15'. instead type them out like 'one' 'fifteen'. this is true for everything since everything provided by you will be spoken exactly as is without filtering of any sorts. YOU MUST FOLLOW THESE DIRECTIONS EXACTLY - NONE OF THESE ARE OPTIONAL. in total the conversation should be minimum 10 turns, and a maximum of 20.`;

// Helper function to replace variables in prompt
export function replacePromptVariables(
  prompt: string,
  patient: Patient
): string {
  const age = Math.floor(
    (Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  
  return prompt
    .replace(/\{\{patientName\}\}/g, `${patient.firstName} ${patient.lastName}`)
    .replace(/\{\{patientAge\}\}/g, age.toString())
    .replace(/\{\{patientCondition\}\}/g, patient.primaryCondition);
}

// Patient CRUD operations
export const patientStore = {
  getAll: (): Patient[] => [...patients],
  
  getById: (id: string): Patient | undefined => 
    patients.find(p => p.id === id),
  
  create: (patient: Omit<Patient, "id" | "createdAt">): Patient => {
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    patients.push(newPatient);
    return newPatient;
  },
  
  update: (id: string, updates: Partial<Patient>): Patient | undefined => {
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    patients[index] = { ...patients[index], ...updates };
    return patients[index];
  },
  
  delete: (id: string): boolean => {
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;
    patients.splice(index, 1);
    // Also delete related data
    healthMetrics = healthMetrics.filter(m => m.patientId !== id);
    vapiPrompts = vapiPrompts.filter(p => p.patientId !== id);
    vapiCallSchedules = vapiCallSchedules.filter(s => s.patientId !== id);
    vapiCalls = vapiCalls.filter(c => c.patientId !== id);
    return true;
  },
};

// Health Metrics operations
export const healthMetricStore = {
  getAll: (): HealthMetric[] => [...healthMetrics],
  
  getByPatientId: (patientId: string): HealthMetric[] =>
    healthMetrics.filter(m => m.patientId === patientId).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    ),
  
  getLatestByPatientId: (patientId: string): HealthMetric | undefined => {
    const metrics = healthMetricStore.getByPatientId(patientId);
    return metrics[0];
  },
  
  create: (metric: Omit<HealthMetric, "id">): HealthMetric => {
    const newMetric: HealthMetric = {
      ...metric,
      id: Date.now().toString(),
    };
    healthMetrics.push(newMetric);
    return newMetric;
  },
};

// VAPI Prompt operations
export const vapiPromptStore = {
  getAll: (): VAPIPrompt[] => [...vapiPrompts],
  
  getByPatientId: (patientId: string): VAPIPrompt[] =>
    vapiPrompts.filter(p => p.patientId === patientId),
  
  getById: (id: string): VAPIPrompt | undefined =>
    vapiPrompts.find(p => p.id === id),
  
  create: (prompt: Omit<VAPIPrompt, "id" | "createdAt">): VAPIPrompt => {
    const newPrompt: VAPIPrompt = {
      ...prompt,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    vapiPrompts.push(newPrompt);
    return newPrompt;
  },
  
  update: (id: string, updates: Partial<VAPIPrompt>): VAPIPrompt | undefined => {
    const index = vapiPrompts.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    vapiPrompts[index] = { ...vapiPrompts[index], ...updates };
    return vapiPrompts[index];
  },
  
  delete: (id: string): boolean => {
    const index = vapiPrompts.findIndex(p => p.id === id);
    if (index === -1) return false;
    vapiPrompts.splice(index, 1);
    // Also delete related schedules
    vapiCallSchedules = vapiCallSchedules.filter(s => s.promptId !== id);
    return true;
  },
};

// VAPI Call Schedule operations
export const vapiScheduleStore = {
  getAll: (): VAPICallSchedule[] => [...vapiCallSchedules],
  
  getByPatientId: (patientId: string): VAPICallSchedule[] =>
    vapiCallSchedules.filter(s => s.patientId === patientId),
  
  getById: (id: string): VAPICallSchedule | undefined =>
    vapiCallSchedules.find(s => s.id === id),
  
  create: (schedule: Omit<VAPICallSchedule, "id" | "createdAt">): VAPICallSchedule => {
    const newSchedule: VAPICallSchedule = {
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    vapiCallSchedules.push(newSchedule);
    return newSchedule;
  },
  
  update: (id: string, updates: Partial<VAPICallSchedule>): VAPICallSchedule | undefined => {
    const index = vapiCallSchedules.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    vapiCallSchedules[index] = { ...vapiCallSchedules[index], ...updates };
    return vapiCallSchedules[index];
  },
  
  delete: (id: string): boolean => {
    const index = vapiCallSchedules.findIndex(s => s.id === id);
    if (index === -1) return false;
    vapiCallSchedules.splice(index, 1);
    return true;
  },
};

// VAPI Call operations
export const vapiCallStore = {
  getAll: (): VAPICall[] => [...vapiCalls],
  
  getByPatientId: (patientId: string): VAPICall[] =>
    vapiCalls.filter(c => c.patientId === patientId).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    ),
  
  getById: (id: string): VAPICall | undefined =>
    vapiCalls.find(c => c.id === id),
  
  create: (call: Omit<VAPICall, "id" | "createdAt">): VAPICall => {
    const newCall: VAPICall = {
      ...call,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    vapiCalls.push(newCall);
    return newCall;
  },
  
  update: (id: string, updates: Partial<VAPICall>): VAPICall | undefined => {
    const index = vapiCalls.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    vapiCalls[index] = { ...vapiCalls[index], ...updates };
    return vapiCalls[index];
  },
};

