'use client';

import { useState, useEffect } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadsTable } from "@/components/loads/LoadsTable";
import { generateMockLoads } from "@/lib/mock/loads";
import type { Load, LoadStatus } from "@/lib/mock/loads";
import { safeArray } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;
const MAX_VISIBLE_PAGES = 5;

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  const halfMax = Math.floor(MAX_VISIBLE_PAGES / 2);

  // Always show first page
  pages.push(1);

  // Calculate start and end of visible range
  let start = Math.max(2, currentPage - halfMax);
  let end = Math.min(totalPages - 1, currentPage + halfMax);

  // Adjust if we're near the start
  if (currentPage <= halfMax) {
    start = 2;
    end = MAX_VISIBLE_PAGES - 2;
  }
  // Adjust if we're near the end
  else if (currentPage > totalPages - halfMax) {
    start = totalPages - (MAX_VISIBLE_PAGES - 2);
    end = totalPages - 1;
  }

  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push("ellipsis");
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}

export default function LoadsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loads, setLoads] = useState<Load[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LoadStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Simulate API call
    const fetchLoads = async () => {
      setIsLoading(true);
      try {
        const mockLoads = generateMockLoads(20);
        setLoads(mockLoads);
      } catch (error) {
        console.error("Failed to fetch loads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoads();
  }, []);

  const filteredLoads = safeArray(loads).filter((load) => {
    const matchesSearch =
      searchQuery === "" ||
      load.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || load.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLoads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLoads = filteredLoads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Loads</h1>
          <p className="text-sm text-muted-foreground">
            Manage your freight loads and track their status
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Load
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loads..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-8"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={(value: LoadStatus | "all") => {
            setStatusFilter(value);
            setCurrentPage(1); // Reset to first page on filter change
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LoadsTable loads={paginatedLoads} isLoading={isLoading} />

      {!isLoading && filteredLoads.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredLoads.length)} of{" "}
            {filteredLoads.length} loads
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {safeArray(getPageNumbers(currentPage, totalPages)).map((page, index) => (
                page === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="px-2">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 