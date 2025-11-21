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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("authToken", "demo-token");
    navigate("/");
  };

  const feature = features[currentFeature];
  const FeatureIcon = feature.icon;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        {/* Base Gradient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-purple/30 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div 
          className="absolute top-[0%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/30 rounded-full blur-[120px] mix-blend-screen animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <div 
          className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-brand-red/30 rounded-full blur-[120px] mix-blend-screen animate-blob"
          style={{ animationDelay: "4s" }}
        />
        <div 
          className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-brand-yellow/20 rounded-full blur-[100px] mix-blend-screen animate-blob"
          style={{ animationDelay: "6s" }}
        />

        {/* SVG Waveform */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5C515" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#EF4857" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#8655A2" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6CB0E1" stopOpacity="0.3" />
            </linearGradient>
            <filter id="blur-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            </filter>
          </defs>
          
          {/* Main Wave Shape */}
          <path 
            d="M -100 300 C 200 100 400 600 800 400 C 1200 200 1500 500 1600 400 L 1600 1000 L -100 1000 Z" 
            fill="url(#wave-grad)" 
            filter="url(#blur-filter)"
            opacity="0.6"
            className="animate-pulse"
            style={{ animationDuration: "10s" }}
          />
          
          {/* Secondary Wave for depth */}
          <path 
            d="M -100 600 C 300 400 600 800 1000 600 C 1400 400 1600 700 1700 600 L 1700 1000 L -100 1000 Z" 
            fill="url(#wave-grad)" 
            filter="url(#blur-filter)"
            opacity="0.4"
            style={{ mixBlendMode: 'overlay' }}
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row gap-8 p-8 items-center">
        {/* Left Side - Login Form */}
        <div className="flex-1 w-full max-w-md">
          <Card className="w-full p-8 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/Calico.Care%20W%20Logo.png" alt="Calico Care Logo" className="h-20" />
              </div>
              <p className="text-gray-400">
                Sign in to access your AI-powered elder care management platform
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 text-base bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-brand-blue/50 focus:ring-brand-blue/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-base pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-brand-blue/50 focus:ring-brand-blue/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-brand-red hover:bg-brand-red/90 text-white border-0"
                size="lg"
              >
                Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-brand-blue transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side - Feature Showcase */}
        <div className="flex-1 w-full max-w-lg hidden md:block">
          <div 
            key={currentFeature}
            className="animate-fade-in"
          >
            <Card className="p-8 bg-black/20 backdrop-blur-md border-white/5 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <FeatureIcon className="w-8 h-8 text-brand-blue" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
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
                          ? 'bg-brand-blue w-8' 
                          : 'bg-white/20'
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
  );
};

export default Login;
