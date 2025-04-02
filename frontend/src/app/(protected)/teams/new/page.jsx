'use client';

import React, { useState } from 'react';
import { useTeamStore } from '@/store/teamStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const NewTeamPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { createTeam, setCurrentTeam } = useTeamStore();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newTeam = await createTeam({ name: name.trim() });
      await setCurrentTeam(newTeam);
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                Create Team
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTeamPage; 