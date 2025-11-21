import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  Layers3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Heart, 
  Weight, 
  Brain,
  Target,
  XCircle,
  CalendarDays,
  Filter,
  Download
} from "lucide-react";

interface CarePlanTimelineProps {
  selectedSenior: any;
  onBack: () => void;
}

// Mock timeline data based on care plan activities
const mockTimelineData = {
  weekSummary: {
    totalActivities: 42,
    completed: 34,
    missed: 5,
    upcoming: 3,
    completionRate: 81,
    streak: 5
  },
  healthTrends: [
    { metric: "Blood Pressure", current: "128/82", trend: "improving", change: "-5%", color: "text-green-600" },
    { metric: "Weight", current: "165 lbs", trend: "stable", change: "+0.2%", color: "text-blue-600" },
    { metric: "Mood Score", current: "8.2/10", trend: "improving", change: "+12%", color: "text-green-600" },
    { metric: "Activity Level", current: "6,420 steps", trend: "declining", change: "-8%", color: "text-destructive" }
  ],
  dailyTimeline: [
    {
      date: "Sep 24, 2024",
      dayOfWeek: "Today",
      status: "active",
      activities: [
        { id: 1, name: "Morning Blood Pressure", time: "8:00 AM", status: "completed", type: "monitoring", icon: Heart },
        { id: 2, name: "Medication Reminder", time: "8:30 AM", status: "completed", type: "care", icon: Clock },
        { id: 3, name: "Daily Walk", time: "10:00 AM", status: "upcoming", type: "activity", icon: Activity },
        { id: 4, name: "Mood Check-in", time: "2:00 PM", status: "upcoming", type: "monitoring", icon: Brain },
        { id: 5, name: "Evening Weight", time: "6:00 PM", status: "upcoming", type: "monitoring", icon: Weight }
      ]
    },
    {
      date: "Sep 23, 2024",
      dayOfWeek: "Yesterday", 
      status: "completed",
      activities: [
        { id: 1, name: "Morning Blood Pressure", time: "8:15 AM", status: "completed", type: "monitoring", icon: Heart },
        { id: 2, name: "Medication Reminder", time: "8:30 AM", status: "completed", type: "care", icon: Clock },
        { id: 3, name: "Daily Walk", time: "10:30 AM", status: "completed", type: "activity", icon: Activity },
        { id: 4, name: "Mood Check-in", time: "2:15 PM", status: "completed", type: "monitoring", icon: Brain },
        { id: 5, name: "Evening Weight", time: "6:00 PM", status: "missed", type: "monitoring", icon: Weight }
      ]
    },
    {
      date: "Sep 22, 2024",
      dayOfWeek: "Sunday",
      status: "completed", 
      activities: [
        { id: 1, name: "Morning Blood Pressure", time: "9:00 AM", status: "completed", type: "monitoring", icon: Heart },
        { id: 2, name: "Medication Reminder", time: "9:30 AM", status: "completed", type: "care", icon: Clock },
        { id: 3, name: "Chair Exercises", time: "11:00 AM", status: "completed", type: "activity", icon: Activity },
        { id: 4, name: "Mood Check-in", time: "3:00 PM", status: "completed", type: "monitoring", icon: Brain },
        { id: 5, name: "Evening Weight", time: "6:30 PM", status: "completed", type: "monitoring", icon: Weight }
      ]
    }
  ],
  alerts: [
    { id: 1, type: "missed_activity", message: "Weight tracking missed 2 days in a row", severity: "medium", time: "2 hours ago" },
    { id: 2, type: "health_trend", message: "Blood pressure showing positive trend", severity: "positive", time: "Yesterday" }
  ]
};

const CarePlanTimeline = ({ selectedSenior, onBack }: CarePlanTimelineProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50";
      case "missed": return "text-red-600 bg-red-50";
      case "upcoming": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "missed": return <XCircle className="w-4 h-4" />;
      case "upcoming": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Care Plan Timeline</h1>
              <p className="text-gray-600">Track activities, progress, and health outcomes for {selectedSenior?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Patient Summary Card */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedSenior?.avatar}</div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedSenior?.name}</h3>
                  <p className="text-gray-600">{selectedSenior?.condition} • DOB: {selectedSenior?.dob}</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockTimelineData.weekSummary.completionRate}%</div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockTimelineData.weekSummary.streak}</div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{mockTimelineData.weekSummary.missed}</div>
                  <div className="text-sm text-gray-500">Missed This Week</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Trends Overview */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Health Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {mockTimelineData.healthTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{trend.metric}</h4>
                        <p className="text-lg font-semibold">{trend.current}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(trend.trend)}
                        <span className={`text-sm font-medium ${trend.color}`}>
                          {trend.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Timeline */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>Daily Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockTimelineData.dailyTimeline.map((day, dayIndex) => (
                  <div key={dayIndex} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{day.dayOfWeek}</h3>
                        <span className="text-sm text-gray-500">{day.date}</span>
                      </div>
                      <Badge variant={day.status === "completed" ? "default" : "secondary"}>
                        {day.activities.filter(a => a.status === "completed").length}/{day.activities.length} completed
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {day.activities.map((activity) => {
                        const IconComponent = activity.icon;
                        return (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{activity.name}</h4>
                                <p className="text-sm text-gray-500">{activity.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                {getStatusIcon(activity.status)}
                                <span className="capitalize">{activity.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts & Insights */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alerts & Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTimelineData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === "positive" 
                        ? "bg-green-50 border-green-400" 
                        : alert.severity === "medium"
                        ? "bg-accent/10 border-accent"
                        : "bg-red-50 border-red-400"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>This Week Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Activities</span>
                    <span className="font-semibold">{mockTimelineData.weekSummary.totalActivities}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <Badge className="bg-green-100 text-green-700">{mockTimelineData.weekSummary.completed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Missed</span>
                    <Badge variant="destructive">{mockTimelineData.weekSummary.missed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Upcoming</span>
                    <Badge variant="secondary">{mockTimelineData.weekSummary.upcoming}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {mockTimelineData.weekSummary.completionRate}%
                    </div>
                    <p className="text-sm text-gray-600">Overall completion rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Adjust Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Concern
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlanTimeline;