import { useState } from "react";
import { Search, Video, Phone, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  name: string;
  avatar?: string;
  deviceStatus: "online" | "offline" | "dnd";
}

interface CallHistory {
  id: string;
  caller: string;
  date: string;
  time: string;
  duration: string;
  type: "video" | "audio";
  status: "completed" | "missed" | "ongoing";
}

const mockPatients: Patient[] = [
  { id: "1", name: "James Bond", deviceStatus: "online" },
  { id: "2", name: "Alex Johnson", deviceStatus: "offline" },
  { id: "3", name: "Kelly Joe", deviceStatus: "online" },
  { id: "4", name: "Jane Doe", deviceStatus: "dnd" },
  { id: "5", name: "testuser testuser", deviceStatus: "online" },
];

const mockCallHistory: Record<string, CallHistory[]> = {
  "1": [
    {
      id: "1",
      caller: "David, Lebudzinski MD",
      date: "Sep 19, 2025",
      time: "10:13:22 AM",
      duration: "8 s",
      type: "video",
      status: "completed"
    },
    {
      id: "2",
      caller: "Sarah Wilson RN",
      date: "Sep 18, 2025",
      time: "2:45:15 PM",
      duration: "12 m 34 s",
      type: "video",
      status: "completed"
    },
    {
      id: "3",
      caller: "Dr. Smith",
      date: "Sep 17, 2025",
      time: "9:20:10 AM",
      duration: "5 m 22 s",
      type: "video",
      status: "completed"
    }
  ],
  "2": [
    {
      id: "4",
      caller: "Nurse Johnson",
      date: "Sep 19, 2025",
      time: "11:30:45 AM",
      duration: "0 s",
      type: "video",
      status: "missed"
    }
  ],
  "3": [
    {
      id: "5",
      caller: "Dr. Williams",
      date: "Sep 19, 2025",
      time: "1:22:18 PM",
      duration: "15 m 8 s",
      type: "video",
      status: "completed"
    }
  ]
};

const AlexaPage = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(mockPatients[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-gray-400";
      case "dnd": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online": return "Online";
      case "offline": return "Offline";
      case "dnd": return "Do Not Disturb";
      default: return "Unknown";
    }
  };

  const handleVideoCall = () => {
    if (selectedPatient) {
      // Simulate starting a video call
      console.log(`Starting video call with ${selectedPatient.name}`);
      // In a real app, this would integrate with Alexa communication APIs
    }
  };

  const selectedHistory = selectedPatient ? mockCallHistory[selectedPatient.id] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Patient List Panel */}
            <div className="w-80 bg-gray-50 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[520px]">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
                      selectedPatient?.id === patient.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={patient.avatar} />
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(patient.deviceStatus)}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">{getStatusText(patient.deviceStatus)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Communication Panel */}
            <div className="flex-1 flex flex-col">
              {selectedPatient ? (
                <>
                  {/* Communication Controls */}
                  <div className="p-6 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedPatient.avatar} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                            {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
                          <div className="flex items-center space-x-2">
                            <Circle className={`w-2 h-2 ${getStatusColor(selectedPatient.deviceStatus)}`} fill="currentColor" />
                            <span className="text-sm text-gray-500">{getStatusText(selectedPatient.deviceStatus)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleVideoCall}
                          disabled={selectedPatient.deviceStatus === "offline"}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 flex items-center space-x-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Video Call</span>
                        </Button>
                        <Button
                          variant="outline"
                          disabled
                          className="px-6 py-2 flex items-center space-x-2 text-gray-400"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Drop-In</span>
                          <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* History Section */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>
                    
                    {selectedHistory.length > 0 ? (
                      <div className="space-y-4">
                        {selectedHistory.map((call) => (
                          <div key={call.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                                    {call.caller.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{call.caller}</p>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>{call.type === "video" ? "📹" : "📞"}</span>
                                    <span className={call.status === "ongoing" ? "text-green-600" : call.status === "missed" ? "text-red-600" : ""}>
                                      {call.status === "ongoing" ? "Ongoing Call" : call.status === "missed" ? "Missed Call" : `Outgoing Call, ${call.duration}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <p>{call.date}</p>
                                <p>{call.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No communication history with this patient yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Start your first video call to begin logging interactions.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a patient to start communicating</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlexaPage;