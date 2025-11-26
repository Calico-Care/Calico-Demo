import { useState, useEffect, useMemo, useRef } from "react";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { loadPrompt, availablePrompts } from "@/lib/prompts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const getCallStatusBadge = (call: VAPICall) => {
  // If the call has analysis data (summary or report), show as completed
  const hasAnalysisData = call.analysis?.summary || isEndOfCallReport(call.analysis?.structuredData);
  const effectiveStatus = hasAnalysisData && call.status === "pending" ? "completed" : call.status;
  
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
  const config = statusConfig[effectiveStatus];
  return <Badge className={config.className}>{config.label}</Badge>;
};

type PromptTemplateConfig = {
  id: string;
  name: string;
  description: string;
  template: string;
};

const KNOWN_DESCRIPTIONS: Record<string, string> = {
  "Standard_health_check": "General wellness check focused on symptoms, meds, and follow ups.",
  "Daily_wellness_check": "Lightweight daily touchpoint to understand overall wellbeing.",
  "Medication_reminder_review": "Ensures adherence while capturing any side effects or barriers.",
  "Symptom_monitoring": "Deeper dive into symptom trends and escalation needs.",
  "Weekly_progress_review": "Summarizes the week, reinforces care plans, and plans next steps.",
  "COPD_Assesment_Test": "Assess the impact of COPD on a patient's life."
};

const PROMPT_TEMPLATES: PromptTemplateConfig[] = availablePrompts
  .map((filename) => ({
    id: filename.toLowerCase().replace(/_/g, "-"),
    name: filename.replace(/_/g, " "),
    description: KNOWN_DESCRIPTIONS[filename] || "Custom prompt template",
    template: loadPrompt(filename),
  }))
  .filter((template) => Boolean(template.template));

const VAPIPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatePromptOpen, setIsCreatePromptOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<VAPIPrompt | null>(null);
  const [callingPromptId, setCallingPromptId] = useState<string | null>(null);
  const [refreshingCallId, setRefreshingCallId] = useState<string | null>(null);
  const [isScheduleManagerOpen, setIsScheduleManagerOpen] = useState(false);
  const [recentlyAddedPromptName, setRecentlyAddedPromptName] = useState<string | null>(null);
  const [presetInFlight, setPresetInFlight] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);
  const [callHistoryOpen, setCallHistoryOpen] = useState(true);
  const [callDetailsCall, setCallDetailsCall] = useState<VAPICall | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Poll for and execute scheduled calls every 30 seconds
  useEffect(() => {
    const executeScheduledCalls = async () => {
      try {
        const result = await vapiService.executeDueSchedules();
        if (result.executed > 0) {
          // Refresh calls and schedules after executing
          queryClient.invalidateQueries({ queryKey: ["vapi", "calls"] });
          queryClient.invalidateQueries({ queryKey: ["vapi", "schedules"] });
          toast({
            title: "Scheduled Call Initiated",
            description: `${result.executed} scheduled call(s) have been initiated.`,
          });
        }
      } catch (error) {
        console.error("Failed to execute scheduled calls:", error);
      }
    };

    // Execute immediately on mount
    executeScheduledCalls();

    // Then poll every 30 seconds
    const intervalId = setInterval(executeScheduledCalls, 30000);

    return () => clearInterval(intervalId);
  }, [queryClient, toast]);

  const prompts = promptsQuery.data ?? [];
  const schedules = schedulesQuery.data ?? [];
  const callHistory = callsQuery.data ?? [];
  const availablePresetTemplates = useMemo(
    () =>
      PROMPT_TEMPLATES.filter(
        (template) => !prompts.some((p) => p.name === template.name),
      ),
    [prompts],
  );
  const activeSchedules = schedules.filter((schedule) => schedule.isActive);
  const nextScheduledCall =
    activeSchedules
      .filter((schedule) => schedule.scheduledTime)
      .sort(
        (a, b) =>
          new Date(a.scheduledTime!).getTime() -
          new Date(b.scheduledTime!).getTime(),
      )[0] ?? null;
  const nextScheduledLabel = nextScheduledCall?.scheduledTime
    ? format(nextScheduledCall.scheduledTime, "MMM d, yyyy 'at' h:mm a")
    : "No upcoming call scheduled";
  const recurringScheduleCount = activeSchedules.filter(
    (schedule) => schedule.type === "recurring",
  ).length;
  const oneTimeScheduleCount = activeSchedules.filter(
    (schedule) => schedule.type === "one-time",
  ).length;

  const selectedCallPrompt = callDetailsCall
    ? prompts.find((p) => p.id === callDetailsCall.promptId)
    : null;
  const callDetailsTimestamp =
    callDetailsCall?.startedAt ?? callDetailsCall?.createdAt ?? null;
  const callDetailsTimestampLabel = callDetailsTimestamp
    ? format(callDetailsTimestamp, "MMM d, yyyy 'at' h:mm a")
    : null;

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleCreatePrompt = async (name: string, promptTemplate: string) => {
    if (!selectedPatient) return false;

    try {
      await vapiRepository.createPrompt({
        patientId: selectedPatient.id,
        name,
        prompt: promptTemplate,
      });
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "prompts", selectedPatient.id],
      });
      toast({
        title: "Prompt Created",
        description: `Prompt "${name}" has been created for ${selectedPatient.firstName} ${selectedPatient.lastName}.`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Prompt Error",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create prompt right now.",
        variant: "destructive",
      });
      return false;
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
      setIsScheduleManagerOpen(false);
      setSelectedPrompt(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to schedule call",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedPatient) return;

    try {
      await vapiService.cancelSchedule(scheduleId);
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "schedules", selectedPatient.id],
      });
      toast({
        title: "Schedule Cancelled",
        description: "The scheduled call has been cancelled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel schedule",
        variant: "destructive",
      });
    }
  };

  const handleAddPresetPrompt = async (name: string, template: string) => {
    if (!selectedPatient) return;
    setPresetInFlight(name);
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    const success = await handleCreatePrompt(name, template);
    setPresetInFlight(null);
    if (!success) {
      return;
    }
    setRecentlyAddedPromptName(name);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setRecentlyAddedPromptName((current) =>
        current === name ? null : current,
      );
    }, 1200);
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

  const handleRenamePrompt = async (promptId: string, newName: string) => {
    if (!selectedPatient) return;

    try {
      await vapiRepository.updatePrompt(promptId, { name: newName });
      await queryClient.invalidateQueries({
        queryKey: ["vapi", "prompts", selectedPatient.id],
      });
      toast({
        title: "Prompt Renamed",
        description: `Prompt has been renamed to "${newName}".`,
      });
    } catch (error) {
      toast({
        title: "Unable to rename prompt",
        description:
          error instanceof Error
            ? error.message
            : "Please try renaming the prompt again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <img src={`${import.meta.env.BASE_URL}Calico%20Icon@4x.png`} alt="Cali Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Cali Assistant
              </h1>
              <p className="text-muted-foreground">
                Manage patient calls and voice prompts
              </p>
                </div>

                {selectedPatient && (
                  <Dialog
                    open={isScheduleManagerOpen}
                    onOpenChange={(open) => {
                      setIsScheduleManagerOpen(open);
                      if (!open) {
                        setSelectedPrompt(null);
                      }
                    }}
                  >
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Manage Scheduled Calls</DialogTitle>
                        <DialogDescription>
                          Set up automated outreach for {selectedPatient.firstName} {selectedPatient.lastName}.
                        </DialogDescription>
                      </DialogHeader>
                      {activeSchedules.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500">
                          No scheduled calls yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeSchedules.map((schedule) => (
                            <ScheduleCard
                              key={schedule.id}
                              schedule={schedule}
                              prompts={prompts}
                              onDelete={handleDeleteSchedule}
                            />
                          ))}
                        </div>
                      )}
                      <Separator className="my-4" />
                      {prompts.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-900">Schedule a new call</h4>
                          <ScheduleCallForm
                            prompts={prompts}
                            selectedPrompt={selectedPrompt}
                            onSubmit={handleScheduleCall}
                            existingSchedules={schedules}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Add a voice prompt before scheduling automated calls.
                        </p>
                      )}
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog
                  open={Boolean(callDetailsCall)}
                  onOpenChange={(open) => {
                    if (!open) {
                      setCallDetailsCall(null);
                    }
                  }}
                >
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {callDetailsCall && (
                      <>
                        <DialogHeader>
                          <DialogTitle>
                            {selectedCallPrompt?.name || "Call details"}
                          </DialogTitle>
                          <DialogDescription>
                            {callDetailsTimestampLabel
                              ? `Occurred ${callDetailsTimestampLabel}`
                              : "Call timestamp not available"}
                          </DialogDescription>
                        </DialogHeader>
                        <CallHistoryDetails
                          call={callDetailsCall}
                          prompts={prompts}
                        />
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? "lg:grid-cols-[320px_minmax(0,1fr)]" : "lg:grid-cols-[0px_minmax(0,1fr)]"} lg:gap-6`}>
          {/* Patient List Sidebar */}
          <div className={`lg:col-span-1 ${!isSidebarOpen ? "hidden lg:block overflow-hidden invisible" : ""}`}>
            <Card className="h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Patients</CardTitle>
                  <CardDescription>
                    Select a patient
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8">
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
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
          <div className="lg:col-span-1 min-w-0">
            {!isSidebarOpen && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="gap-2"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                  Show Patients
                </Button>
              </div>
            )}
            {selectedPatient ? (
              <div className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,1.5fr)] items-start">
                  <div className="space-y-5 xl:max-w-4xl">
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

                    <Collapsible
                      open={callHistoryOpen}
                      onOpenChange={setCallHistoryOpen}
                      className="xl:col-span-1"
                    >
                      <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                          <div>
                            <CardTitle>Call History</CardTitle>
                            <CardDescription>
                              Tap a call to view details and sync the latest report
                            </CardDescription>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 text-gray-600">
                              {callHistoryOpen ? "Hide" : "Show"}
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${callHistoryOpen ? "rotate-180" : ""}`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <CallHistoryTable
                              calls={callHistory}
                              prompts={prompts}
                              onSelectCall={(call) => {
                                setCallDetailsCall(call);
                                if (call.providerCallId) {
                                  handleRefreshCallReport(call.id);
                                }
                              }}
                            />
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </div>

                  <div className="space-y-5">
                    <Card>
                      <CardHeader className="pb-3">
                        <div>
                          <CardTitle className="text-lg">Voice Prompts</CardTitle>
                          <CardDescription>Manage automated call scripts</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5 text-sm">
                        {prompts.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                            <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500 font-medium">No prompts yet</p>
                            <p className="text-xs text-gray-400">Add a preset prompt below to begin</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            {prompts.map((prompt) => (
                              <PromptCard
                                key={prompt.id}
                                prompt={prompt}
                                onDelete={handleDeletePrompt}
                                onCallNow={() => handleCallNow(prompt.id)}
                                onSchedule={() => {
                                  setSelectedPrompt(prompt);
                                  setIsScheduleManagerOpen(true);
                                }}
                                onRename={handleRenamePrompt}
                                isLoading={callingPromptId === prompt.id}
                                isHighlighted={recentlyAddedPromptName === prompt.name}
                              />
                            ))}
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">Preset Prompts</h3>
                            <p className="text-xs text-gray-500">Quick-start templates</p>
                          </div>
                          {availablePresetTemplates.length === 0 ? (
                            <p className="text-xs text-gray-500">
                              All preset prompts have been added for this patient.
                            </p>
                          ) : (
                            <div className="mt-4 space-y-3">
                              {availablePresetTemplates.map((template) => (
                                <Card
                                  key={template.id}
                                  className={`hover:shadow-md transition-all duration-300 ${
                                    presetInFlight === template.name
                                      ? "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                                      : ""
                                  }`}
                                >
                                  <CardContent className="pt-4 pb-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="text-sm font-semibold text-gray-900">
                                            {template.name}
                                          </h4>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          {template.description}
                                        </p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2 text-xs"
                                        onClick={() =>
                                          handleAddPresetPrompt(
                                            template.name,
                                            template.template,
                                          )
                                        }
                                        disabled={presetInFlight === template.name}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Scheduled Calls</CardTitle>
                            <CardDescription>Quick overview</CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPrompt(null);
                              setIsScheduleManagerOpen(true);
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Active schedules</span>
                          <span className="font-semibold text-gray-900">
                            {activeSchedules.length}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Next call
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {nextScheduledLabel}
                          </p>
                        </div>
                        {activeSchedules.length > 0 ? (
                          <p className="text-xs text-gray-500">
                            {activeSchedules.filter((schedule) => schedule.type === "recurring").length} recurring ·{" "}
                            {activeSchedules.filter((schedule) => schedule.type === "one-time").length} one-time
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Create a schedule to automate patient touchpoints.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

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

// Prompt Card Component
const PromptCard = ({
  prompt,
  onDelete,
  onCallNow,
  onSchedule,
  onRename,
  isLoading = false,
  isHighlighted = false,
}: {
  prompt: VAPIPrompt;
  onDelete: (id: string) => void;
  onCallNow: () => void;
  onSchedule: () => void;
  onRename: (id: string, newName: string) => void;
  isLoading?: boolean;
  isHighlighted?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(prompt.name);

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== prompt.name) {
      onRename(prompt.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditedName(prompt.name);
      setIsEditing(false);
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-all duration-300 ${
        isHighlighted ? "ring-2 ring-blue-400 bg-blue-50/60 shadow-lg" : ""
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyDown}
                  className="h-8 text-lg font-semibold"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Click to rename"
                >
                  {prompt.name}
                </h3>
              )}
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
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              title="Rename prompt"
            >
              <Edit className="w-4 h-4" />
            </Button>
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
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>(
    selectedPrompt ? [selectedPrompt.id] : []
  );
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
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customHour, setCustomHour] = useState("09");
  const [customMinute, setCustomMinute] = useState("00");
  const [customAmPm, setCustomAmPm] = useState<"AM" | "PM">("AM");
  const [promptSelectorOpen, setPromptSelectorOpen] = useState(false);

  // Filter to only show active prompts
  const activePrompts = prompts.filter((p) => p.isActive);
  const timeBlocks = getTimeBlocks();

  // Get the selected prompts objects
  const selectedPrompts = activePrompts.filter((p) =>
    selectedPromptIds.includes(p.id)
  );

  // Toggle prompt selection
  const togglePromptSelection = (promptId: string) => {
    setSelectedPromptIds((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  // Check if a specific time is in the past for today
  const isTimeInPast = (hour: number, minute: number): boolean => {
    if (!selectedDate) return false;
    const now = new Date();
    if (!isSameDay(selectedDate, now)) return false;
    const selectedTime = new Date(selectedDate);
    selectedTime.setHours(hour, minute, 0, 0);
    return selectedTime <= now;
  };

  // Get the custom time as a Date object
  const getCustomTimeAsDate = (): Date | null => {
    if (!useCustomTime) return null;
    let hour = parseInt(customHour, 10);
    const minute = parseInt(customMinute, 10);
    if (customAmPm === "PM" && hour !== 12) hour += 12;
    if (customAmPm === "AM" && hour === 12) hour = 0;
    const timeDate = new Date();
    timeDate.setHours(hour, minute, 0, 0);
    return timeDate;
  };

  // Check if custom time is valid (not in the past for today)
  const isCustomTimeValid = (): boolean => {
    if (!useCustomTime) return true;
    let hour = parseInt(customHour, 10);
    const minute = parseInt(customMinute, 10);
    if (customAmPm === "PM" && hour !== 12) hour += 12;
    if (customAmPm === "AM" && hour === 12) hour = 0;
    return !isTimeInPast(hour, minute);
  };

  // Update selectedPromptIds when selectedPrompt changes
  useEffect(() => {
    if (selectedPrompt) {
      setSelectedPromptIds((prev) =>
        prev.includes(selectedPrompt.id) ? prev : [...prev, selectedPrompt.id]
      );
    }
  }, [selectedPrompt]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!selectedPrompt) {
      setSelectedPromptIds([]);
      setSelectedDate(undefined);
      setSelectedTimeBlock(null);
      setCallType("one-time");
      setRecurrenceType("daily");
      setRecurrenceEndDate(undefined);
      setSelectedDayOfWeek(undefined);
      setCalendarOpen(false);
      setUseCustomTime(false);
      setCustomHour("09");
      setCustomMinute("00");
      setCustomAmPm("AM");
      setPromptSelectorOpen(false);
    }
  }, [selectedPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let scheduledDateTime: Date | undefined;
    if (callType === "one-time") {
      if (selectedDate) {
        scheduledDateTime = new Date(selectedDate);
        if (useCustomTime) {
          let hour = parseInt(customHour, 10);
          const minute = parseInt(customMinute, 10);
          if (customAmPm === "PM" && hour !== 12) hour += 12;
          if (customAmPm === "AM" && hour === 12) hour = 0;
          scheduledDateTime.setHours(hour, minute, 0, 0);
        } else if (selectedTimeBlock) {
          scheduledDateTime.setHours(
            selectedTimeBlock.getHours(),
            selectedTimeBlock.getMinutes(),
            0,
            0
          );
          scheduledDateTime = roundTo30Minutes(scheduledDateTime);
        }
      }
    } else if (callType === "recurring") {
      // For recurring calls, store the time component in scheduledTime
      // We'll use today's date as a base, but only the time matters
      scheduledDateTime = new Date();
      if (useCustomTime) {
        let hour = parseInt(customHour, 10);
        const minute = parseInt(customMinute, 10);
        if (customAmPm === "PM" && hour !== 12) hour += 12;
        if (customAmPm === "AM" && hour === 12) hour = 0;
        scheduledDateTime.setHours(hour, minute, 0, 0);
      } else if (selectedTimeBlock) {
        scheduledDateTime.setHours(
          selectedTimeBlock.getHours(),
          selectedTimeBlock.getMinutes(),
          0,
          0
        );
        scheduledDateTime = roundTo30Minutes(scheduledDateTime);
      }
    }

    // Submit for each selected prompt
    selectedPromptIds.forEach((promptId) => {
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
    });
  };

  const formatTimeBlock = (block: Date): string => {
    return format(block, "h:mm a");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Prompts Display */}
      {selectedPrompts.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Prompts to Schedule</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
            {selectedPrompts.map((prompt) => (
              <Badge
                key={prompt.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20"
              >
                {prompt.name}
                <button
                  type="button"
                  onClick={() => togglePromptSelection(prompt.id)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="prompt">Select Prompts</Label>
        {activePrompts.length === 0 ? (
          <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
            No active prompts available. Please create or activate a prompt first.
          </div>
        ) : (
          <Popover open={promptSelectorOpen} onOpenChange={setPromptSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={promptSelectorOpen}
                className="w-full justify-between"
              >
                {selectedPromptIds.length === 0
                  ? "Select prompts..."
                  : `${selectedPromptIds.length} prompt${selectedPromptIds.length > 1 ? "s" : ""} selected`}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="max-h-64 overflow-y-auto">
                {activePrompts.map((prompt) => {
                  const isSelected = selectedPromptIds.includes(prompt.id);
                  return (
                    <div
                      key={prompt.id}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                      onClick={() => togglePromptSelection(prompt.id)}
                    >
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="flex-1">{prompt.name}</span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        Active
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="min-w-fit">Time Selection</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={!useCustomTime ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseCustomTime(false);
                      setSelectedTimeBlock(null);
                    }}
                  >
                    30-min blocks
                  </Button>
                  <Button
                    type="button"
                    variant={useCustomTime ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseCustomTime(true);
                      setSelectedTimeBlock(null);
                    }}
                  >
                    Custom time
                  </Button>
                </div>
              </div>

              {!useCustomTime ? (
                <div className="space-y-2">
                  <Label>Select Time (30-minute blocks)</Label>
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                    {timeBlocks.map((block, index) => {
                      const isOccupied = isTimeBlockOccupied(
                        selectedDate,
                        block,
                        existingSchedules
                      );
                      const isPast = isTimeInPast(block.getHours(), block.getMinutes());
                      const isSelected =
                        selectedTimeBlock?.getHours() === block.getHours() &&
                        selectedTimeBlock?.getMinutes() === block.getMinutes();
                      const isDisabled = isOccupied || isPast;

                      return (
                        <Button
                          key={index}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          disabled={isDisabled}
                          onClick={() => setSelectedTimeBlock(block)}
                          className={`h-10 text-sm ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed bg-gray-100"
                              : isSelected
                              ? "bg-primary text-primary-foreground"
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
                      isTimeBlockOccupied(selectedDate, block, existingSchedules) ||
                      isTimeInPast(block.getHours(), block.getMinutes())
                    ) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Grayed out time slots are already scheduled or in the past
                      </p>
                    )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Enter Specific Time</Label>
                  <div className="flex items-center gap-2">
                    <Select value={customHour} onValueChange={setCustomHour}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (i + 1).toString().padStart(2, "0");
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <span className="text-lg font-bold">:</span>
                    <Select value={customMinute} onValueChange={setCustomMinute}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i.toString().padStart(2, "0");
                          return (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Select value={customAmPm} onValueChange={(v) => setCustomAmPm(v as "AM" | "PM")}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!isCustomTimeValid() && (
                    <p className="text-xs text-destructive mt-2">
                      Cannot schedule a call in the past. Please select a future time.
                    </p>
                  )}
                </div>
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

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="min-w-fit">Time Selection</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={!useCustomTime ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseCustomTime(false);
                    setSelectedTimeBlock(null);
                  }}
                >
                  30-min blocks
                </Button>
                <Button
                  type="button"
                  variant={useCustomTime ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseCustomTime(true);
                    setSelectedTimeBlock(null);
                  }}
                >
                  Custom time
                </Button>
              </div>
            </div>

            {!useCustomTime ? (
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
                          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                        }`}
                      >
                        {formatTimeBlock(block)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Enter Specific Time</Label>
                <div className="flex items-center gap-2">
                  <Select value={customHour} onValueChange={setCustomHour}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = (i + 1).toString().padStart(2, "0");
                        return (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <span className="text-lg font-bold">:</span>
                  <Select value={customMinute} onValueChange={setCustomMinute}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => {
                        const minute = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Select value={customAmPm} onValueChange={(v) => setCustomAmPm(v as "AM" | "PM")}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
            selectedPromptIds.length === 0 ||
            (callType === "one-time" &&
              (!selectedDate || (!selectedTimeBlock && !useCustomTime) || (useCustomTime && !isCustomTimeValid()))) ||
            (callType === "recurring" &&
              ((recurrenceType === "weekly" &&
                selectedDayOfWeek === undefined) ||
                (!selectedTimeBlock && !useCustomTime)))
          }
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule {selectedPromptIds.length > 1 ? `${selectedPromptIds.length} Calls` : "Call"}
        </Button>
      </div>
    </form>
  );
};

// Schedule Card Component
const ScheduleCard = ({
  schedule,
  prompts,
  onDelete,
}: {
  schedule: VAPICallSchedule;
  prompts: VAPIPrompt[];
  onDelete: (scheduleId: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(schedule.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
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
          {schedule.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Call History Components
const CallHistoryTable = ({
  calls,
  prompts,
  onSelectCall,
}: {
  calls: VAPICall[];
  prompts: VAPIPrompt[];
  onSelectCall: (call: VAPICall) => void;
}) => {
  if (calls.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium mb-2">No call history</p>
        <p className="text-sm text-gray-400">
          Call history will appear here after calls are made
        </p>
      </div>
    );
  }

  const sortedCalls = [...calls].sort((a, b) => {
    const dateA = a.startedAt ?? a.createdAt;
    const dateB = b.startedAt ?? b.createdAt;
    return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
  });

  return (
    <div className="space-y-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Call</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCalls.map((call) => {
            const prompt = prompts.find((p) => p.id === call.promptId);
            const callDate = call.startedAt ?? call.createdAt;
            const callDateLabel = callDate
              ? format(callDate, "MMM d, yyyy 'at' h:mm a")
              : "—";
            const durationSeconds =
              call.duration ??
              calculateDurationSeconds(call.startedAt, call.completedAt);
            const durationLabel = durationSeconds
              ? formatDurationLabel(durationSeconds)
              : "—";

            return (
              <TableRow
                key={call.id}
                className="cursor-pointer transition hover:bg-gray-50"
                onClick={() => onSelectCall(call)}
              >
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {prompt?.name || "Unknown Prompt"}
                  </div>
                  <p className="text-xs text-gray-500">{callDateLabel}</p>
                </TableCell>
                <TableCell>{getCallStatusBadge(call)}</TableCell>
                <TableCell>{durationLabel}</TableCell>
                <TableCell className="text-right">
                  <span className="text-xs text-gray-500">
                    Tap for details
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const CallHistoryDetails = ({
  call,
  prompts,
}: {
  call: VAPICall;
  prompts: VAPIPrompt[];
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
    <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="text-sm text-gray-600 space-y-0.5">
          <p className="font-semibold text-gray-900">
            {prompt?.name || "Unknown Prompt"}
          </p>
          <p>Created: {createdLabel}</p>
          {startedLabel && <p>Started: {startedLabel}</p>}
          <p className={completedLabel ? undefined : "text-amber-600"}>
            Completed: {completedLabel ?? "Not recorded yet"}
            {completedLabel && durationLabel && ` • Duration: ${durationLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-2">{getCallStatusBadge(call)}</div>
      </div>

      {call.analysis?.summary && (
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-gray-900">Summary</p>
          <div className="mt-1 space-y-2 rounded-md border bg-white p-3 text-sm leading-relaxed text-gray-800">
            <ReactMarkdown>{call.analysis.summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {report && (
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
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
                    <span className="font-medium">{action.owner}</span>: {action.action} ({action.urgency})
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
    </div>
  );
};

export default VAPIPage;
