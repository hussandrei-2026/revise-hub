import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      // Try to get saved theme from localStorage
      const saved = localStorage.getItem('revise-hub-theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        console.log('✅ ThemeProvider: Loaded saved theme from localStorage:', saved);
        return saved;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('✅ ThemeProvider: System prefers dark mode');
        return 'dark';
      }
      
      console.log('✅ ThemeProvider: Defaulting to light mode');
      return 'light';
    } catch (error) {
      console.error('❌ ThemeProvider: Error reading theme from localStorage:', error);
      return 'light';
    }
  });

  // Apply theme to DOM immediately on mount and when theme changes
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('revise-hub-theme', theme);
      console.log('✅ ThemeProvider: Saved theme to localStorage:', theme);
      
      // Update HTML attribute - CRITICAL for CSS variables
      const htmlElement = document.documentElement;
      htmlElement.setAttribute('data-theme', theme);
      console.log('✅ ThemeProvider: Set HTML data-theme attribute to:', theme);
      
      // Verify CSS variables are updating
      const computedStyle = getComputedStyle(htmlElement);
      const bgPrimary = computedStyle.getPropertyValue('--bg-primary').trim();
      const textPrimary = computedStyle.getPropertyValue('--text-primary').trim();
      console.log('✅ ThemeProvider: CSS Variables Applied:');
      console.log('   --bg-primary:', bgPrimary);
      console.log('   --text-primary:', textPrimary);
      
      // Log what the theme SHOULD be
      if (theme === 'light') {
        console.log('   Expected --bg-primary: #ffffff');
        console.log('   Expected --text-primary: #1f2937');
      } else {
        console.log('   Expected --bg-primary: #1f2937');
        console.log('   Expected --text-primary: #f3f4f6');
      }
      
    } catch (error) {
      console.error('❌ ThemeProvider: Error applying theme:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('🔄 ThemeProvider: toggleTheme called, current theme:', theme);
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('🔄 ThemeProvider: Theme will change to:', newTheme);
      return newTheme;
    });
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme
  };

  return React.createElement(
    ThemeContext.Provider,
    { value },
    props.children
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
