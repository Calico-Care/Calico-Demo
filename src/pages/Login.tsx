import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Brain, Phone, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Patient Triage",
    description: "Advanced machine learning algorithms instantly prioritize patient needs, ensuring critical cases receive immediate attention while optimizing care workflows."
  },
  {
    icon: Phone,
    title: "Agentic AI Phone Calls", 
    description: "Automated intelligent phone systems that conduct natural conversations with patients, handle appointment scheduling, and provide 24/7 support."
  },
  {
    icon: Shield,
    title: "Predictive Health Monitoring",
    description: "Real-time analysis of patient vitals and behavior patterns to predict health events before they occur, enabling proactive interventions."
  },
  {
    icon: BarChart3,
    title: "Intelligent Care Analytics",
    description: "Comprehensive insights into care quality metrics, patient outcomes, and operational efficiency powered by advanced data analytics."
  }
];

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Static login for now - will connect to backend later
    if (email && password) {
      localStorage.setItem("authToken", "demo-token");
      navigate("/");
    }
  };

  const feature = features[currentFeature];
  const FeatureIcon = feature.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary/20 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-large">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to <span className="text-primary">CalicoCare</span>
              </h1>
              <p className="text-muted-foreground">
                Sign in to access your AI-powered elder care management platform
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-base pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side - Feature Showcase */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div 
              key={currentFeature}
              className="animate-fade-in"
            >
              <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-large border-primary/20">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FeatureIcon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex justify-center space-x-2">
                    {features.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentFeature 
                            ? 'bg-primary w-8' 
                            : 'bg-primary/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;