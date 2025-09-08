# Pet Consultation Design System

A comprehensive design system for the Pet Consultation platform, built with React, Tailwind CSS, and modern design principles.

## Overview

Our design system provides a consistent, accessible, and beautiful user interface across the entire application. It includes design tokens, components, patterns, and guidelines that ensure a cohesive user experience.

## Design Tokens

### Colors

#### Primary Colors
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Complementary colors for secondary actions
- **Accent**: Highlight colors for special elements

#### Semantic Colors
- **Success**: Green tones for positive actions and states
- **Warning**: Yellow/Orange tones for caution and warnings
- **Error**: Red tones for errors and destructive actions
- **Info**: Blue tones for informational content

#### Neutral Colors
- **Gray Scale**: From white to black for text, borders, and backgrounds
- **Glass**: Semi-transparent colors for modern glass effects

### Typography

#### Font Families
- **Primary**: Vazir (Persian/Arabic support)
- **Secondary**: Inter (Latin fallback)
- **Monospace**: JetBrains Mono (code and technical content)

#### Font Sizes
- **xs**: 12px - Small labels and captions
- **sm**: 14px - Body text and descriptions
- **base**: 16px - Default body text
- **lg**: 18px - Large body text
- **xl**: 20px - Small headings
- **2xl**: 24px - Medium headings
- **3xl**: 30px - Large headings
- **4xl**: 36px - Extra large headings

### Spacing

Based on 4px grid system:
- **0**: 0px
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px
- **16**: 64px
- **20**: 80px
- **24**: 96px

### Border Radius
- **none**: 0px
- **sm**: 2px
- **default**: 4px
- **md**: 6px
- **lg**: 8px
- **xl**: 12px
- **2xl**: 16px
- **3xl**: 24px
- **full**: 9999px (circular)

### Shadows
- **sm**: Subtle shadow for cards
- **default**: Standard shadow for elevated elements
- **md**: Medium shadow for modals
- **lg**: Large shadow for dropdowns
- **xl**: Extra large shadow for overlays

## Components

### Button

Versatile button component with multiple variants and states.

```jsx
import { Button } from '../components/ui';

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// With icons
<Button icon={<IconPlus />}>Add Item</Button>
```

### Card

Flexible container component for grouping related content.

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="glass">Glass effect card</Card>
<Card variant="outlined">Outlined card</Card>
```

### Input

Form input component with validation and accessibility features.

```jsx
import { Input } from '../components/ui';

// Basic usage
<Input placeholder="Enter text..." />

// With label
<Input label="Email" type="email" />

// With validation
<Input 
  label="Password" 
  type="password" 
  error="Password is required"
/>

// With icons
<Input 
  leftIcon={<IconUser />}
  rightIcon={<IconSearch />}
  placeholder="Search..."
/>
```

### Textarea

Multi-line text input with auto-resize and character counting.

```jsx
import { Textarea } from '../components/ui';

<Textarea 
  label="Description"
  placeholder="Enter description..."
  maxLength={500}
  showCharCount
  autoResize
/>
```

### Modal

Overlay component for dialogs and focused interactions.

```jsx
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../components/ui';

<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Modal Title</ModalTitle>
  </ModalHeader>
  <ModalBody>
    <p>Modal content...</p>
  </ModalBody>
  <ModalFooter>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

### Badge

Small status indicators and labels.

```jsx
import { Badge, StatusBadge, NotificationBadge } from '../components/ui';

// Basic badges
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>

// Status badges
<StatusBadge status="active" />
<StatusBadge status="pending" />

// Notification badges
<NotificationBadge count={5} />
<NotificationBadge count={99} max={99} />
```

### Spinner

Loading indicators with multiple styles.

```jsx
import { Spinner, DotsSpinner, PulseSpinner, LoadingOverlay } from '../components/ui';

// Basic spinner
<Spinner />

// Variants
<DotsSpinner />
<PulseSpinner />

// With overlay
<LoadingOverlay isLoading={isLoading}>
  <div>Content to overlay</div>
</LoadingOverlay>
```

### Toast

Notification system for user feedback.

```jsx
import { Toast, useToast } from '../components/ui';

const MyComponent = () => {
  const { toast } = useToast();
  
  const showSuccess = () => {
    toast.success({
      title: 'Success!',
      description: 'Operation completed successfully.'
    });
  };
  
  return <Button onClick={showSuccess}>Show Toast</Button>;
};
```

## Theme System

### Theme Provider

Wrap your app with the ThemeProvider to enable theme features:

```jsx
import { ThemeProvider } from '../contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme Context

```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { 
    theme, 
    toggleTheme, 
    isRtl, 
    toggleDirection,
    hasReducedMotion 
  } = useTheme();
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
    </div>
  );
};
```

## Accessibility

### ARIA Support
- All interactive components include proper ARIA attributes
- Screen reader friendly labels and descriptions
- Keyboard navigation support

### Motion Preferences
- Respects `prefers-reduced-motion` setting
- Animations can be disabled globally

### Color Contrast
- All color combinations meet WCAG AA standards
- High contrast mode support

### RTL Support
- Full right-to-left language support
- Automatic layout adjustments
- Persian/Arabic text optimization

## Best Practices

### Component Usage
1. **Consistency**: Use design system components instead of custom styles
2. **Accessibility**: Always provide proper labels and ARIA attributes
3. **Performance**: Use appropriate component variants for your use case
4. **Theming**: Leverage theme context for dynamic styling

### Styling Guidelines
1. **Utility-First**: Use Tailwind utilities for custom styling
2. **Design Tokens**: Reference design tokens for consistent values
3. **Responsive**: Design mobile-first with responsive breakpoints
4. **Dark Mode**: Ensure components work in both light and dark themes

### Development Workflow
1. **Component First**: Check if a design system component exists
2. **Extend Carefully**: When extending components, maintain consistency
3. **Document Changes**: Update this guide when adding new components
4. **Test Accessibility**: Verify keyboard navigation and screen readers

## Migration Guide

### From Legacy Components

1. **Replace old Button imports**:
   ```jsx
   // Old
   import Button from '../components/common/Button';
   
   // New
   import { Button } from '../components/ui';
   ```

2. **Update prop names**:
   ```jsx
   // Old
   <Button type="primary" size="large">
   
   // New
   <Button variant="primary" size="lg">
   ```

3. **Use new theme context**:
   ```jsx
   // Old
   const isDark = useContext(ThemeContext);
   
   // New
   const { theme, toggleTheme } = useTheme();
   ```

## Contributing

When contributing to the design system:

1. **Follow Conventions**: Maintain existing patterns and naming
2. **Add Documentation**: Update this guide with new components
3. **Test Thoroughly**: Verify accessibility and responsive behavior
4. **Consider RTL**: Ensure components work in right-to-left layouts
5. **Performance**: Optimize for bundle size and runtime performance

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility Guide](https://reactjs.org/docs/accessibility.html)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Persian Typography Guidelines](https://github.com/rastikerdar/vazir-font)