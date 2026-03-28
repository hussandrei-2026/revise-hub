import React, { useState } from 'react';
import { firestoreService } from '../services/firestore.service';

interface CreateCalendarEventModalProps {
  userId: string;
  onClose: () => void;
  onEventCreated: () => void;
}

export const CreateCalendarEventModal: React.FC<CreateCalendarEventModalProps> = ({ 
  userId, 
  onClose, 
  onEventCreated 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'exam' | 'revision' | 'pastpaper' | 'note'>('exam');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build event data - only include optional fields if they have values
      const eventData: any = {
        title,
        date: new Date(date),
        type
      };
      
      if (subject.trim()) {
        eventData.subject = subject;
      }
      if (description.trim()) {
        eventData.description = description;
      }

      await firestoreService.createCalendarEvent(userId, eventData);

      setTitle('');
      setDate('');
      setSubject('');
      setDescription('');
      onEventCreated();
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
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2>📅 Add Calendar Event</h2>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Event Title
            </label>
            <input
              type="text"
              placeholder="e.g., GCSE Maths Paper 1"
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
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              Event Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
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
              <option value="exam">📝 Exam</option>
              <option value="revision">📚 Revision Session</option>
              <option value="pastpaper">📄 Past Paper Practice</option>
              <option value="note">📌 Note/Reminder</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Subject (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Maths, Physics, English"
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
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Description (Optional)
            </label>
            <textarea
              placeholder="Add notes about this event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                minHeight: '80px',
                resize: 'vertical'
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
              {loading ? 'Creating...' : 'Add Event'}
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
