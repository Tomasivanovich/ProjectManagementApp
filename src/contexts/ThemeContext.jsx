import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  primary: '#007AFF',
  background: '#f5f5f5',
  card: 'white',
  text: '#333',
  textSecondary: '#666',
  border: '#e9ecef',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const darkColors = {
  primary: '#0A84FF',
  background: '#1c1c1e',
  card: '#2c2c2e',
  text: '#ffffff',
  textSecondary: '#98989f',
  border: '#38383a',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
};

export default ThemeContext;