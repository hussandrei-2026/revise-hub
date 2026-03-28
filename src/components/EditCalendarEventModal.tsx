import React, { useState } from 'react';
import { firestoreService } from '../services/firestore.service';

interface EditCalendarEventModalProps {
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string | Date;
  eventType: 'exam' | 'revision' | 'pastpaper' | 'note';
  eventSubject?: string;
  eventDescription?: string;
  onClose: () => void;
  onEventUpdated: () => void;
}

export const EditCalendarEventModal: React.FC<EditCalendarEventModalProps> = ({ 
  userId,
  eventId,
  eventTitle,
  eventDate,
  eventType,
  eventSubject = '',
  eventDescription = '',
  onClose, 
  onEventUpdated 
}) => {
  const [title, setTitle] = useState(eventTitle);
  const [date, setDate] = useState(
    eventDate instanceof Date 
      ? eventDate.toISOString().split('T')[0]
      : typeof eventDate === 'string'
        ? eventDate
        : ''
  );
  const [type, setType] = useState<'exam' | 'revision' | 'pastpaper' | 'note'>(eventType);
  const [subject, setSubject] = useState(eventSubject);
  const [description, setDescription] = useState(eventDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build update data with only the fields we want to update
      const updateData: any = {
        title,
        type
      };

      // Add date if provided
      if (date) {
        updateData.date = new Date(date);
      }

      // Add optional fields only if they have values
      if (subject.trim()) {
        updateData.subject = subject;
      }

      if (description.trim()) {
        updateData.description = description;
      }

      // ACTUALLY SAVE TO FIRESTORE
      console.log('Updating event in Firestore:', { eventId, updateData });
      await firestoreService.updateCalendarEvent(userId, eventId, updateData);
      
      console.log('Event updated successfully');
      onEventUpdated(); // This reloads the calendar
      onClose();
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update event');
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
      console.log('Deleting event from Firestore:', eventId);
      await firestoreService.deleteCalendarEvent(userId, eventId);
      
      console.log('Event deleted successfully');
      onEventUpdated(); // This reloads the calendar
      onClose();
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message || 'Failed to delete event');
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
        <h2>✏️ Edit Calendar Event</h2>
        
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
              {loading ? '⏳ Updating...' : '✓ Update Event'}
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
            🗑️ Delete Event
          </button>
        </form>
      </div>
    </div>
  );
};
