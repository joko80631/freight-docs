# Frontend

This is the frontend for the Freight application. It is built with Next.js, React, TypeScript, and Tailwind CSS.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Dark mode
- Responsive design
- Accessibility
- Animations
- Form handling
- Date picking
- Toast notifications
- Tooltips
- Modals
- Dropdowns
- Tabs
- Tables
- Charts
- File uploads
- PDF viewing
- Authentication
- Authorization
- API integration
- State management
- Error handling
- Loading states
- Error boundaries
- SEO
- Performance
- Security
- Testing
- CI/CD
- Documentation

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   └── ...
│   ├── lib/
│   │   └── utils.ts
│   └── ...
├── public/
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Freight Document Tracking System

## Layout System Improvements

The layout system has been refactored to address several issues:

1. **Sidebar Animation and Visibility Logic**
   - Sidebar is now conditionally rendered on mobile when collapsed
   - Eliminates layout thrashing and improves performance

2. **Overlay Visibility**
   - Mobile overlay is only rendered when needed
   - Prevents z-index and interaction bugs

3. **Consistent Padding**
   - Padding and layout logic is now unified
   - Eliminates inconsistent horizontal spacing

4. **Accessibility Improvements**
   - Added keyboard navigation support
   - Escape key closes sidebar on mobile
   - Focus management when sidebar opens
   - Trap focus within sidebar when open on mobile

5. **Responsive Behavior**
   - Validated across all breakpoints
   - Consistent behavior on all screen sizes

6. **Defensive Navigation**
   - Added validation for navigation items
   - Graceful handling of missing properties

## Testing

To run the tests, you'll need to install the following dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest jest
```

Then run the tests with:

```bash
npm test
```

## Responsive Breakpoints

The layout system uses the following breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Accessibility

The layout system is designed to be fully accessible:

- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA attributes 