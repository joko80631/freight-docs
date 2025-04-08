# Typography System

This directory contains the typography system for the application, which follows the design guidelines specified in the UI Typography Guidelines document.

## Files

- `typography.css`: Contains the core typography system with CSS variables, font imports, and utility classes.
- `globals.css`: Imports the typography system and applies it globally with Tailwind CSS integration.

## Font Files

The typography system uses two primary font families:
- **Switzer**: Used for all heading elements
- **Satoshi**: Used for all body text elements

Font files should be placed in the `/public/fonts/` directory with the following structure:
```
public/fonts/
  ├── Switzer-Regular.woff2
  ├── Switzer-Medium.woff2
  ├── Switzer-SemiBold.woff2
  ├── Satoshi-Regular.woff2
  └── Satoshi-Medium.woff2
```

## Usage

### Semantic HTML Elements

The typography system automatically applies styles to semantic HTML elements:

```jsx
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<p>Body text</p>
```

### Utility Classes

You can also use utility classes directly:

```jsx
<p className="h1">Heading 1 style</p>
<p className="h2">Heading 2 style</p>
<p className="h3">Heading 3 style</p>
<p className="h4">Heading 4 style</p>
<p className="h5">Heading 5 style</p>
<p className="heading-long">Heading Long style</p>
<p className="body-large">Body Large style</p>
<p className="body-medium">Body Medium style</p>
<p className="body-small">Body Small style</p>
<p className="strong-medium">Strong Medium style</p>
```

### Text Alignment

```jsx
<p className="text-left">Left aligned text</p>
<p className="text-center">Center aligned text</p>
<p className="text-right">Right aligned text</p>
<p className="text-justify">Justified text</p>
```

### Text Decoration

```jsx
<p className="underline">Underlined text</p>
<p className="line-through">Line through text</p>
<p className="no-underline">No underline text</p>
```

### Text Transform

```jsx
<p className="uppercase">Uppercase text</p>
<p className="lowercase">LOWERCASE TEXT</p>
<p className="capitalize">capitalized text</p>
<p className="normal-case">Normal case text</p>
```

## Responsive Behavior

The typography system includes responsive breakpoints:

- **Desktop (default)**: Full typography sizes
- **Tablet (max-width: 810px)**: Reduced typography sizes
- **Mobile (max-width: 480px)**: Further reduced typography sizes

## Testing

A test page is available at `/typography-test` to verify the typography system is working correctly.

## Maintenance

When updating the typography system:

1. Update the CSS variables in `typography.css`
2. Test the changes using the typography test page
3. Verify responsive behavior across different screen sizes
4. Check for any FOUT (Flash of Unstyled Text) issues 