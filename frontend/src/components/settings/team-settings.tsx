import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Trash2, Shield } from "lucide-react";
import { CreateTeamForm } from "@/components/teams/create-team-form";

export function TeamSettings() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teams] = useState([
    { id: 1, name: "Operations Team", members: 5, role: "Admin" },
    { id: 2, name: "Sales Team", members: 3, role: "Member" },
  ]);

  const handleCreateTeam = (data: { name: string; description: string }) => {
    console.log("Creating team", data);
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Your Teams</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team memberships and permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create Team"}
        </Button>
      </div>

      {showCreateForm && (
        <CreateTeamForm onSubmit={handleCreateTeam} />
      )}

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {team.members} members • {team.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
                {team.role === "Admin" && (
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Team Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Team Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about team activities
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Admin Controls</Label>
              <p className="text-sm text-muted-foreground">
                Allow team admins to manage members
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
} 