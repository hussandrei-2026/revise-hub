import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Login from './components/Login';
import { authService } from './services/auth.service';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { User } from 'firebase/auth';
import './App.css';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--gradient-bg)',
        color: 'var(--text-primary)',
        fontSize: '18px'
      }}>
        ⏳ Loading ReviseHub...
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard 
          userName={user.displayName || 'User'} 
          onLogout={handleLogout}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
      ) : (
        <Login onLoginSuccess={() => {}} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;