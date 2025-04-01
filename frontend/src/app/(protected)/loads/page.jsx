'use client';

import React, { useEffect, useState } from 'react';
import { useTeamStore } from '@/store/teamStore';
import useLoadStore from '@/store/loadStore';
import LoadDataTable from '@/components/loads/LoadDataTable';
import SearchFilterPanel from '@/components/loads/SearchFilterPanel';
import LoadForm from '@/components/loads/LoadForm';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const LoadsPage = () => {
  const { currentTeam } = useTeamStore();
  const { 
    loads, 
    isLoading, 
    error, 
    filters, 
    pagination,
    fetchLoads, 
    createLoad, 
    updateLoad, 
    deleteLoad,
    setFilters,
    setPagination 
  } = useLoadStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchLoads(currentTeam.id, filters);
    }
  }, [currentTeam?.id, filters, fetchLoads]);

  const handleCreateLoad = async (data) => {
    try {
      await createLoad({
        ...data,
        team_id: currentTeam.id,
        status: 'active'
      });
      toast({
        title: "Success",
        description: "Load created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create load",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLoad = async (data) => {
    try {
      await updateLoad(selectedLoad.id, data);
      toast({
        title: "Success",
        description: "Load updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update load",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLoad = async (load) => {
    try {
      await deleteLoad(load.id);
      toast({
        title: "Success",
        description: "Load deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete load",
        variant: "destructive",
      });
    }
  };

  const handleViewLoad = (load) => {
    // TODO: Implement load view functionality
    console.log('View load:', load);
  };

  const handleEditLoad = (load) => {
    setSelectedLoad(load);
    setIsFormOpen(true);
  };

  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Team Selected</h2>
          <p className="text-muted-foreground">
            Please select or create a team to view loads
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Loads</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Load
        </Button>
      </div>

      <SearchFilterPanel
        filters={filters}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        onStatusChange={(status) => setFilters({ ...filters, status })}
        onDateRangeChange={(dateRange) => setFilters({ ...filters, dateRange })}
        onCustomerChange={(customer) => setFilters({ ...filters, customer })}
        onSaveFilter={() => {
          // TODO: Implement filter saving functionality
          toast({
            title: "Coming Soon",
            description: "Filter saving will be available soon",
          });
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading loads: {error}
        </div>
      ) : (
        <LoadDataTable
          loads={loads}
          onView={handleViewLoad}
          onEdit={handleEditLoad}
          onDelete={handleDeleteLoad}
        />
      )}

      <LoadForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedLoad(null);
        }}
        onSubmit={selectedLoad ? handleUpdateLoad : handleCreateLoad}
        initialData={selectedLoad}
      />
    </div>
  );
};

export default LoadsPage; 