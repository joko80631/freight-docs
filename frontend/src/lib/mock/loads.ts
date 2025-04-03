import { addDays, subDays, format } from "date-fns";
import { safeArray } from "@/lib/utils";

export type LoadStatus = "Active" | "Completed" | "On Hold" | "Cancelled";

export type DocumentType = 
  | "Bill of Lading"
  | "Proof of Delivery"
  | "Invoice"
  | "Weight Ticket"
  | "Rate Confirmation";

export type DocumentStatus = "complete" | "missing" | "pending";

export interface Document {
  type: DocumentType;
  status: DocumentStatus;
  url?: string;
  uploadedAt?: Date;
  uploadedBy?: string;
}

export interface Load {
  id: string;
  reference: string;
  clientName: string;
  origin: string;
  destination: string;
  dateCreated: Date;
  dateUpdated: Date;
  status: LoadStatus;
  documents: Document[];
  carrier?: string;
  referenceNumbers?: {
    bol?: string;
    pod?: string;
  };
  pickupDate?: Date;
  deliveryDate?: Date;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  specialInstructions?: string;
  createdBy: string;
}

const CITIES = [
  "Seattle, WA",
  "Miami, FL",
  "Los Angeles, CA",
  "New York, NY",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
];

const CLIENT_NAMES = [
  "Acme Corporation",
  "Global Logistics Inc.",
  "Tech Solutions Ltd.",
  "Industrial Supplies Co.",
  "Retail Distribution LLC",
  "Manufacturing Pro",
  "Supply Chain Experts",
  "Transport Solutions",
  "Freight Forwarders Co.",
  "Shipping Partners Inc.",
];

const DOCUMENT_TYPES: DocumentType[] = ["Bill of Lading", "Proof of Delivery", "Invoice", "Weight Ticket", "Rate Confirmation"];

function generateLoadReference(date: Date, index: number): string {
  const year = date.getFullYear();
  const paddedIndex = String(index).padStart(3, "0");
  return `LOAD-${year}-${paddedIndex}`;
}

function generateRandomDocuments(): Document[] {
  const random = Math.random();
  if (random < 0.2) {
    // 20% chance of all documents complete
    return safeArray(DOCUMENT_TYPES).map((type) => ({ type, status: "complete" as const }));
  } else if (random < 0.4) {
    // 20% chance of all documents missing
    return safeArray(DOCUMENT_TYPES).map((type) => ({ type, status: "missing" as const }));
  } else {
    // 60% chance of partial completion
    return safeArray(DOCUMENT_TYPES).map((type) => ({
      type,
      status: Math.random() > 0.5 ? "complete" : "missing",
    }));
  }
}

function getRandomStatus(): LoadStatus {
  const random = Math.random();
  if (random < 0.6) return "Active";
  if (random < 0.8) return "Completed";
  if (random < 0.9) return "On Hold";
  return "Cancelled";
}

export function generateMockLoads(count: number = 20): Load[] {
  const loads: Load[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    // Generate random dates within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const dateCreated = subDays(today, daysAgo);

    // Get random origin and destination
    const originIndex = Math.floor(Math.random() * CITIES.length);
    let destinationIndex;
    do {
      destinationIndex = Math.floor(Math.random() * CITIES.length);
    } while (destinationIndex === originIndex);

    const origin = CITIES[originIndex];
    const destination = CITIES[destinationIndex];

    loads.push({
      id: `load-${i + 1}`,
      reference: generateLoadReference(dateCreated, i + 1),
      clientName: CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)],
      origin: origin,
      destination: destination,
      dateCreated,
      dateUpdated: new Date(dateCreated),
      status: getRandomStatus(),
      documents: generateRandomDocuments(),
      carrier: "ABC Transport Co.",
      referenceNumbers: {
        bol: `BOL-${Math.floor(Math.random() * 10000)}`,
        pod: `POD-${Math.floor(Math.random() * 10000)}`,
      },
      pickupDate: new Date(dateCreated),
      deliveryDate: new Date(dateCreated.getTime() + 24 * 60 * 60 * 1000),
      weight: Math.floor(Math.random() * 5000) + 1000,
      dimensions: {
        length: 48,
        width: 40,
        height: 48,
      },
      specialInstructions: "Handle with care, temperature controlled",
      createdBy: "John Doe",
    });
  }

  // Sort by date created (newest first)
  return loads.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
}

export function formatDate(date: Date): string {
  return format(date, "MM/dd/yyyy");
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return formatDate(date);
}

export function getDocumentCompletionStatus(documents: Document[]): { complete: number; total: number; percentage: number } {
  const total = safeArray(documents).length;
  const complete = safeArray(documents).filter((doc) => doc.status === "complete").length;
  const missing = total - complete;

  return {
    complete,
    total,
    percentage: (complete / total) * 100,
  };
}

export function getMissingDocuments(documents: Document[]): DocumentType[] {
  return safeArray(documents)
    .filter((doc) => doc.status === "missing")
    .map((doc) => doc.type);
} 