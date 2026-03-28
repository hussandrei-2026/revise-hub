import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await authService.signup(email, password, displayName);
      } else {
        await authService.signin(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📚</div>
          <h1>ReviseHub</h1>
          <p className="login-subtitle">GCSE Revision Assistant</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input
                id="displayName"
                type="text"
                placeholder="e.g., Alex Smith"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignup}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '⏳ Loading...' : isSignup ? '✓ Create Account' : '✓ Sign In'}
          </button>
        </form>

        <div className="login-divider">or</div>

        <button 
          className="google-btn" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
        >
          🔍 Sign in with Google
        </button>

        <button
          className="toggle-btn"
          onClick={() => {
            setIsSignup(!isSignup);
            setError('');
            setEmail('');
            setPassword('');
            setDisplayName('');
          }}
          type="button"
        >
          {isSignup 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
};

export default Login;
