import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, FileText, Truck, Calendar } from "lucide-react";

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationTypes, setNotificationTypes] = useState({
    teamMessages: true,
    documentUpdates: true,
    loadStatus: true,
    upcomingEvents: true,
  });

  const handleSave = () => {
    console.log("Saving notification settings", {
      emailNotifications,
      pushNotifications,
      notificationTypes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications in the app
            </p>
          </div>
          <Switch
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Team Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about team communications
                </p>
              </div>
            </div>
            <Switch
              checked={notificationTypes.teamMessages}
              onCheckedChange={(checked) => 
                setNotificationTypes({...notificationTypes, teamMessages: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Document Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about document changes
                </p>
              </div>
            </div>
            <Switch
              checked={notificationTypes.documentUpdates}
              onCheckedChange={(checked) => 
                setNotificationTypes({...notificationTypes, documentUpdates: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Load Status</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about load status changes
                </p>
              </div>
            </div>
            <Switch
              checked={notificationTypes.loadStatus}
              onCheckedChange={(checked) => 
                setNotificationTypes({...notificationTypes, loadStatus: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Upcoming Events</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about scheduled events
                </p>
              </div>
            </div>
            <Switch
              checked={notificationTypes.upcomingEvents}
              onCheckedChange={(checked) => 
                setNotificationTypes({...notificationTypes, upcomingEvents: checked})
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
} 