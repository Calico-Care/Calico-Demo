import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import EnrollmentContainer from "@/components/EnrollmentContainer";
import Dashboard from "@/components/Dashboard";
import CarePlansPage from "@/components/CarePlansPage";
import VAPIPage from "@/components/VAPIPage";
import SettingsPage from "@/components/SettingsPage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<"home" | "enroll" | "careplans" | "vapi" | "settings">("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated (simulate checking local storage or token)
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Logging in...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
      />
      {currentPage === "home" ? <Dashboard /> : 
       currentPage === "enroll" ? <EnrollmentContainer /> : 
       currentPage === "vapi" ? <VAPIPage /> :
       currentPage === "settings" ? <SettingsPage /> :
       <CarePlansPage />}
    </div>
  );
};

export default Index;
