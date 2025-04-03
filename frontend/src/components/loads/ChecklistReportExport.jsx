import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ChecklistReportExport({ load }) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Generate report data
      const reportData = generateReportData(load);
      
      // Convert to CSV
      const csv = convertToCSV(reportData);
      
      // Create a blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `load-checklist-${load.reference}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Checklist report exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export checklist report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportData = (load) => {
    // Document types with their labels
    const documentTypes = {
      BOL: 'Bill of Lading',
      POD: 'Proof of Delivery',
      INVOICE: 'Invoice',
      OTHER: 'Other Document',
    };
    
    // Get document status
    const getDocumentStatus = (type) => {
      const document = load.documents?.find(doc => doc.type === type);
      if (!document) return 'Missing';
      if (document.status === 'verified') return 'Complete';
      return 'Pending Verification';
    };
    
    // Get document details
    const getDocumentDetails = (type) => {
      const document = load.documents?.find(doc => doc.type === type);
      if (!document) return { filename: '-', confidence: '-', uploadedBy: '-', date: '-' };
      
      return {
        filename: document.file_name || '-',
        confidence: document.confidence_score ? `${document.confidence_score}%` : '-',
        uploadedBy: document.uploaded_by || '-',
        date: document.created_at ? new Date(document.created_at).toLocaleDateString() : '-',
      };
    };
    
    // Generate report rows
    const rows = [];
    
    // Add header row
    rows.push([
      'Load Reference',
      'Client',
      'Status',
      'Created',
      'Document Type',
      'Status',
      'Filename',
      'Confidence',
      'Uploaded By',
      'Date',
    ]);
    
    // Add data rows
    Object.entries(documentTypes).forEach(([type, label]) => {
      const status = getDocumentStatus(type);
      const details = getDocumentDetails(type);
      
      rows.push([
        load.reference,
        load.client_name,
        load.status,
        new Date(load.created_at).toLocaleDateString(),
        label,
        status,
        details.filename,
        details.confidence,
        details.uploadedBy,
        details.date,
      ]);
    });
    
    return rows;
  };

  const convertToCSV = (data) => {
    return data.map(row => row.map(cell => {
      // Escape commas and quotes
      const cellStr = String(cell).replace(/"/g, '""');
      return `"${cellStr}"`;
    }).join(',')).join('\n');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Export Checklist
        </>
      )}
    </Button>
  );
} 