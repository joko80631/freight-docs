"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LoadForm } from "@/components/loads/LoadForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";

export default function EditLoadPage({ params }) {
  const router = useRouter();
  const [load, setLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        const { data: load, error } = await supabase
          .from("loads")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setLoad(load);
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load load details. Please try again.",
        });
        router.push("/loads");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoad();
  }, [params.id, router]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!load) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Edit Load"
        description="Update load information and details"
        backButton
        onBack={() => router.push("/loads")}
      />
      <LoadForm initialData={load} mode="edit" />
    </div>
  );
} 