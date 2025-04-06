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
  sectionTitle: "text-2xl font-semibold tracking-tight text-text-primary",
  
  // Card layouts
  card: "rounded-lg border border-border bg-card text-text-primary shadow-sm",
  cardHeader: "flex flex-col space-y-1.5 p-6",
  cardTitle: "text-2xl font-semibold leading-none tracking-tight text-text-primary",
  cardDescription: "text-sm text-text-muted",
  cardContent: "p-6 pt-0",
  cardFooter: "flex items-center p-6 pt-0",
  
  // Form layouts
  form: "space-y-6",
  formGroup: "space-y-2",
  formLabel: "text-sm font-medium leading-none text-text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  formDescription: "text-sm text-text-muted",
  formError: "text-sm font-medium text-error",
  
  // Table layouts
  table: "w-full caption-bottom text-sm",
  tableHeader: "border-b border-border",
  tableBody: "divide-y divide-border",
  tableFooter: "border-t border-border bg-highlight font-medium",
  tableRow: "border-b border-border transition-colors hover:bg-highlight data-[state=selected]:bg-highlight",
  tableCell: "p-4 align-middle text-text-primary [&:has([role=checkbox])]:pr-0",
  tableHead: "h-12 px-4 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0",
}; 