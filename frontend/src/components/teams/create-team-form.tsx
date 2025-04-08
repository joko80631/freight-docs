import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTeamFormProps {
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading?: boolean;
}

export function CreateTeamForm({ onSubmit, isLoading }: CreateTeamFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const validateName = (value: string) => {
    if (!value) {
      setNameError("Team name is required");
      return false;
    }
    if (value.length < 3) {
      setNameError("Team name must be at least 3 characters");
      return false;
    }
    if (value.length > 50) {
      setNameError("Team name must be less than 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateDescription = (value: string) => {
    if (value.length > 200) {
      setDescriptionError("Description must be less than 200 characters");
      return false;
    }
    setDescriptionError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(name);
    const isDescriptionValid = validateDescription(description);
    
    if (isNameValid && isDescriptionValid) {
      onSubmit({ name, description });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="rounded-full bg-primary/10 p-2">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Create New Team</h2>
          <p className="text-sm text-muted-foreground">
            Add a new team to collaborate with others.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateName(e.target.value);
            }}
            onBlur={(e) => validateName(e.target.value)}
            placeholder="Enter team name"
            className={cn(
              nameError && "border-error focus-visible:ring-error"
            )}
          />
          {nameError && (
            <p className="text-sm text-error">{nameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              validateDescription(e.target.value);
            }}
            onBlur={(e) => validateDescription(e.target.value)}
            placeholder="Enter team description"
            className={cn(
              descriptionError && "border-error focus-visible:ring-error"
            )}
          />
          {descriptionError && (
            <p className="text-sm text-error">{descriptionError}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !!nameError || !!descriptionError}
        >
          {isLoading ? "Creating..." : "Create Team"}
        </Button>
      </form>
    </Card>
  );
} 