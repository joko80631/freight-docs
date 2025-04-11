import React from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Truck } from 'lucide-react';

interface FleetVehicle {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  currentLocation: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface FleetListProps {
  vehicles: FleetVehicle[];
  onEdit: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function FleetList({ vehicles, onEdit, onViewDetails }: FleetListProps) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-gray-500 mb-4">Fleet table will be implemented here</p>
      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="font-medium">{vehicle.name}</span>
              <span className="text-sm text-gray-500">({vehicle.status})</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(vehicle.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetails(vehicle.id)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FleetList; 