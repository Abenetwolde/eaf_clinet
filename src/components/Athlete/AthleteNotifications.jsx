import React, { useState } from 'react';
import { Bell, Check, Clock, CheckSquare, Trash2 } from 'lucide-react';

export default function AthleteNotifications({ athlete, onNotify }) {
  const [notifications, setNotifications] = useState(athlete.notifications || [
    {
      id: "notif-1",
      title: "Registration Approved",
      message: "Your application for the 5,000m event at Addis Ababa International Grand Prix 2026 has been approved. Your Bib number will be assigned soon.",
      date: "2026-07-28",
      type: "success",
      read: false
    },
    {
      id: "notif-2",
      title: "License Renewed Successfully",
      message: "Your annual EAF license (EAF-LIC-2026-8891) is active and valid until Dec 31, 2026.",
      date: "2026-07-20",
      type: "info",
      read: true
    },
    {
      id: "notif-3",
      title: "Geofence Check-in Reminder",
      message: "Friendly reminder: GPS-based Call Room check-in opens 2 hours before the start of the 5,000m event.",
      date: "2026-07-19",
      type: "warning",
      read: true
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onNotify('All notifications marked as read', 'success');
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    onNotify('Notification removed', 'info');
  };

  const getNotifStyle = (type, read) => {
    let border = 'rgba(226, 232, 240, 0.8)';
    let bg = '#FFFFFF';
    if (!read) {
      bg = '#F8FAFC';
      if (type === 'success') border = '#4ADE80';
      else if (type === 'warning') border = '#FBBF24';
      else if (type === 'info') border = '#60A5FA';
    }
    return {
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid var(--border-card)',
      borderLeft: `4px solid ${border}`,
      background: bg,
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.2s',
      boxShadow: !read ? '0 4px 12px rgba(11,87,142,0.04)' : 'none'
    };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            Notification Feed
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time feed displaying competition updates, entry approvals, and EAF announcements.
          </p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            className="btn-gov-secondary"
            style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleMarkAllRead}
          >
            <CheckSquare size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ maxWidth: '800px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
            <Bell size={40} color="#CBD5E1" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>You have no notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} style={getNotifStyle(n.type, n.read)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: n.type === 'success' ? '#16A34A' : n.type === 'warning' ? '#D97706' : '#2563EB' 
                      }} 
                    />
                  )}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <Clock size={11} /> {n.date}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
                  {n.message}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => handleToggleRead(n.id)}
                  style={{
                    background: n.read ? '#F1F5F9' : 'rgba(11,87,142,0.08)',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: n.read ? 'var(--text-muted)' : 'var(--primary)'
                  }}
                  title={n.read ? "Mark as unread" : "Mark as read"}
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(n.id)}
                  style={{
                    background: '#FEF2F2',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444'
                  }}
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
