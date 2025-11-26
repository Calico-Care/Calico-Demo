import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Bell, 
  Eye, 
  Clock,
  UserPlus,
  Send,
  Mic,
  Save,
  Upload,
  Trash2,
  Edit,
  Settings
} from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("user-settings");

  const UserSettings = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Manage your account details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="text-lg">DL</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label>Chat Avatar</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Avatar
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="David" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Lebudzinski MD" />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="email" className="pl-10" defaultValue="melalimbean@yahoo.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="primaryPhone" className="pl-10" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternativePhone">Alternative Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input id="alternativePhone" className="pl-10" placeholder="+1 (555) 987-6543" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications & Alerts
          </CardTitle>
          <CardDescription>
            Configure how you receive critical notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Receive Alarm Notifications via Email</Label>
              <p className="text-sm text-muted-foreground">Get notified of patient alerts through email</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Receive Alarm Notifications via SMS</Label>
              <p className="text-sm text-muted-foreground">Get notified of patient alerts through text messages</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delayMinutes">Minutes to Delay Alarm to Alternate Contact</Label>
            <Input 
              id="delayMinutes" 
              type="number" 
              defaultValue="0" 
              className="w-24"
            />
            <p className="text-sm text-muted-foreground">
              Number of minutes before forwarding alarm to alternate contact
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Aggregate Alert Emails For The Day</Label>
              <p className="text-sm text-muted-foreground">Receive a single summary email instead of individual alerts</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Platform & Interface Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform & Interface Preferences
          </CardTitle>
          <CardDescription>
            Customize your dashboard experience and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language and Country Settings</Label>
              <Select defaultValue="en-US">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timelineType">Timeline Visualization Type</Label>
              <Select defaultValue="timeline">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="clock">Clock Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Show Relative Days</Label>
                <p className="text-sm text-muted-foreground">Display dates as "Today", "Yesterday", etc.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Disable TeleChat</Label>
                <p className="text-sm text-muted-foreground">Turn off the TeleChat messaging feature</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and login preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-logout after 20 minutes of inactivity</Label>
              <p className="text-sm text-muted-foreground">Automatically log out for security</p>
            </div>
            <Switch />
          </div>

          <Button className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            Update Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  );

  const CareTeamManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Manage Care Team</h3>
          <p className="text-muted-foreground">Add, view, and manage team members and their roles</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Team Members</CardTitle>
          <CardDescription>Manage roles and permissions for your care team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Team member rows */}
            {[
              { name: "Dr. Sarah Johnson", role: "Primary Physician", email: "s.johnson@clinic.com", status: "Active" },
              { name: "Mike Chen", role: "Care Coordinator", email: "m.chen@clinic.com", status: "Active" },
              { name: "Lisa Rodriguez", role: "Nurse Practitioner", email: "l.rodriguez@clinic.com", status: "Pending" }
            ].map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                    {member.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{member.role}</span>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InvitationManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Manage Invitations</h3>
          <p className="text-muted-foreground">Track and manage all pending invitations</p>
        </div>
        <Badge variant="destructive" className="text-lg px-3 py-1">23 Pending</Badge>
      </div>

      <Tabs defaultValue="patient-enrollment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patient-enrollment">Patient Enrollment</TabsTrigger>
          <TabsTrigger value="caregiver">Caregivers</TabsTrigger>
          <TabsTrigger value="patient-general">Patient Invitations</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-enrollment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Patient Enrollment Invitations</CardTitle>
              <CardDescription>Patients who have been invited but not yet enrolled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Robert Smith", email: "robert.smith@email.com", invited: "2 days ago", status: "Pending" },
                  { name: "Mary Johnson", email: "mary.j@email.com", invited: "1 week ago", status: "Pending" },
                  { name: "James Wilson", email: "j.wilson@email.com", invited: "3 days ago", status: "Viewed" }
                ].map((invite, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invite.name}</p>
                      <p className="text-sm text-muted-foreground">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">Invited {invite.invited}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={invite.status === "Viewed" ? "default" : "secondary"}>
                        {invite.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Resend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caregiver" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Caregiver Invitations</CardTitle>
              <CardDescription>Track invitations sent to potential team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No pending caregiver invitations</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient-general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Patient Invitations</CardTitle>
              <CardDescription>All patient invitation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View all patient invitation history here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Referrals</CardTitle>
              <CardDescription>Track referrals made through the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No referrals to display</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, team, and platform preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="user-settings">User Settings</TabsTrigger>
            <TabsTrigger value="care-team">Manage Care Team</TabsTrigger>
            <TabsTrigger value="invitations" className="relative">
              Manage Invitations
              <Badge variant="destructive" className="ml-2 text-xs">23</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user-settings">
            <UserSettings />
          </TabsContent>

          <TabsContent value="care-team">
            <CareTeamManagement />
          </TabsContent>

          <TabsContent value="invitations">
            <InvitationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
