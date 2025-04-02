// Re-export responsive utilities
export { breakpoints, responsive, mediaQuery, isMobile, isTablet, isDesktop } from "./responsive";

// Common layout classes
export const layout = {
  // Page layouts
  page: "min-h-screen bg-background",
  pageContent: "container mx-auto px-4 py-8",
  
  // Section layouts
  section: "space-y-6",
  sectionHeader: "flex items-center justify-between",
  sectionTitle: "text-2xl font-semibold tracking-tight",
  
  // Card layouts
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  cardHeader: "flex flex-col space-y-1.5 p-6",
  cardTitle: "text-2xl font-semibold leading-none tracking-tight",
  cardDescription: "text-sm text-muted-foreground",
  cardContent: "p-6 pt-0",
  cardFooter: "flex items-center p-6 pt-0",
  
  // Form layouts
  form: "space-y-6",
  formGroup: "space-y-2",
  formLabel: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  formDescription: "text-sm text-muted-foreground",
  formError: "text-sm font-medium text-destructive",
  
  // Table layouts
  table: "w-full caption-bottom text-sm",
  tableHeader: "border-b",
  tableBody: "divide-y",
  tableFooter: "border-t bg-muted/50 font-medium",
  tableRow: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  tableCell: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
  tableHead: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
}; 