"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

export default function UploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      setIsLoading(true);
      try {
        for (const file of acceptedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { error: dbError } = await supabase
            .from('documents')
            .insert([
              {
                name: file.name,
                path: filePath,
                type: file.type,
                size: file.size,
              }
            ]);

          if (dbError) throw dbError;
        }

        toast.success("Files uploaded successfully");
        router.push("/documents");
      } catch (error) {
        toast.error("Error", {
          description: "Failed to upload files. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Drag and drop your files here, or click to select files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag and drop files here, or click to select files</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => router.push("/documents")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 