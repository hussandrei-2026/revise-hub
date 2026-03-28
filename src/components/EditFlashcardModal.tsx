import React, { useState } from 'react';
import { firestoreService } from '../services/firestore.service';

interface EditFlashcardModalProps {
  userId: string;
  deckId: string;
  deckTitle: string;
  deckSubject: string;
  deckTopic: string;
  onClose: () => void;
  onDeckUpdated: () => void;
}

export const EditFlashcardModal: React.FC<EditFlashcardModalProps> = ({ 
  userId,
  deckId,
  deckTitle,
  deckSubject,
  deckTopic,
  onClose, 
  onDeckUpdated 
}) => {
  const [title, setTitle] = useState(deckTitle);
  const [subject, setSubject] = useState(deckSubject);
  const [topic, setTopic] = useState(deckTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build update data
      const updateData = {
        title,
        subject,
        topic
      };

      // ACTUALLY SAVE TO FIRESTORE
      console.log('Updating deck in Firestore:', { deckId, updateData });
      await firestoreService.updateFlashcardDeck(userId, deckId, updateData);
      
      console.log('Deck updated successfully');
      onDeckUpdated(); // This reloads the flashcards
      onClose();
    } catch (err: any) {
      console.error('Error updating deck:', err);
      setError(err.message || 'Failed to update deck');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Deleting deck from Firestore:', deckId);
      await firestoreService.deleteFlashcardDeck(userId, deckId);
      
      console.log('Deck deleted successfully');
      onDeckUpdated(); // This reloads the flashcards
      onClose();
    } catch (err: any) {
      console.error('Error deleting deck:', err);
      setError(err.message || 'Failed to delete deck');
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
        <h2>✏️ Edit Flashcard Deck</h2>
        
        {error && <div style={{ 
          color: '#ef4444', 
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          border: '1px solid #ef4444'
        }}>
          ⚠️ {error}
        </div>}

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

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
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
              {loading ? '⏳ Updating...' : '✓ Update Deck'}
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

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
          >
            🗑️ Delete Deck
          </button>
        </form>
      </div>
    </div>
  );
};
