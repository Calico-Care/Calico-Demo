import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Phone,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Play,
  Edit,
  User,
  Mail,
  MapPin,
  Heart,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { loadPrompt } from "@/lib/prompts";
import type {
  Patient,
  VAPIPrompt,
  VAPICallSchedule,
  VAPICall,
  RecurrenceType,
  VAPIEndOfCallReport,
} from "@/lib/types";
import { patientRepository } from "@/lib/repositories/patients";
import { vapiRepository } from "@/lib/repositories/vapi";
import { vapiService, VAPI_CONFIG } from "@/services/vapiService";
import { calculateDurationSeconds, formatDurationLabel } from "@/lib/duration";
import {
  format,
  startOfDay,
  addMinutes,
  isSameDay,
  setHours,
  setMinutes,
} from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper function to convert phone number to E.164 format
const formatPhoneToE164 = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it's already 10 digits (US number), add +1 prefix
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it already starts with +1 and has 11 digits, return as is
  if (digits.length === 11 && phone.startsWith("+1")) {
    return phone;
  }

  // If it already starts with +1 and digits are correct, format it
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Default: assume US number and add +1
  return `+1${digits}`;
};

const isEndOfCallReport = (
  value: unknown
): value is VAPIEndOfCallReport => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "conversationOutcome" in value && "summary" in value;
};
const getCallStatusBadge = (status: VAPICall["status"]) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    "in-progress": {
      label: "In Progress",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    completed: {
      label: "Completed",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
};

type PromptTemplateConfig = {
  id: string;
  name: string;
  description: string;
  template: string;
};

const PROMPT_TEMPLATES: PromptTemplateConfig[] = [
  {
    id: "standard-health-check",
    name: "Standard Health Check",
    description: "General wellness check focused on symptoms, meds, and follow ups.",
    template: loadPrompt("Standard_health_check"),
  },
  {
    id: "daily-wellness-check",
    name: "Daily Wellness Check",
    description: "Lightweight daily touchpoint to understand overall wellbeing.",
    template: loadPrompt("Daily_wellness_check"),
  },
  {
    id: "medication-reminder-review",
    name: "Medication Reminder & Review",
    description: "Ensures adherence while capturing any side effects or barriers.",
    template: loadPrompt("Medication_reminder_review"),
  },
  {
    id: "symptom-monitoring",
    name: "Symptom Monitoring",
    description: "Deeper dive into symptom trends and escalation needs.",
    template: loadPrompt("Symptom_monitoring"),
  },
  {
    id: "weekly-progress-review",
    name: "Weekly Progress Review",
    description: "Summarizes the week, reinforces care plans, and plans next steps.",
    template: loadPrompt("Weekly_progress_review"),
  },
].filter((template) => Boolean(template.template));

const VAPIPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatePromptOpen, setIsCreatePromptOpen] = useState(false);
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<VAPIPrompt | null>(null);
  const [callingPromptId, setCallingPromptId] = useState<string | null>(null);
  const [refreshingCallId, setRefreshingCallId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientRepository.list(),
  });

  const patients = patientsQuery.data ?? [];

  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? null;

  const promptsQuery = useQuery({
    queryKey: ["vapi", "prompts", selectedPatientId],
    queryFn: () => vapiRepository.listPrompts(selectedPatientId!),
    enabled: Boolean(selectedPatientId),
  });

  const schedulesQuery = useQuery({
    queryKey: ["vapi", "schedules", selectedPatientId],
    queryFn: () => vapiRepository.listSchedules(selectedPatientId!),
    enabled: Boolean(selectedPatientId),
  });

  const callsQuery = useQuery({
    queryKey: ["vapi", "calls", selectedPatientId],
    queryFn: () => vapiRepository.listCalls(selectedPatientId!),
    enabled: Boolean(selectedPatientId),
  });

  const prompts = promptsQuery.data ?? [];
  const schedules = schedulesQuery.data ?? [];
  const callHistory = callsQuery.data ?? [];

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleCreatePrompt = async (name: string, promptTemplate: string) => {
    if (!selectedPatient) return;

    try {
      await vapiRepository.createPrompt({
        patientId: selectedPatient.id,
        name,
        prompt: promptTemplate,
      });
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "prompts", selectedPatient.id],
      });
      setIsCreatePromptOpen(false);
      toast({
        title: "Prompt Created",
        description: `Prompt "${name}" has been created for ${selectedPatient.firstName} ${selectedPatient.lastName}.`,
      });
    } catch (error) {
      toast({
        title: "Prompt Error",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create prompt right now.",
        variant: "destructive",
      });
    }
  };

  const handleCallNow = async (promptId: string) => {
    if (!selectedPatient) return;

    setCallingPromptId(promptId);
    try {
      const e164Phone = formatPhoneToE164(selectedPatient.phone || "");
      await vapiService.createCall({
        patientId: selectedPatient.id,
        promptId,
        phoneNumber: e164Phone,
      });
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "calls", selectedPatient.id],
      });
      toast({
        title: "Call Initiated",
        description: `Calling ${selectedPatient.firstName} ${selectedPatient.lastName} now...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to initiate call",
        variant: "destructive",
      });
    } finally {
      setCallingPromptId(null);
    }
  };

  const handleRefreshCallReport = async (callId: string) => {
    if (!selectedPatient) return;

    setRefreshingCallId(callId);
    try {
      await vapiService.refreshCallDetails(callId);
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "calls", selectedPatient.id],
      });
      toast({
        title: "Report synced",
        description: "Latest transcript and end-of-call report have been fetched.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description:
          error instanceof Error ? error.message : "Unable to fetch call details.",
        variant: "destructive",
      });
    } finally {
      setRefreshingCallId(null);
    }
  };

  const handleScheduleCall = async (
    promptId: string,
    type: "one-time" | "recurring" | "now",
    scheduledTime?: Date,
    recurrenceType?: RecurrenceType,
    recurrenceEndDate?: Date,
    dayOfWeek?: number
  ) => {
    if (!selectedPatient) return;

    try {
      if (type === "now") {
        const e164Phone = formatPhoneToE164(selectedPatient.phone || "");
        await vapiService.createCall({
          patientId: selectedPatient.id,
          promptId,
          phoneNumber: e164Phone,
        });
        await queryClient.invalidateQueries({
          queryKey: ["vapi", "calls", selectedPatient.id],
        });
        toast({
          title: "Call Initiated",
          description: `Calling ${selectedPatient.firstName} ${selectedPatient.lastName} now...`,
        });
      } else {
        await vapiService.scheduleCall({
          patientId: selectedPatient.id,
          promptId,
          type,
          scheduledTime,
          recurrenceType,
          recurrenceEndDate,
          dayOfWeek,
        });
        await queryClient.invalidateQueries({
          queryKey: ["vapi", "schedules", selectedPatient.id],
        });
        toast({
          title: "Call Scheduled",
          description: `Call has been scheduled for ${selectedPatient.firstName} ${selectedPatient.lastName}.`,
        });
      }
      setIsScheduleCallOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to schedule call",
        variant: "destructive",
      });
    }
  };

  const handleAddPresetPrompt = (name: string, template: string) => {
    void handleCreatePrompt(name, template);
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!selectedPatient) return;

    try {
      await vapiRepository.deletePrompt(promptId);
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "prompts", selectedPatient.id],
      });
      toast({
        title: "Prompt Deleted",
        description: "Prompt has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Unable to delete prompt",
        description:
          error instanceof Error
            ? error.message
            : "Please try deleting the prompt again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 text-2xl">🐱</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cali Assistant
              </h1>
              <p className="text-gray-600">
                Manage patient calls and voice prompts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Patients</CardTitle>
                <CardDescription>
                  Select a patient to manage their calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No patients found</p>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                          selectedPatient?.id === patient.id
                            ? "bg-blue-50 border-blue-500 shadow-md"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setSelectedPrompt(null);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                              {patient.firstName[0]}
                              {patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {patient.primaryCondition}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Info Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-semibold">
                            {selectedPatient.firstName[0]}
                            {selectedPatient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedPatient.firstName}{" "}
                            {selectedPatient.lastName}
                          </h2>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{selectedPatient.email}</span>
                            </div>
                            {selectedPatient.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{selectedPatient.phone}</span>
                              </div>
                            )}
                            <Badge variant="secondary">
                              {selectedPatient.primaryCondition}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prompts Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Voice Prompts</CardTitle>
                        <CardDescription>
                          Manage prompts for automated patient calls
                        </CardDescription>
                      </div>
                      <Dialog
                        open={isCreatePromptOpen}
                        onOpenChange={setIsCreatePromptOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Custom Prompt
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Prompt</DialogTitle>
                            <DialogDescription>
                              Create a custom prompt for{" "}
                              {selectedPatient.firstName}{" "}
                              {selectedPatient.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <CreatePromptForm
                            onSubmit={(name, template) =>
                              handleCreatePrompt(name, template)
                            }
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {prompts.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg mb-6">
                        <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium mb-2">
                          No prompts added yet
                        </p>
                        <p className="text-sm text-gray-400">
                          Add preset prompts below or create a custom one
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6">
                        {prompts.map((prompt) => (
                          <PromptCard
                            key={prompt.id}
                            prompt={prompt}
                            onDelete={handleDeletePrompt}
                            onCallNow={() => handleCallNow(prompt.id)}
                            onSchedule={() => {
                              setSelectedPrompt(prompt);
                              setIsScheduleCallOpen(true);
                            }}
                            isLoading={callingPromptId === prompt.id}
                          />
                        ))}
                      </div>
                    )}

                    {/* Preset Prompts Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Preset Prompts
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add these pre-configured prompts to this patient
                      </p>
                      <div className="space-y-3">
                        {PROMPT_TEMPLATES.map((template) => {
                          const isAlreadyAdded = prompts.some(
                            (p) => p.name === template.name
                          );
                          return (
                            <Card
                              key={template.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="text-base font-semibold text-gray-900">
                                        {template.name}
                                      </h4>
                                      {isAlreadyAdded && (
                                        <Badge variant="secondary">Added</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                      {template.description}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleAddPresetPrompt(
                                        template.name,
                                        template.template
                                      )
                                    }
                                    disabled={isAlreadyAdded}
                                  >
                                    {isAlreadyAdded ? (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Added
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scheduled Calls Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Scheduled Calls</CardTitle>
                        <CardDescription>
                          View and manage scheduled patient calls
                        </CardDescription>
                      </div>
                      {prompts.length > 0 && (
                        <Dialog
                          open={isScheduleCallOpen}
                          onOpenChange={(open) => {
                            setIsScheduleCallOpen(open);
                            if (!open) {
                              setSelectedPrompt(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Call
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Schedule VAPI Call</DialogTitle>
                              <DialogDescription>
                                Schedule a call for {selectedPatient.firstName}{" "}
                                {selectedPatient.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            <ScheduleCallForm
                              prompts={prompts}
                              selectedPrompt={selectedPrompt}
                              onSubmit={handleScheduleCall}
                              existingSchedules={schedules}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {schedules.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium mb-2">
                          No scheduled calls
                        </p>
                        <p className="text-sm text-gray-400">
                          Schedule calls to automate patient check-ins
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {schedules.map((schedule) => (
                          <ScheduleCard
                            key={schedule.id}
                            schedule={schedule}
                            prompts={prompts}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Call History Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Call History</CardTitle>
                    <CardDescription>
                      View past call records and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {callHistory.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium mb-2">
                          No call history
                        </p>
                        <p className="text-sm text-gray-400">
                          Call history will appear here after calls are made
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {callHistory.map((call) => (
                          <CallHistoryCard
                            key={call.id}
                            call={call}
                            prompts={prompts}
                            onRefresh={() => handleRefreshCallReport(call.id)}
                            isRefreshing={refreshingCallId === call.id}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Patient
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Choose a patient from the list to view their prompts,
                    schedule calls, and view call history.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for time blocks - 30 minute blocks
const getTimeBlocks = (): Date[] => {
  const blocks: Date[] = [];
  const start = new Date();
  start.setHours(8, 0, 0, 0); // Start at 8 AM
  const end = new Date();
  end.setHours(20, 0, 0, 0); // End at 8 PM

  let current = new Date(start);
  while (current <= end) {
    blocks.push(new Date(current));
    current = addMinutes(current, 30);
  }

  return blocks;
};

const roundTo30Minutes = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 30) * 30;
  return setMinutes(date, roundedMinutes);
};

const isTimeBlockOccupied = (
  date: Date,
  timeBlock: Date,
  existingSchedules: VAPICallSchedule[]
): boolean => {
  const blockHour = timeBlock.getHours();
  const blockMinute = timeBlock.getMinutes();

  return existingSchedules.some((schedule) => {
    if (
      !schedule.isActive ||
      schedule.type !== "one-time" ||
      !schedule.scheduledTime
    ) {
      return false;
    }

    const scheduleDate = new Date(schedule.scheduledTime);

    // Check if it's the same day
    if (!isSameDay(date, scheduleDate)) {
      return false;
    }

    // Check if the time blocks overlap (same 30-minute block)
    const scheduleHour = scheduleDate.getHours();
    const scheduleMinute = scheduleDate.getMinutes();
    const scheduleRoundedMinute = Math.floor(scheduleMinute / 30) * 30;

    return scheduleHour === blockHour && scheduleRoundedMinute === blockMinute;
  });
};

// Create Prompt Form Component
const CreatePromptForm = ({
  onSubmit,
}: {
  onSubmit: (name: string, template: string) => void;
}) => {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && template.trim()) {
      onSubmit(name.trim(), template.trim());
      setName("");
      setTemplate("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt-name">Prompt Name</Label>
        <Input
          id="prompt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Daily Wellness Check"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prompt-template">Prompt Template</Label>
        <Textarea
          id="prompt-template"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Enter prompt template..."
          rows={10}
          required
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Use variables: {"{{patientName}}"}, {"{{patientAge}}"},{" "}
          {"{{patientCondition}}"}
        </p>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={!name.trim() || !template.trim()}>
          Create Prompt
        </Button>
      </div>
    </form>
  );
};

// Prompt Card Component
const PromptCard = ({
  prompt,
  onDelete,
  onCallNow,
  onSchedule,
  isLoading = false,
}: {
  prompt: VAPIPrompt;
  onDelete: (id: string) => void;
  onCallNow: () => void;
  onSchedule: () => void;
  isLoading?: boolean;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {prompt.name}
              </h3>
              <Badge variant={prompt.isActive ? "default" : "secondary"}>
                {prompt.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Created {format(prompt.createdAt, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCallNow}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calling...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Call Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSchedule}
              disabled={isLoading}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(prompt.id)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Schedule Call Form Component
const ScheduleCallForm = ({
  prompts,
  selectedPrompt,
  onSubmit,
  existingSchedules,
}: {
  prompts: VAPIPrompt[];
  selectedPrompt: VAPIPrompt | null;
  onSubmit: (
    promptId: string,
    type: "one-time" | "recurring" | "now",
    scheduledTime?: Date,
    recurrenceType?: RecurrenceType,
    recurrenceEndDate?: Date,
    dayOfWeek?: number
  ) => void;
  existingSchedules: VAPICallSchedule[];
}) => {
  const [promptId, setPromptId] = useState(selectedPrompt?.id || "");
  const [callType, setCallType] = useState<"one-time" | "recurring">(
    "one-time"
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<Date | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<
    number | undefined
  >(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const timeBlocks = getTimeBlocks();

  // Update promptId when selectedPrompt changes
  useEffect(() => {
    if (selectedPrompt) {
      setPromptId(selectedPrompt.id);
    }
  }, [selectedPrompt]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!selectedPrompt) {
      setPromptId("");
      setSelectedDate(undefined);
      setSelectedTimeBlock(null);
      setCallType("one-time");
      setRecurrenceType("daily");
      setRecurrenceEndDate(undefined);
      setSelectedDayOfWeek(undefined);
      setCalendarOpen(false);
    }
  }, [selectedPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let scheduledDateTime: Date | undefined;
    if (callType === "one-time") {
      if (selectedDate && selectedTimeBlock) {
        scheduledDateTime = new Date(selectedDate);
        scheduledDateTime.setHours(
          selectedTimeBlock.getHours(),
          selectedTimeBlock.getMinutes(),
          0,
          0
        );
        scheduledDateTime = roundTo30Minutes(scheduledDateTime);
      }
    } else if (callType === "recurring" && selectedTimeBlock) {
      // For recurring calls, store the time component in scheduledTime
      // We'll use today's date as a base, but only the time matters
      scheduledDateTime = new Date();
      scheduledDateTime.setHours(
        selectedTimeBlock.getHours(),
        selectedTimeBlock.getMinutes(),
        0,
        0
      );
      scheduledDateTime = roundTo30Minutes(scheduledDateTime);
    }

    onSubmit(
      promptId,
      callType,
      scheduledDateTime,
      callType === "recurring" ? recurrenceType : undefined,
      recurrenceEndDate,
      callType === "recurring" && recurrenceType === "weekly"
        ? selectedDayOfWeek
        : undefined
    );
  };

  const formatTimeBlock = (block: Date): string => {
    return format(block, "h:mm a");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt">Select Prompt</Label>
        <Select value={promptId} onValueChange={setPromptId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a prompt" />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                {prompt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Call Type</Label>
        <Select
          value={callType}
          onValueChange={(value) => setCallType(value as typeof callType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-time">One-Time Call</SelectItem>
            <SelectItem value="recurring">Recurring Call</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {callType === "one-time" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date < startOfDay(new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <Label>Select Time (30-minute blocks)</Label>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                {timeBlocks.map((block, index) => {
                  const isOccupied = isTimeBlockOccupied(
                    selectedDate,
                    block,
                    existingSchedules
                  );
                  const isSelected =
                    selectedTimeBlock?.getHours() === block.getHours() &&
                    selectedTimeBlock?.getMinutes() === block.getMinutes();

                  return (
                    <Button
                      key={index}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      disabled={isOccupied}
                      onClick={() => setSelectedTimeBlock(block)}
                      className={`h-10 text-sm ${
                        isOccupied
                          ? "opacity-50 cursor-not-allowed bg-gray-100"
                          : isSelected
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {formatTimeBlock(block)}
                    </Button>
                  );
                })}
              </div>
              {selectedDate &&
                timeBlocks.some((block) =>
                  isTimeBlockOccupied(selectedDate, block, existingSchedules)
                ) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Grayed out time slots are already scheduled
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      {callType === "recurring" && (
        <>
          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Select
              value={recurrenceType}
              onValueChange={(value) => {
                setRecurrenceType(value as RecurrenceType);
                setSelectedDayOfWeek(undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrenceType === "weekly" && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={selectedDayOfWeek?.toString() || ""}
                onValueChange={(value) => setSelectedDayOfWeek(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day of week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Time (30-minute blocks)</Label>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
              {timeBlocks.map((block, index) => {
                const isSelected =
                  selectedTimeBlock?.getHours() === block.getHours() &&
                  selectedTimeBlock?.getMinutes() === block.getMinutes();

                return (
                  <Button
                    key={index}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedTimeBlock(block)}
                    className={`h-10 text-sm ${
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    {formatTimeBlock(block)}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {recurrenceEndDate
                    ? format(recurrenceEndDate, "PPP")
                    : "Pick an end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={recurrenceEndDate}
                  onSelect={setRecurrenceEndDate}
                  disabled={(date) => date < startOfDay(new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={
            !promptId ||
            (callType === "one-time" &&
              (!selectedDate || !selectedTimeBlock)) ||
            (callType === "recurring" &&
              ((recurrenceType === "weekly" &&
                selectedDayOfWeek === undefined) ||
                !selectedTimeBlock))
          }
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Call
        </Button>
      </div>
    </form>
  );
};

// Schedule Card Component
const ScheduleCard = ({
  schedule,
  prompts,
}: {
  schedule: VAPICallSchedule;
  prompts: VAPIPrompt[];
}) => {
  const prompt = prompts.find((p) => p.id === schedule.promptId);

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek] || "";
  };

  const formatScheduleInfo = (): string => {
    if (schedule.type === "one-time" && schedule.scheduledTime) {
      return `Scheduled for ${format(
        schedule.scheduledTime,
        "MMM d, yyyy 'at' h:mm a"
      )}`;
    } else if (schedule.type === "recurring") {
      let info = "";

      if (schedule.recurrenceType === "daily") {
        if (schedule.scheduledTime) {
          info = `Daily at ${format(schedule.scheduledTime, "h:mm a")}`;
        } else {
          info = "Daily";
        }
      } else if (schedule.recurrenceType === "weekly") {
        const dayName =
          schedule.dayOfWeek !== undefined
            ? getDayName(schedule.dayOfWeek)
            : "";
        if (schedule.scheduledTime) {
          info = `${dayName} at ${format(schedule.scheduledTime, "h:mm a")}`;
        } else {
          info = dayName || "Weekly";
        }
      } else {
        info = `Recurring ${schedule.recurrenceType} calls`;
      }

      if (schedule.recurrenceEndDate) {
        info += ` until ${format(schedule.recurrenceEndDate, "MMM d, yyyy")}`;
      }

      return info;
    }
    return "Immediate call";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {prompt?.name || "Unknown Prompt"}
              </h3>
              <Badge variant={schedule.isActive ? "default" : "secondary"}>
                {schedule.isActive ? "Active" : "Cancelled"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{formatScheduleInfo()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Call History Card Component
const CallHistoryCard = ({
  call,
  prompts,
  onRefresh,
  isRefreshing,
}: {
  call: VAPICall;
  prompts: VAPIPrompt[];
  onRefresh: () => void;
  isRefreshing: boolean;
}) => {
  const prompt = prompts.find((p) => p.id === call.promptId);
  const report = isEndOfCallReport(call.analysis?.structuredData)
    ? (call.analysis?.structuredData as VAPIEndOfCallReport)
    : undefined;
  const transcriptPreview = call.transcriptEntries?.slice(0, 40);
  const isTranscriptTruncated =
    (call.transcriptEntries?.length || 0) > (transcriptPreview?.length || 0);
  const durationSeconds =
    call.duration ??
    calculateDurationSeconds(call.startedAt, call.completedAt);
  const durationLabel = formatDurationLabel(durationSeconds);
  const createdLabel = format(call.createdAt, "MMM d, yyyy 'at' h:mm a");
  const startedLabel = call.startedAt
    ? format(call.startedAt, "MMM d, yyyy 'at' h:mm a")
    : undefined;
  const completedLabel = call.completedAt
    ? format(call.completedAt, "MMM d, yyyy 'at' h:mm a")
    : undefined;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {prompt?.name || "Unknown Prompt"}
              </h3>
            </div>
            <div className="text-sm text-gray-500 space-y-0.5">
              <p>Created: {createdLabel}</p>
              {startedLabel && <p>Started: {startedLabel}</p>}
              <p className={completedLabel ? undefined : "text-amber-600"}>
                Completed: {completedLabel ?? "Not recorded yet"}
                {completedLabel && durationLabel && ` • Duration: ${durationLabel}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {call.providerCallId && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync report
                  </>
                )}
              </Button>
            )}
            {getCallStatusBadge(call.status)}
          </div>
        </div>

        {call.analysis?.summary && (
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Summary</p>
            <div className="mt-1 space-y-2 rounded-md border bg-white/70 p-3 text-sm leading-relaxed text-gray-800">
              <ReactMarkdown>{call.analysis.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {report && (
          <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Outcome
                </p>
                <p className="font-medium text-gray-900">
                  {report.conversationOutcome}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Risk level
                </p>
                <p className="font-medium text-gray-900">{report.riskLevel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Follow-up
                </p>
                <p className="font-medium text-gray-900">
                  {report.followUpType}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Escalation needed
                </p>
                <p className="font-medium text-gray-900">
                  {report.escalationNeeded ? "Yes" : "No"}
                </p>
              </div>
            </div>
            {report.symptomsDiscussed?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Symptoms discussed
                </p>
                <p className="font-medium text-gray-900">
                  {report.symptomsDiscussed.join(", ")}
                </p>
              </div>
            )}
            {report.recommendedActions?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Recommended actions
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                  {report.recommendedActions.map((action, index) => (
                    <li key={`${action.owner}-${index}`}>
                      <span className="font-medium">{action.owner}</span>:{" "}
                      {action.action} ({action.urgency})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.notes && (
              <p className="mt-3 text-gray-700">
                <span className="font-medium">Notes:</span> {report.notes}
              </p>
            )}
          </div>
        )}

        {call.analysis?.successEvaluation && (
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Success evaluation
            </p>
            <pre className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(call.analysis.successEvaluation, null, 2)}
            </pre>
          </div>
        )}

        {transcriptPreview?.length ? (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Transcript</p>
              {isTranscriptTruncated && (
                <p className="text-xs text-gray-500">
                  Showing first {transcriptPreview.length} turns
                </p>
              )}
            </div>
            <div className="mt-1 max-h-56 space-y-1 overflow-y-auto rounded-md border bg-gray-50 p-3 text-xs font-mono leading-relaxed text-gray-800">
              {transcriptPreview.map((entry, index) => (
                <p key={`${entry.role}-${index}`}>
                  <span className="text-gray-500 uppercase">
                    {entry.role || "speaker"}:
                  </span>{" "}
                  {entry.message}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {call.artifacts &&
          (call.artifacts.recording ||
            call.artifacts.logUrl ||
            call.artifacts.transcriptUrl) && (
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Artifacts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {call.artifacts.recording && (
                  <a
                    href={call.artifacts.recording}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Recording
                  </a>
                )}
                {call.artifacts.transcriptUrl && (
                  <a
                    href={call.artifacts.transcriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Full transcript
                  </a>
                )}
                {call.artifacts.logUrl && (
                  <a
                    href={call.artifacts.logUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Call logs
                  </a>
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default VAPIPage;
