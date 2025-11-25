import { Settings, User, Home, UserPlus, Calendar, Mic, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentPage: "home" | "enroll" | "careplans" | "vapi" | "settings";
  onPageChange: (page: "home" | "enroll" | "careplans" | "vapi" | "settings") => void;
  onLogout: () => void;
}

const Header = ({ currentPage, onPageChange, onLogout }: HeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <img src={`${import.meta.env.BASE_URL}Calico.Care%20B%20Logo.png`} alt="Calico Care Logo" className="h-10" />
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex items-center space-x-6">
              <Button 
                variant={currentPage === "home" ? "default" : "ghost"} 
                className={`flex items-center space-x-2 ${currentPage === "home" ? "" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onPageChange("home")}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Button>
              <Button 
                variant="ghost"
                className={`flex items-center space-x-2 ${currentPage === "enroll" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onPageChange("enroll")}
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll Patients</span>
              </Button>
              <Button 
                variant="ghost"
                className={`flex items-center space-x-2 ${currentPage === "careplans" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onPageChange("careplans")}
              >
                <Calendar className="w-4 h-4" />
                <span>Care Plans</span>
              </Button>
              <Button 
                variant="ghost"
                className={`flex items-center ${currentPage === "vapi" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onPageChange("vapi")}
              >
                <img src={`${import.meta.env.BASE_URL}Calico%20Icon@4x.png`} alt="Cali Logo" className="w-8 h-8 -mr-1" />
                <span>Cali Assistant</span>
              </Button>
              <Button 
                variant="ghost"
                className={`flex items-center space-x-2 ${currentPage === "settings" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onPageChange("settings")}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
            </nav>

            {/* Account Menu */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;