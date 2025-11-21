import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Droplets, 
  Scale, 
  Clock, 
  Timer, 
  Activity,
  Thermometer,
  Zap,
  Target,
  Stethoscope,
  Plus
} from "lucide-react";

interface CardConfigModalProps {
  card: any;
  isOpen: boolean;
  onClose: () => void;
}

const iconOptions = [
  { icon: Heart, name: "Heart" },
  { icon: Droplets, name: "Droplets" },
  { icon: Scale, name: "Scale" },
  { icon: Clock, name: "Clock" },
  { icon: Timer, name: "Timer" },
  { icon: Activity, name: "Activity" },
  { icon: Thermometer, name: "Thermometer" },
  { icon: Zap, name: "Zap" },
  { icon: Target, name: "Target" },
  { icon: Stethoscope, name: "Stethoscope" },
];

const CardConfigModal = ({ card, isOpen, onClose }: CardConfigModalProps) => {
  const [cardName, setCardName] = useState(card?.name || "");
  const [activateAlert, setActivateAlert] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(false);
  const [multipleResponses, setMultipleResponses] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [activityRequest, setActivityRequest] = useState("");
  const [logPrompt, setLogPrompt] = useState("");
  const [frequency, setFrequency] = useState("frequency");
  const [startDate, setStartDate] = useState("4/11/2029");
  const [endDate, setEndDate] = useState("4/11/2030");
  const [interval, setInterval] = useState("1");

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="bg-primary text-primary-foreground p-4">
          <DialogTitle className="flex items-center justify-between">
            <span>{card.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/20">
              Close
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Alert and Display Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="activate-alert" 
                checked={activateAlert}
                onCheckedChange={(checked) => setActivateAlert(checked === true)}
              />
              <Label htmlFor="activate-alert">Activate alert for this card.</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="display-progress" 
                checked={displayProgress}
                onCheckedChange={(checked) => setDisplayProgress(checked === true)}
              />
              <Label htmlFor="display-progress">Display logged progress in senior app?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="multiple-responses" 
                checked={multipleResponses}
                onCheckedChange={(checked) => setMultipleResponses(checked === true)}
              />
              <Label htmlFor="multiple-responses">
                Allow the senior to log multiple responses/values per day for this card?
              </Label>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Select icon for senior mobile app</Label>
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50">
              {iconOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedIcon(index)}
                    className={`p-3 rounded-md transition-colors ${
                      selectedIcon === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
              </Button>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3 border border-red-300 bg-red-50 text-red-700 rounded-md">
            Logged data for this card will only be displayed in the table view.
          </div>

          {/* Activity Request */}
          <div className="space-y-2">
            <Label htmlFor="activity-request">Activity Request:</Label>
            <Textarea
              id="activity-request"
              value={activityRequest}
              onChange={(e) => setActivityRequest(e.target.value)}
              placeholder="Please perform the Mountain Climber exercise three times for 20 seconds each"
              rows={3}
            />
          </div>

          {/* Content Selection */}
          <div className="flex space-x-2">
            <Button variant="outline">Add URL</Button>
            <Button variant="outline">Add Content from Resources</Button>
          </div>

          <div className="space-y-2">
            <Label>Select Content</Label>
            <div className="flex items-center space-x-2">
              <Select defaultValue="mountain-climber">
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="mountain-climber">Mountain Climber</SelectItem>
                  <SelectItem value="push-ups">Push Ups</SelectItem>
                  <SelectItem value="squats">Squats</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm">×</Button>
            </div>
          </div>

          {/* Log Progress Prompt */}
          <div className="space-y-2">
            <Label htmlFor="log-prompt">Log Progress Prompt:</Label>
            <div className="flex items-center space-x-2">
              <Textarea
                id="log-prompt"
                value={logPrompt}
                onChange={(e) => setLogPrompt(e.target.value)}
                placeholder="Have you done Mountain Climbers?"
                rows={2}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Frequency and Scheduling */}
          <Tabs defaultValue="frequency" className="w-full">
            <TabsList>
              <TabsTrigger value="frequency">Frequency</TabsTrigger>
              <TabsTrigger value="weekdays">Weekdays</TabsTrigger>
            </TabsList>
            
            <TabsContent value="frequency" className="space-y-4">
              <div className="grid grid-cols-5 gap-2 items-center">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm"
                />
                <span className="text-center text-sm">To</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm"
                />
                <span className="text-center text-sm">every</span>
                <div className="flex items-center space-x-1">
                  <Input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-16 text-sm text-center"
                  />
                  <span className="text-sm text-muted-foreground">day(s)</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weekdays" className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Button key={day} variant="outline" size="sm" className="text-xs">
                    {day}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-lg">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardConfigModal;