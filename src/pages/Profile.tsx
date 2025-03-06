
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Mail, Bell, Shield, CreditCard, ExternalLink, Upload, Edit, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || user?.email?.split('@')[0] || 'User');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName }
      });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user!.id}-${Math.random()}.${fileExt}`;

      setIsUploading(true);

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      // Update the user's metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Get creation date from user metadata or fallback to current date
  const creationDate = user.created_at ? new Date(user.created_at) : new Date();
  const formattedCreationDate = creationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if user signed in with OAuth
  const isOAuthUser = user.app_metadata?.provider && ['google', 'azure'].includes(user.app_metadata.provider);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground mb-6">Manage your account settings and preferences</p>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your profile information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-background">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                          <Upload className="w-4 h-4 text-white" />
                        </div>
                      </Label>
                      <Input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                      {!isEditing ? (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={handleUpdateProfile}>
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setIsEditing(false);
                            setDisplayName(user?.user_metadata?.name || user?.email?.split('@')[0] || 'User');
                          }}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="max-w-sm"
                      />
                    ) : (
                      <p className="text-lg font-medium">{displayName}</p>
                    )}
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Account Type</Label>
                    <p className="text-muted-foreground">Free Plan</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-muted-foreground">{formattedCreationDate}</p>
                  </div>
                  
                  {isOAuthUser && (
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-sm font-medium">Connected Account</Label>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ExternalLink className="w-4 h-4" />
                        <span>Signed in with {user.app_metadata.provider === 'azure' ? 'Microsoft' : 'Google'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">

                
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your password and account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isOAuthUser && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">Change your password</p>
                      </div>
                      <Button variant="outline" onClick={() => {
                        toast({
                          title: "Password reset email sent",
                          description: "Check your email for a password reset link."
                        });
                      }}>
                        Change Password
                      </Button>
                    </div>
                    <Separator />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  <Separator />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Active Sessions</h3>
                      <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "All sessions terminated",
                        description: "You have been logged out from all other devices."
                      });
                    }}>
                      Sign Out All Devices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Application Reminders</h3>
                      <p className="text-sm text-muted-foreground">Get reminders for upcoming application deadlines</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Interview Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive notifications for interview schedules</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Marketing Communications</h3>
                      <p className="text-sm text-muted-foreground">Receive product updates and promotional offers</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={() => {
                  toast({
                    title: "Notification preferences saved",
                    description: "Your notification settings have been updated."
                  });
                }}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Billing Information</span>
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-muted/50 rounded-lg text-center">
                  <h3 className="font-medium text-lg mb-2">Free Plan</h3>
                  <p className="text-muted-foreground mb-4">You're currently on the free plan</p>

                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Plan Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Track up to 10 job applications</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Basic application analytics</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Calendar integration</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">

              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
