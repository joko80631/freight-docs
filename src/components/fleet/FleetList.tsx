import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Location</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {vehicle.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    vehicle.status === 'active'
                      ? 'success'
                      : vehicle.status === 'maintenance'
                      ? 'warning'
                      : 'destructive'
                  }
                >
                  {vehicle.status}
                </Badge>
              </TableCell>
              <TableCell>{vehicle.currentLocation}</TableCell>
              <TableCell>{vehicle.lastMaintenance}</TableCell>
              <TableCell>{vehicle.nextMaintenance}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 