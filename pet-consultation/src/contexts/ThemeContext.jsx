import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokens } from '../styles/tokens';

// Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [rtl, setRtl] = useState(true); // Persian/Arabic RTL support
  const [colorMode, setColorMode] = useState('default');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedRtl = localStorage.getItem('rtl');
    const savedColorMode = localStorage.getItem('colorMode');
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    if (savedRtl !== null) {
      setRtl(savedRtl === 'true');
    }
    
    if (savedColorMode) {
      setColorMode(savedColorMode);
    }
    
    if (savedReducedMotion !== null) {
      setReducedMotion(savedReducedMotion === 'true');
    } else {
      // Check system preference for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReducedMotion);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('data-color-mode', colorMode);
    document.documentElement.setAttribute('data-reduced-motion', reducedMotion);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('rtl', rtl.toString());
    localStorage.setItem('colorMode', colorMode);
    localStorage.setItem('reducedMotion', reducedMotion.toString());
  }, [theme, rtl, colorMode, reducedMotion]);

  // Theme toggle functions
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleRtl = () => {
    setRtl(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  // Color mode options: default, colorblind, high-contrast
  const setColorModeOption = (mode) => {
    setColorMode(mode);
  };

  // Get current theme tokens
  const getThemeTokens = () => {
    return {
      ...tokens,
      current: {
        theme,
        rtl,
        colorMode,
        reducedMotion,
      },
    };
  };

  // Helper function to get color with theme awareness
  const getThemedColor = (colorPath) => {
    const keys = colorPath.split('.');
    let color = tokens.colors;
    
    for (const key of keys) {
      color = color[key];
      if (!color) return null;
    }
    
    // Apply theme modifications if needed
    if (theme === 'dark' && typeof color === 'string') {
      // You can add dark theme color transformations here
      return color;
    }
    
    if (colorMode === 'high-contrast') {
      // Apply high contrast modifications
      return color;
    }
    
    return color;
  };

  // Helper function to get spacing with RTL awareness
  const getThemedSpacing = (spacing) => {
    return tokens.spacing[spacing] || spacing;
  };

  // Helper function to get transitions with reduced motion awareness
  const getThemedTransition = (property = 'all', duration = 'normal', timing = 'smooth') => {
    if (reducedMotion) {
      return 'none';
    }
    
    const transitionDuration = tokens.transition.duration[duration] || duration;
    const transitionTiming = tokens.transition.timing[timing] || timing;
    
    return `${property} ${transitionDuration} ${transitionTiming}`;
  };

  // Responsive breakpoint helpers
  const getBreakpoint = (size) => {
    return tokens.breakpoints[size];
  };

  // Media query helpers
  const mediaQuery = {
    up: (size) => `@media (min-width: ${getBreakpoint(size)})`,
    down: (size) => {
      const breakpoints = Object.keys(tokens.breakpoints);
      const index = breakpoints.indexOf(size);
      if (index > 0) {
        const prevSize = breakpoints[index - 1];
        return `@media (max-width: calc(${getBreakpoint(prevSize)} - 1px))`;
      }
      return '@media (max-width: 0px)';
    },
    between: (min, max) => `@media (min-width: ${getBreakpoint(min)}) and (max-width: calc(${getBreakpoint(max)} - 1px))`,
    only: (size) => {
      const breakpoints = Object.keys(tokens.breakpoints);
      const index = breakpoints.indexOf(size);
      if (index === breakpoints.length - 1) {
        return `@media (min-width: ${getBreakpoint(size)})`;
      }
      const nextSize = breakpoints[index + 1];
      return `@media (min-width: ${getBreakpoint(size)}) and (max-width: calc(${getBreakpoint(nextSize)} - 1px))`;
    },
  };

  const value = {
    // Current state
    theme,
    rtl,
    colorMode,
    reducedMotion,
    
    // Toggle functions
    toggleTheme,
    toggleRtl,
    toggleReducedMotion,
    setColorModeOption,
    
    // Token access
    tokens: getThemeTokens(),
    getThemedColor,
    getThemedSpacing,
    getThemedTransition,
    getBreakpoint,
    mediaQuery,
    
    // Utility functions
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isRtl: rtl,
    isLtr: !rtl,
    hasReducedMotion: reducedMotion,
    isHighContrast: colorMode === 'high-contrast',
    isColorblind: colorMode === 'colorblind',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
/* eslint-disable react-refresh/only-export-components */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// HOC for theme-aware components
/* eslint-disable react-refresh/only-export-components */
// eslint-disable-next-line no-unused-vars
export const withTheme = (WrappedComponent) => {
  return function ThemedComponent(props) {
    const theme = useTheme();
    return <WrappedComponent {...props} theme={theme} />;
  };
};

export default ThemeContext;