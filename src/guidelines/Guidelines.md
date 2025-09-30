# Design System Guidelines

## Color System

### Primary Color
- **Primary Color**: `#1E5128` (Dark Forest Green)
- **Primary Foreground**: `#ffffff` (White)
- **Usage**: Use for main CTAs, brand elements, active states, and primary actions

### Color Usage Rules
- Always use design system color tokens instead of hardcoded colors
- Primary color should be used for:
  - Main action buttons
  - Brand logo elements
  - Active navigation states
  - Chart primary data
  - Progress indicators
  - Links and interactive elements

### Implementation
- Use `bg-primary` and `text-primary` classes for primary color
- Use `bg-primary-foreground` and `text-primary-foreground` for contrast text
- Use CSS custom properties `var(--color-primary)` when needed in custom styles

## Component Guidelines

### Buttons
- Primary buttons should use `bg-primary hover:bg-primary/90 text-primary-foreground`
- Secondary buttons should use `variant="outline"` to inherit primary color borders
- Ghost buttons for subtle actions

### Navigation
- Active navigation items should have `border-primary` accent
- Use primary color for navigation highlights and active states

### Data Visualization  
- Charts should use `var(--color-primary)` as the primary data color
- Maintain consistent color usage across all charts and graphs

### Forms
- Links within forms should use `text-primary hover:underline`
- Focus states should use primary color variants

## Typography
- Base font size: 14px
- Use semantic HTML elements (h1, h2, h3, etc.) for automatic typography scaling
- Medium font weight (500) for headings and important text
- Normal font weight (400) for body text

## Layout
- Prefer flexbox and grid for responsive layouts
- Use semantic spacing classes from Tailwind
- Maintain consistent spacing patterns throughout the application