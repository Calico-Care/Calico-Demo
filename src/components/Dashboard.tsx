import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/MetricCard";
import SeniorsTable from "@/components/SeniorsTable";
import { 
  AlertTriangle, 
  Database, 
  Heart, 
  Calendar, 
  Users, 
  Activity,
  TrendingUp,
  Brain,
  X,
} from "lucide-react";
import { patientStore } from "@/store/mockData";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);


  const handleMetricClick = (metricTitle: string) => {
    setSelectedMetric(metricTitle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMetric(null);
  };

  const getModalTitle = (metricTitle: string) => {
    switch (metricTitle) {
      case "Alerts":
        return "Critical Alerts - Seniors Requiring Immediate Attention";
      case "Missing Data":
        return "Missing Data - Seniors with Incomplete Information";
      case "Care Requests":
        return "Active Care Requests - Pending Senior Requests";
      case "Expiring Care Plans":
        return "Expiring Care Plans - Plans Requiring Renewal";
      case "Enrolled Seniors":
        return "All Enrolled Seniors - Complete Registry";
      case "Open Alerts":
        return "Open Alerts - Ongoing Investigations";
      case "Weight Trends":
        return "Weight Trends - Nutritional Health Analysis";
      case "Caregiver Triage Trend":
        return "Caregiver Triage - Cases Requiring Assessment";
      case "AI Companion Trend":
        return "AI Companion Interactions - Engagement Analytics";
      default:
        return "Senior Management Details";
    }
  };

  const metricsData = [
    {
      title: "Alerts",
      value: 1,
      icon: AlertTriangle,
      color: "green" as const,
      trend: { current: 0, target: 5 },
      tooltip: "Critical alerts requiring immediate attention. Low numbers indicate good system health."
    },
    {
      title: "Missing Data",
      value: 58,
      icon: Database,
      color: "yellow" as const,
      trend: { current: 4, target: 40 },
      tooltip: "Seniors with incomplete or outdated health data. Regular data collection ensures better care."
    },
    {
      title: "Care Requests", 
      value: 0,
      icon: Heart,
      color: "blue" as const,
      tooltip: "Active care requests from seniors or family members. Zero indicates no pending requests."
    },
    {
      title: "Expiring Care Plans",
      value: 0,
      icon: Calendar,
      color: "green" as const,
      trend: { current: 0, target: 5 },
      tooltip: "Care plans that need renewal soon. Proactive management prevents service gaps."
    },
    {
      title: "Enrolled Seniors",
      value: patientStore.getAll().length,
      icon: Users,
      color: "yellow" as const,
      trend: { current: 5, target: 10 },
      tooltip: "Total number of seniors actively enrolled in the care program."
    },
    {
      title: "Open Alerts",
      value: 10,
      icon: AlertTriangle,
      color: "yellow" as const,
      trend: { current: 3, target: 8 },
      tooltip: "Alerts that are still being investigated or resolved. Track progress on ongoing issues."
    },
    {
      title: "Caregiver Triage Trend",
      value: 3,
      icon: TrendingUp,
      color: "yellow" as const,
      trend: { current: 0, target: 10 },
      tooltip: "Number of cases requiring caregiver triage in the past 7 days."
    },
    {
      title: "AI Companion Trend",
      value: 0,
      icon: Brain,
      color: "yellow" as const,
      trend: { current: 0, target: 10 },
      tooltip: "AI companion interactions and engagement levels. Higher engagement indicates better senior satisfaction."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Skeleton for metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              </Card>
            ))}
          </div>
          
          {/* Skeleton for table */}
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Program Metrics</h2>
          <p className="text-muted-foreground">Track overall program performance and alerts</p>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {metricsData.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              trend={metric.trend}
              tooltip={metric.tooltip}
              onClick={() => handleMetricClick(metric.title)}
            />
          ))}
        </div>

        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-xl font-semibold">
                {selectedMetric ? getModalTitle(selectedMetric) : "Senior Details"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedMetric && `Detailed view for ${selectedMetric.toLowerCase()} with filtering and management options`}
              </p>
            </DialogHeader>
            <div className="flex-1 overflow-auto px-6 pb-6">
              <SeniorsTable />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;