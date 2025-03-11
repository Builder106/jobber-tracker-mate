import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Globe, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import '../shared/theme.css';
import './options.css';

interface SettingsState {
  apiUrl: string;
  enabledSites: {
    linkedin: boolean;
    indeed: boolean;
    glassdoor: boolean;
    monster: boolean;
    ziprecruiter: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    newJobs: boolean;
    applicationUpdates: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

const defaultSettings: SettingsState = {
  apiUrl: 'http://localhost:8080',
  enabledSites: {
    linkedin: true,
    indeed: true,
    glassdoor: true,
    monster: true,
    ziprecruiter: true,
  },
  notifications: {
    enabled: true,
    sound: true,
    newJobs: true,
    applicationUpdates: true,
  },
  theme: 'system',
};

const Options: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    chrome.storage.local.get(['apiUrl', 'enabledSites', 'notifications', 'theme', 'lastSaved'], (result) => {
      setSettings({
        apiUrl: result.apiUrl || defaultSettings.apiUrl,
        enabledSites: result.enabledSites || defaultSettings.enabledSites,
        notifications: result.notifications || defaultSettings.notifications,
        theme: result.theme || defaultSettings.theme,
      });
      
      if (result.lastSaved) {
        setLastSaved(new Date(result.lastSaved));
      }
      
      setIsLoading(false);
      
      applyTheme(result.theme || defaultSettings.theme);
    });
  }, []);
  
  const applyTheme = (themeSetting: 'light' | 'dark' | 'system') => {
    let effectiveTheme: 'light' | 'dark';
    
    if (themeSetting === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = themeSetting;
    }
    
    document.body.setAttribute('data-theme', effectiveTheme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [settings.theme]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      if (name.startsWith('notification-')) {
        const notificationKey = name.replace('notification-', '') as keyof typeof settings.notifications;
        setSettings((prev) => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [notificationKey]: checked,
          },
        }));
      } else {
        const siteName = name.replace('site-', '') as keyof typeof settings.enabledSites;
        setSettings((prev) => ({
          ...prev,
          enabledSites: {
            ...prev.enabledSites,
            [siteName]: checked,
          },
        }));
      }
    } else if (name === 'theme') {
      const newTheme = value as 'light' | 'dark' | 'system';
      setSettings((prev) => ({
        ...prev,
        theme: newTheme,
      }));
      applyTheme(newTheme);
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = () => {
    try {
      new URL(settings.apiUrl);
      
      chrome.storage.local.set({
        ...settings,
        lastSaved: new Date().toISOString()
      }, () => {
        setLastSaved(new Date());
        toast({
          title: "Settings saved",
          description: "Your settings have been saved successfully.",
          duration: 3000,
        });
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Invalid API URL",
        description: "Please enter a valid API URL",
        duration: 4000,
      });
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(defaultSettings);
      toast({
        title: "Settings reset",
        description: "Settings have been reset to defaults. Click Save to apply changes.",
        duration: 4000,
      });
    }
  };

  const testApiConnection = async () => {
    toast({
      title: "Testing connection...",
      description: "Checking API connection...",
    });
    
    try {
      const response = await fetch(`${settings.apiUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });
      
      if (response.ok) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to the API.",
          duration: 3000,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 4000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <img src={chrome.runtime.getURL('icons/icon48.png')} alt="CareerClutch Logo" className="w-12 h-12" />
        <div>
          <h1 className="text-2xl font-bold">CareerClutch Settings</h1>
          <p className="text-muted-foreground">Customize your job search experience</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Server className="w-4 h-4 mr-2" />
            API Settings
          </TabsTrigger>
          <TabsTrigger value="sites">
            <Globe className="w-4 h-4 mr-2" />
            Job Sites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you want to be notified about job updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications-toggle">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about new jobs and applications</p>
                </div>
                <Switch
                  id="notifications-toggle"
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, enabled: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-4 pl-6">
                {Object.entries({
                  sound: "Play notification sounds",
                  newJobs: "New job matches",
                  applicationUpdates: "Application status updates"
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      id={`notification-${key}`}
                      disabled={!settings.notifications.enabled}
                      checked={settings.notifications[key as keyof typeof settings.notifications]}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: checked }
                        }))
                      }
                    />
                    <Label htmlFor={`notification-${key}`}>{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Connect to your CareerClutch backend API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="api-url">API URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-url"
                    placeholder="https://api.careerclutch.com"
                    value={settings.apiUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                  />
                  <Button variant="outline" onClick={testApiConnection}>
                    Test
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  The URL where your CareerClutch API is hosted
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites">
          <Card>
            <CardHeader>
              <CardTitle>Supported Job Sites</CardTitle>
              <CardDescription>Enable or disable job detection for specific sites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.enabledSites).map(([site, enabled]) => (
                  <div key={site} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label htmlFor={`site-${site}`} className="capitalize">{site}</Label>
                      {enabled && (
                        <p className="text-xs text-muted-foreground flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                          Active
                        </p>
                      )}
                    </div>
                    <Switch
                      id={`site-${site}`}
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          enabledSites: { ...prev.enabledSites, [site]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>CareerClutch Browser Extension</p>
        <p className="mt-1">Version 1.0.0</p>
      </footer>
    </div>
  );
};

export default Options;
