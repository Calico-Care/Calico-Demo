import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PrimaryCondition } from "@/store/mockData";

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

interface PersonalInfoFormProps {
  data?: PersonalInfoFormData;
  onChange?: (data: PersonalInfoFormData) => void;
}

const PersonalInfoForm = ({ data, onChange }: PersonalInfoFormProps) => {
  const [formData, setFormData] = useState<PersonalInfoFormData>(data || {
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

  const updateField = (field: keyof PersonalInfoFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl text-foreground">Patient Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Please provide the patient's basic information to enroll them in CalicoCare.
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
              onChange={(e) => updateField("firstName", e.target.value)}
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
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>
        </div>

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
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Birth Month *</Label>
            <Select value={formData.birthMonth} onValueChange={(value) => updateField("birthMonth", value)}>
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
            <Select value={formData.birthDay} onValueChange={(value) => updateField("birthDay", value)}>
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
            <Select value={formData.birthYear} onValueChange={(value) => updateField("birthYear", value)}>
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
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Time Zone</Label>
          <Select value={formData.timeZone} onValueChange={(value) => updateField("timeZone", value)}>
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
          <Select value={formData.primaryCondition} onValueChange={(value) => updateField("primaryCondition", value as PrimaryCondition)}>
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
};

export default PersonalInfoForm;