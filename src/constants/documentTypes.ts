export interface DocumentTypeOption {
  value: string;
  label: string;
  description?: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    value: 'invoice',
    label: 'Invoice',
    description: 'Commercial invoice for goods or services',
  },
  {
    value: 'bill_of_lading',
    label: 'Bill of Lading',
    description: 'Document issued by carrier to acknowledge receipt of cargo',
  },
  {
    value: 'proof_of_delivery',
    label: 'Proof of Delivery',
    description: 'Document confirming delivery of goods',
  },
  {
    value: 'packing_list',
    label: 'Packing List',
    description: 'Detailed list of items in a shipment',
  },
  {
    value: 'certificate_of_origin',
    label: 'Certificate of Origin',
    description: 'Document certifying the country of origin of goods',
  },
]; 