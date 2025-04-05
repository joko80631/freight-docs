# FreightDocs Design System

A token-based, modular design system for FreightDocs applications.

## Components

### FreightBadge

A versatile badge component for displaying status and confidence levels.

```tsx
<FreightBadge variant="confidence-high">High Confidence</FreightBadge>
<FreightBadge variant="status-success">Success</FreightBadge>
```

Variants:
- `confidence-high`
- `confidence-medium`
- `confidence-low`
- `status-success`
- `status-warning`
- `status-error`
- `status-info`

### FreightModal

A modal dialog component with animations and semantic styling.

```tsx
<FreightModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Example Modal"
  description="Modal description"
  footer={<Button>Close</Button>}
>
  Content
</FreightModal>
```

Props:
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `title`: string (optional)
- `description`: string (optional)
- `footer`: ReactNode (optional)
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")

### FreightTable

A data table component with loading and empty states.

```tsx
<FreightTable
  data={items}
  columns={[
    { header: "Name", accessorKey: "name" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => <FreightBadge>{value}</FreightBadge>
    }
  ]}
  onRowClick={(row) => console.log(row)}
  isLoading={false}
  emptyState={<div>No data</div>}
/>
```

### Layout System

A composable layout system with header, content, sidebar, and footer.

```tsx
<Layout>
  <Layout.Header>
    <h1>Page Title</h1>
  </Layout.Header>
  <Layout.Content>
    Main content
  </Layout.Content>
  <Layout.Sidebar>
    Sidebar content
  </Layout.Sidebar>
  <Layout.Footer>
    Footer content
  </Layout.Footer>
</Layout>
```

## Design Tokens

The design system uses CSS variables for consistent styling:

### Colors
- Primary: `--color-primary-{50-950}`
- Neutral: `--color-neutral-{50-950}`
- Semantic: `--color-success`, `--color-warning`, `--color-error`, `--color-info`

### Spacing
- `--spacing-{1-24}`

### Border Radius
- `--radius-{sm,md,lg,xl,2xl,full}`

### Shadows
- `--shadow-{sm,md,lg,xl}`

### Transitions
- `--transition-{fast,normal,slow}`

## Motion Presets

Common animation presets are available in `@/lib/motion`:

- `fadeIn`
- `slideUp`
- `slideDown`
- `slideLeft`
- `slideRight`
- `scalePop`
- `staggerContainer`

## Usage Guidelines

1. Use shadcn/ui components for base UI elements (Card, Button, etc.)
2. Use Freight* components for business-specific UI elements
3. Use token-based classes for colors, spacing, and typography
4. Follow the layout structure defined in `Layout.*`
5. Use motion presets for consistent animations
6. Keep visual logic in components, not in pages

## Development

To test components:

1. Visit `/playground` route
2. Check component variants and states
3. Test responsive behavior
4. Verify dark mode support 