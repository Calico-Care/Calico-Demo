import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Plus,
  X,
  Activity,
  Heart,
  Weight,
  Clock,
  Brain,
  User,
  Sparkles,
  ChevronRight,
  PlayCircle,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  MessageCircle,
  Target,
  Calendar,
  Zap,
  BarChart3
} from "lucide-react";
import CarePlanTimeline from "./CarePlanTimeline";
import CardConfigModal from "./CardConfigModal";

// Mock data for seniors
const mockSeniors = [
  { id: 1, name: "Accardi, Ken", dob: "11/11/1999", status: "Active", avatar: "👨‍💼", activeCards: 6, completionRate: 92, condition: "COPD Management" },
  { id: 2, name: "Johnson, Mary", dob: "03/15/1945", status: "Active", avatar: "👩‍🦳", activeCards: 4, completionRate: 88, condition: "Hypertension" },
  { id: 3, name: "Smith, Robert", dob: "07/22/1938", status: "Inactive", avatar: "👨‍🦲", activeCards: 2, completionRate: 45, condition: "Diabetes" },
  { id: 4, name: "Williams, Patricia", dob: "12/05/1942", status: "Active", avatar: "👵", activeCards: 5, completionRate: 95, condition: "Cardiac Recovery" },
];

// Simplified card library with better categorization
const cardLibrary = {
  "Daily Monitoring": [
    { id: "bp", name: "Blood Pressure Check", icon: Heart, color: "bg-red-500", category: "monitoring", description: "Daily blood pressure readings with trend tracking", difficulty: "Easy", duration: "2 min" },
    { id: "weight", name: "Weight Tracking", icon: Weight, color: "bg-blue-500", category: "monitoring", description: "Monitor weight changes and patterns", difficulty: "Easy", duration: "1 min" },
    { id: "mood", name: "Mood Assessment", icon: Brain, color: "bg-purple-500", category: "monitoring", description: "Track emotional wellbeing daily", difficulty: "Easy", duration: "3 min" },
    { id: "symptoms", name: "Symptom Check", icon: MessageCircle, color: "bg-red-500", category: "monitoring", description: "Report any concerning symptoms", difficulty: "Easy", duration: "5 min" },
  ],
  "Physical Activity": [
    { id: "walking", name: "Daily Walk", icon: Activity, color: "bg-green-500", category: "activity", description: "Gentle walking exercise routine", difficulty: "Easy", duration: "15 min" },
    { id: "chair-exercise", name: "Chair Exercises", icon: Activity, color: "bg-teal-500", category: "activity", description: "Seated strength and flexibility", difficulty: "Easy", duration: "10 min" },
    { id: "stretching", name: "Morning Stretches", icon: Activity, color: "bg-cyan-500", category: "activity", description: "Gentle stretching routine", difficulty: "Easy", duration: "8 min" },
    { id: "balance", name: "Balance Training", icon: Target, color: "bg-indigo-500", category: "activity", description: "Improve stability and prevent falls", difficulty: "Medium", duration: "12 min" },
  ],
  "Medication & Care": [
    { id: "medication", name: "Medication Reminder", icon: Clock, color: "bg-amber-500", category: "care", description: "Track medication adherence", difficulty: "Easy", duration: "2 min" },
    { id: "inhaler", name: "Inhaler Technique", icon: Zap, color: "bg-pink-500", category: "care", description: "Proper inhaler usage guidance", difficulty: "Medium", duration: "5 min" },
    { id: "appointment", name: "Appointment Prep", icon: Calendar, color: "bg-violet-500", category: "care", description: "Prepare for upcoming appointments", difficulty: "Easy", duration: "10 min" },
  ]
};

const CarePlanEditor = () => {
  const [currentStep, setCurrentStep] = useState<"welcome" | "select-patient" | "build-plan" | "timeline">("welcome");
  const [selectedSenior, setSelectedSenior] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handlePatientSelect = (senior: any) => {
    setSelectedSenior(senior);
    setCurrentStep("build-plan");
  };

  const handleAddCard = (card: any) => {
    if (!selectedCards.find(c => c.id === card.id)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(c => c.id !== cardId));
  };

  const handleCardConfig = (card: any) => {
    setSelectedCard(card);
    setIsConfigModalOpen(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  if (currentStep === "timeline") {
    return <CarePlanTimeline selectedSenior={selectedSenior} onBack={() => setCurrentStep("build-plan")} />;
  }

  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Care Plan Studio</h1>
            <p className="text-xl text-gray-600 mb-8">Create personalized care plans that help seniors thrive</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select Patient</h3>
                <p className="text-gray-600 text-sm">Choose which senior you're creating a care plan for</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Build Plan</h3>
                <p className="text-gray-600 text-sm">Add activities, monitoring, and care tasks</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <CheckCircle2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Review & Deploy</h3>
                <p className="text-gray-600 text-sm">Preview and activate the care plan</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              onClick={() => setCurrentStep("select-patient")}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <p className="text-sm text-gray-500">
              Need help? <button className="text-blue-600 hover:underline">View the guide</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "select-patient") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setCurrentStep("welcome")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Patient</h1>
                <p className="text-gray-600">Choose which senior you're creating a care plan for</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Step 1 of 3</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {mockSeniors.map((senior) => (
              <Card 
                key={senior.id} 
                className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-105"
                onClick={() => handlePatientSelect(senior)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{senior.avatar}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{senior.name}</h3>
                        <p className="text-gray-600">DOB: {senior.dob}</p>
                        <p className="text-sm text-gray-500">{senior.condition}</p>
                      </div>
                    </div>
                    <Badge variant={senior.status === "Active" ? "default" : "secondary"}>
                      {senior.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{senior.activeCards}</div>
                      <div className="text-xs text-gray-500">Active Cards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{senior.completionRate}%</div>
                      <div className="text-xs text-gray-500">Completion</div>
                    </div>
                    <div className="text-center">
                      <ChevronRight className="w-6 h-6 text-gray-400 mx-auto group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Build Plan Step
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setCurrentStep("select-patient")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Patient
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Build Care Plan</h1>
              <p className="text-gray-600">Add activities and monitoring for {selectedSenior?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Step 2 of 3</span>
              <Button 
                variant="outline"
                onClick={() => setCurrentStep("timeline")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Preview Timeline
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Summary */}
        <Card className="bg-white shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{selectedSenior?.avatar}</div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedSenior?.name}</h3>
                  <p className="text-gray-600">{selectedSenior?.condition}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedCards.length}</div>
                  <div className="text-sm text-gray-500">Selected Cards</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selected Cards */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Selected Care Activities</span>
                  <Badge>{selectedCards.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedCards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities selected</h3>
                    <p className="text-gray-500 mb-4">Choose activities from the library to build the care plan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCards.map((card) => {
                      const IconComponent = card.icon;
                      return (
                        <div
                          key={card.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{card.name}</h4>
                              <p className="text-sm text-gray-500">{card.description}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {card.difficulty}
                                </span>
                                <span className="text-xs text-gray-500">{card.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCardConfig(card)}
                            >
                              Configure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCard(card.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Library */}
          <div>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Activity Library</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries(cardLibrary).map(([category, cards]) => (
                    <div key={category}>
                      <button
                        onClick={() => handleCategorySelect(category)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="font-medium text-gray-900">{category}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{cards.length}</Badge>
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform ${selectedCategory === category ? 'rotate-90' : ''}`}
                          />
                        </div>
                      </button>
                      
                      {selectedCategory === category && (
                        <div className="mt-2 space-y-2">
                          {cards.map((card) => {
                            const IconComponent = card.icon;
                            const isSelected = selectedCards.find(c => c.id === card.id);
                            return (
                              <div
                                key={card.id}
                                className={`p-3 border rounded-lg transition-all cursor-pointer ${
                                  isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleAddCard(card)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <IconComponent className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900">{card.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {card.duration}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CardConfigModal
        card={selectedCard}
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedCard(null);
        }}
      />
    </div>
  );
};

export default CarePlanEditor;