import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Settings, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Bot,
  Mic,
  Phone,
  Save,
  Play,
  Pause,
  X
} from "lucide-react";

const AskCaliPage = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const aiModules = [
    {
      id: "triage",
      icon: Settings,
      title: "Care Triage Designer",
      description: "Define who needs attention and what the care team sees",
      status: "Active",
      color: "bg-blue-500"
    },
    {
      id: "reminders", 
      icon: Bell,
      title: "Health Progress Reminders",
      description: "Send gentle voice/SMS nudges providing health & wellness progress updates",
      status: "Active",
      color: "bg-green-500"
    },
    {
      id: "companion",
      icon: (props: any) => <img src="/Calico%20Icon@4x.png" alt="Cali" {...props} />,
      title: "Cali Health Companion", 
      description: "Enable seniors to chat with Cali about health, wellness, and daily life",
      status: "Active",
      color: "bg-green-500"
    },
    {
      id: "reports",
      icon: BarChart3,
      title: "AI Health Reports",
      description: "Cali analyzes trends, check-ins, and notes to produce clear, shareable reports",
      status: "Active", 
      color: "bg-red-500"
    }
  ];

  const TriageDesignerModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Care Triage Designer
        </DialogTitle>
        <DialogDescription>
          Define who needs attention and what the care team sees
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-blue-500 text-white">Active</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Prompt Editor
            </CardTitle>
            <CardDescription>Edit the core AI prompt for triage decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="triage-prompt">Core Triage Prompt</Label>
              <Textarea 
                id="triage-prompt"
                className="min-h-[200px]"
                placeholder="Define the AI logic for identifying patients who need attention..."
                defaultValue="You are a healthcare AI assistant analyzing patient data to identify care priorities. Review patient information including vital signs, medication adherence, and recent check-ins. Flag patients who need immediate attention based on: 1. Critical vital sign changes 2. Missed medications 3. Reported symptoms indicating deterioration 4. Missed check-ins or concerning responses."
              />
            </div>
            
            <div>
              <Label htmlFor="score-calculation">Define how the Score is calculated</Label>
              <Textarea 
                id="score-calculation"
                placeholder="Explain scoring methodology..."
                defaultValue="Score patients on a 1-10 scale based on risk factors. Higher scores indicate higher priority for care team attention."
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="data-range">Use data for</Label>
                <Select defaultValue="last-day">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="last-day">Last day</SelectItem>
                    <SelectItem value="last-week">Last week</SelectItem>
                    <SelectItem value="last-month">Last month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="self-end">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );

  const HealthRemindersModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-green-600" />
          Health Progress Reminders
        </DialogTitle>
        <DialogDescription>
          Send gentle voice/SMS nudges providing health & wellness progress updates
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-green-500 text-white">Active</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Message Configuration
            </CardTitle>
            <CardDescription>Configure automated voice and SMS reminders for patients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="greeting-message">Greeting Message</Label>
              <Textarea 
                id="greeting-message"
                className="bg-blue-50 border-blue-200 text-blue-800 font-medium placeholder:text-blue-600/70 focus:bg-blue-50 focus:border-blue-300 focus:ring-blue-200"
                placeholder="Enter your custom greeting message..."
                defaultValue="Hi, this is Cali, your virtual companion. I just wanted to check in with you and see how you feel today!"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="reminder-prompt">Reminder Prompt Template</Label>
              <Textarea 
                id="reminder-prompt"
                className="min-h-[150px]"
                defaultValue="You are a healthcare AI assistant calling NAME, a AGE-year-old senior. CALL INSTRUCTIONS: - You are calling on behalf of their care team - Be warm, professional, and empathetic in your approach - Address the senior by their name (NAME) - Reference any concerns mentioned above - Ask about their current symptoms, medication adherence, and overall well-being - Provide appropriate health guidance based on their condition and the care assessment."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Reminder Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="delivery-method">Delivery Method</Label>
                <Select defaultValue="voice">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="voice">Voice Call</SelectItem>
                    <SelectItem value="sms">SMS Text</SelectItem>
                    <SelectItem value="both">Both Voice & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Test Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );

  const HealthCompanionModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Cali Health Companion
        </DialogTitle>
        <DialogDescription>
          Enable seniors to chat with Cali about health, wellness, and daily life
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-500 text-white">Active</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Companion AI Configuration
            </CardTitle>
            <CardDescription>Configure Cali's personality and conversation capabilities for patient interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companion-personality">Companion Personality Prompt</Label>
              <Textarea 
                id="companion-personality"
                className="min-h-[150px]"
                defaultValue="You are Cali, a warm and caring virtual health companion. You speak with seniors in a friendly, patient, and encouraging manner. You remember previous conversations and check on their progress. You can discuss health topics, provide medication reminders, offer wellness tips, and flag any concerning symptoms to the care team."
              />
            </div>
            
            <div>
              <Label htmlFor="conversation-triggers">Health Concern Triggers</Label>
              <Textarea 
                id="conversation-triggers"
                placeholder="Define what symptoms or responses should flag the care team..."
                defaultValue="Flag the care team if patient mentions: chest pain, difficulty breathing, severe dizziness, falls, confusion, severe pain (8+/10), medication side effects, or expresses feelings of depression or hopelessness."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="response-style">Response Style</Label>
                <Select defaultValue="conversational">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session-length">Max Session Length</Label>
                <Select defaultValue="15min">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="10min">10 minutes</SelectItem>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="30min">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Companion Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );

  const AIReportsModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-600" />
          AI Health Reports
        </DialogTitle>
        <DialogDescription>
          Cali analyzes trends, check-ins, and notes to produce clear, shareable reports
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-orange-500 text-white">Active</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Report Generation Settings
            </CardTitle>
            <CardDescription>Configure how Cali analyzes and reports on patient health data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-prompt">Analysis Prompt</Label>
              <Textarea 
                id="report-prompt"
                className="min-h-[150px]"
                defaultValue="Analyze patient health trends, medication adherence, vital signs, and conversation data. Generate clear, actionable reports highlighting: 1. Overall health trajectory 2. Areas of concern 3. Positive progress 4. Recommended interventions 5. Care team action items. Use clear, clinical language suitable for healthcare professionals."
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="report-frequency">Report Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data-sources">Data Sources</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="vitals">Vitals Only</SelectItem>
                    <SelectItem value="conversations">Conversations Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="report-format">Report Format</Label>
                <Select defaultValue="detailed">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md">
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="executive">Executive Brief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Report Settings
              </Button>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Sample Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/Calico%20Icon@4x.png" alt="Cali Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ask Cali</h1>
              <p className="text-muted-foreground">AI-Powered Healthcare Intelligence Platform</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Cali is your comprehensive AI healthcare assistant, designed to automate patient care, 
            analyze health trends, and provide intelligent insights for better outcomes.
          </p>
        </div>

        {/* AI Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {aiModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card 
                key={module.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                onClick={() => setActiveModal(module.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${module.color} bg-opacity-10`}>
                        <IconComponent className={`w-6 h-6 text-${module.color.split('-')[1]}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{module.status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{module.description}</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Configure & Manage
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">847</div>
              <div className="text-sm text-muted-foreground">Voice Interactions Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-muted-foreground">Health Alerts Flagged</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Reminders Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <div className="text-sm text-muted-foreground">Patient Engagement Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <Dialog open={activeModal === "triage"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <TriageDesignerModal />
        </Dialog>

        <Dialog open={activeModal === "reminders"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <HealthRemindersModal />
        </Dialog>

        <Dialog open={activeModal === "companion"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <HealthCompanionModal />
        </Dialog>

        <Dialog open={activeModal === "reports"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <AIReportsModal />
        </Dialog>
      </div>
    </div>
  );
};

export default AskCaliPage;