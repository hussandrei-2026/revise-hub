import React, { useState } from 'react';
import { firestoreService } from '../services/firestore.service';

interface FlashcardModalProps {
  userId: string;
  onClose: () => void;
  onFlashcardCreated: () => void;
}

export const CreateFlashcardModal: React.FC<FlashcardModalProps> = ({ 
  userId, 
  onClose, 
  onFlashcardCreated 
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Maths');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await firestoreService.createFlashcardDeck(userId, {
        title,
        subject,
        topic,
        cardsCount: 0
      });

      setTitle('');
      setTopic('');
      onFlashcardCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2>📝 Create Flashcard Deck</h2>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Deck Title
            </label>
            <input
              type="text"
              placeholder="e.g., Biology Chapter 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option>Maths</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>English Language</option>
              <option>English Literature</option>
              <option>History</option>
              <option>Geography</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Topic
            </label>
            <input
              type="text"
              placeholder="e.g., Photosynthesis"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create Deck'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--border-primary)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
