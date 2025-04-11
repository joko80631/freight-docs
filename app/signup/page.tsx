'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SignupForm from '@/components/auth/SignupForm';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleSubmit = async (data: SignupData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) throw error;

      router.push('/login');
      toast({
        title: 'Success',
        description: 'Account created successfully. Please check your email to verify your account.',
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.png"
          alt="Freight Document Platform"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignupForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
} 