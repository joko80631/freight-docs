import { addDays, subDays, format } from "date-fns";

export type LoadStatus = "Active" | "Completed" | "On Hold" | "Cancelled";
export type DocumentType = "BOL" | "POD" | "Invoice";

export interface Load {
  id: string;
  reference: string;
  clientName: string;
  origin: string;
  destination: string;
  dateCreated: Date;
  status: LoadStatus;
  documents: {
    type: DocumentType;
    status: "complete" | "missing";
  }[];
}

const CITIES = [
  { city: "Seattle", state: "WA" },
  { city: "Los Angeles", state: "CA" },
  { city: "San Francisco", state: "CA" },
  { city: "Portland", state: "OR" },
  { city: "Denver", state: "CO" },
  { city: "Chicago", state: "IL" },
  { city: "New York", state: "NY" },
  { city: "Miami", state: "FL" },
  { city: "Houston", state: "TX" },
  { city: "Dallas", state: "TX" },
];

const CLIENT_NAMES = [
  "Acme Shipping",
  "Global Logistics",
  "Swift Transport",
  "Reliable Freight",
  "Elite Logistics",
  "Premier Transport",
  "United Cargo",
  "Express Delivery",
  "Secure Shipping",
  "Fast Freight",
];

const DOCUMENT_TYPES: DocumentType[] = ["BOL", "POD", "Invoice"];

function generateLoadReference(date: Date, index: number): string {
  const year = date.getFullYear();
  const paddedIndex = String(index).padStart(3, "0");
  return `LOAD-${year}-${paddedIndex}`;
}

function generateRandomDocuments(): { type: DocumentType; status: "complete" | "missing" }[] {
  const random = Math.random();
  if (random < 0.2) {
    // 20% chance of all documents complete
    return DOCUMENT_TYPES.map((type) => ({ type, status: "complete" as const }));
  } else if (random < 0.4) {
    // 20% chance of all documents missing
    return DOCUMENT_TYPES.map((type) => ({ type, status: "missing" as const }));
  } else {
    // 60% chance of partial completion
    return DOCUMENT_TYPES.map((type) => ({
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
      origin: `${origin.city}, ${origin.state}`,
      destination: `${destination.city}, ${destination.state}`,
      dateCreated,
      status: getRandomStatus(),
      documents: generateRandomDocuments(),
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

export function getDocumentCompletionStatus(documents: Load["documents"]) {
  const total = documents.length;
  const complete = documents.filter((doc) => doc.status === "complete").length;
  const missing = total - complete;

  return {
    complete,
    total,
    missing,
    percentage: (complete / total) * 100,
  };
}

export function getMissingDocuments(documents: Load["documents"]): DocumentType[] {
  return documents
    .filter((doc) => doc.status === "missing")
    .map((doc) => doc.type);
} 