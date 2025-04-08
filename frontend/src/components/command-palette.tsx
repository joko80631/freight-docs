"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTeamStore } from "@/store/team-store";
import { useDebounce } from "@/hooks/use-debounce";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, Search, FileText, Truck } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: "load" | "document";
  title: string;
  subtitle: string;
  metadata: {
    status?: string;
    confidence?: number;
    type?: string;
  };
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { currentTeam } = useTeamStore();
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const debouncedSearch = useDebounce(search, 300);

  // Reset focus when search changes or modal opens
  React.useEffect(() => {
    setFocusIndex(0);
  }, [search, open]);

  React.useEffect(() => {
    const searchItems = async () => {
      if (!debouncedSearch || !currentTeam?.id) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        // Search loads
        const { data: loads } = await supabase
          .from("loads")
          .select("id, load_number, status, client_name")
          .eq("team_id", currentTeam.id)
          .ilike("load_number", `%${debouncedSearch}%`)
          .limit(5);

        // Search documents
        const { data: documents } = await supabase
          .from("documents")
          .select("id, file_name, type, confidence")
          .eq("team_id", currentTeam.id)
          .ilike("file_name", `%${debouncedSearch}%`)
          .limit(5);

        const formattedResults: SearchResult[] = [
          ...(loads?.map((load) => ({
            id: load.id,
            type: "load" as const,
            title: load.load_number,
            subtitle: load.client_name,
            metadata: { status: load.status },
          })) || []),
          ...(documents?.map((doc) => ({
            id: doc.id,
            type: "document" as const,
            title: doc.file_name,
            subtitle: doc.type,
            metadata: { confidence: doc.confidence },
          })) || []),
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    searchItems();
  }, [debouncedSearch, currentTeam?.id, supabase, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[focusIndex]) {
          handleSelect(results[focusIndex]);
        }
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === "load") {
      router.push(`/loads/${result.id}`);
    } else {
      router.push(`/documents/${result.id}`);
    }
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        >
          <div className="fixed inset-0 flex items-start justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-lg border bg-background shadow-lg"
            >
              <CommandPrimitive className="overflow-hidden rounded-lg border shadow-md">
                <div className="relative flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <CommandPrimitive.Input
                    placeholder="Search loads and documents..."
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={handleKeyDown}
                  />
                  {loading && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>

                <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                  {results.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    <div className="p-2">
                      {results.map((result, index) => (
                        <CommandPrimitive.Item
                          key={result.id}
                          value={result.title}
                          onSelect={() => handleSelect(result)}
                          className={cn(
                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                            focusIndex === index && "bg-muted rounded-md"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {result.type === "load" ? (
                              <Truck className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium">{result.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {result.subtitle}
                              </span>
                            </div>
                          </div>
                          {result.metadata.status && (
                            <span
                              className={cn(
                                "ml-auto rounded-full px-2 py-0.5 text-xs",
                                {
                                  "bg-green-100 text-green-800":
                                    result.metadata.status === "completed",
                                  "bg-yellow-100 text-yellow-800":
                                    result.metadata.status === "in_progress",
                                  "bg-red-100 text-red-800":
                                    result.metadata.status === "failed",
                                }
                              )}
                            >
                              {result.metadata.status}
                            </span>
                          )}
                        </CommandPrimitive.Item>
                      ))}
                    </div>
                  )}
                </CommandPrimitive.List>
              </CommandPrimitive>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 