import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

interface OnboardingState {
  currentStep: number;
  steps: OnboardingStep[];
  isComplete: boolean;
}

const INITIAL_STEPS: OnboardingStep[] = [
  {
    id: 'team-setup',
    title: 'Team Setup',
    description: 'Create your first team and invite members',
    isCompleted: false,
  },
  {
    id: 'profile-completion',
    title: 'Complete Profile',
    description: 'Add your company details and preferences',
    isCompleted: false,
  },
  {
    id: 'first-load',
    title: 'Create First Load',
    description: 'Add your first freight load to get started',
    isCompleted: false,
  },
];

export function useOnboarding() {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    steps: INITIAL_STEPS,
    isComplete: false,
  });

  const markStepComplete = useCallback((stepId: string) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      );
      
      const isComplete = updatedSteps.every(step => step.isCompleted);
      
      return {
        ...prev,
        steps: updatedSteps,
        isComplete,
      };
    });
  }, []);

  const goToNextStep = useCallback(() => {
    setState(prev => {
      const nextStep = prev.currentStep + 1;
      if (nextStep >= prev.steps.length) {
        return {
          ...prev,
          currentStep: prev.steps.length - 1,
          isComplete: true,
        };
      }
      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      // API call to mark onboarding as complete
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      toast.success('Onboarding Complete', {
        description: "You're all set! Welcome to Freight Document Platform.",
      });

      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, [router, toast]);

  return {
    currentStep: state.currentStep,
    steps: state.steps,
    isComplete: state.isComplete,
    markStepComplete,
    goToNextStep,
    goToPreviousStep,
    completeOnboarding,
  };
} 