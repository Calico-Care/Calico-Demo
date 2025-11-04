import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { patientStore } from "@/store/mockData";
import type { PrimaryCondition } from "@/store/mockData";

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);
  
  // Format as (XXX)-XXX-XXXX
  if (limitedDigits.length === 0) return '';
  if (limitedDigits.length <= 3) return `(${limitedDigits}`;
  if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3)}`;
  return `(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
};

const steps = ["Basic Information", "Contact & Medical", "Review"];

interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  timeZone: string;
  primaryCondition: PrimaryCondition | "";
}

const EnrollmentContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    timeZone: "",
    primaryCondition: "",
  });
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create patient
      handleCompleteEnrollment();
    }
  };

  const handleCompleteEnrollment = () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.birthMonth || !formData.birthDay || !formData.birthYear || 
        !formData.primaryCondition) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create date of birth
    const dateOfBirth = new Date(
      parseInt(formData.birthYear),
      parseInt(formData.birthMonth) - 1,
      parseInt(formData.birthDay)
    );

    // Create patient in mock store
    const patient = patientStore.create({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      dateOfBirth,
      timeZone: formData.timeZone || undefined,
      primaryCondition: formData.primaryCondition as PrimaryCondition,
    });

    toast({
      title: "Patient Enrolled!",
      description: `${patient.firstName} ${patient.lastName} has been successfully enrolled in CalicoCare.`,
    });

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      timeZone: "",
      primaryCondition: "",
    });
    setCurrentStep(1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.firstName && formData.lastName && 
             formData.birthMonth && formData.birthDay && formData.birthYear;
    }
    if (currentStep === 2) {
      return formData.email && formData.primaryCondition;
    }
    return true;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-medium">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl text-foreground">Basic Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter the patient's name and date of birth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name *
                  </Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter first name"
                    className="h-12 text-base"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name *
                  </Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter last name"
                    className="h-12 text-base"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Birth Month *</Label>
                  <Select value={formData.birthMonth} onValueChange={(value) => setFormData({...formData, birthMonth: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Birth Day *</Label>
                  <Select value={formData.birthDay} onValueChange={(value) => setFormData({...formData, birthDay: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Birth Year *</Label>
                  <Select value={formData.birthYear} onValueChange={(value) => setFormData({...formData, birthYear: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 100 }, (_, i) => (
                        <SelectItem key={2024 - i} value={(2024 - i).toString()}>
                          {2024 - i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="shadow-medium">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl text-foreground">Contact & Medical Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter contact details and primary medical condition.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address *
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Enter email address"
                  className="h-12 text-base"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="h-12 text-base"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData({...formData, phone: formatted});
                  }}
                  maxLength={14} // (XXX)-XXX-XXXX = 14 characters
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Time Zone</Label>
                <Select value={formData.timeZone} onValueChange={(value) => setFormData({...formData, timeZone: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                    <SelectItem value="CST">Central Time (CST)</SelectItem>
                    <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                    <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Primary Condition *</Label>
                <Select value={formData.primaryCondition} onValueChange={(value) => setFormData({...formData, primaryCondition: value as PrimaryCondition})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select primary condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHF">CHF (Congestive Heart Failure)</SelectItem>
                    <SelectItem value="COPD">COPD (Chronic Obstructive Pulmonary Disease)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        const dateOfBirth = formData.birthMonth && formData.birthDay && formData.birthYear
          ? new Date(
              parseInt(formData.birthYear),
              parseInt(formData.birthMonth) - 1,
              parseInt(formData.birthDay)
            ).toLocaleDateString()
          : "Not provided";
        
        return (
          <div className="bg-gradient-primary rounded-xl p-8 text-primary-foreground">
            <h3 className="text-2xl font-semibold mb-6 text-center">Review Patient Information</h3>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-80">First Name</p>
                    <p className="font-semibold">{formData.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Last Name</p>
                    <p className="font-semibold">{formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Email</p>
                    <p className="font-semibold">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Phone</p>
                    <p className="font-semibold">{formData.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Date of Birth</p>
                    <p className="font-semibold">{dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Time Zone</p>
                    <p className="font-semibold">{formData.timeZone || "Not provided"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm opacity-80">Primary Condition</p>
                    <p className="font-semibold">{formData.primaryCondition}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <PersonalInfoForm data={formData} onChange={setFormData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Enroll New Patient
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add a new patient to the CalicoCare program. Enter their information below to enroll them in the monitoring system.
          </p>
        </div>

        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={steps.length} 
          steps={steps} 
        />

        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2 bg-gradient-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{currentStep === steps.length ? "Complete Enrollment" : "Next"}</span>
            {currentStep === steps.length ? (
              <Check className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentContainer;