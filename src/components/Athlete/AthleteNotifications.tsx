import React, { useState } from 'react';
import { Bell, Check, Clock, CheckSquare, Trash2 } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import type { Athlete } from '../../types';

interface AthleteNotificationsProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteNotifications({ onNotify }: AthleteNotificationsProps) {
  const athlete = useAppSelector((state) => state.auth.athlete);
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

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    onNotify('Notification removed', 'info');
  };

  const getNotifStyle = (type: string, read: boolean): React.CSSProperties => {
    let border = 'rgba(226, 232, 240, 0.8)';
    let bg = '#FFFFFF';
    if (!read) {
      bg = '#F8FAFC';
      if (type === 'success') border = '#4ADE80';
      else if (type === 'warning') border = '#FBBF24';
      else if (type === 'info') border = '#60A5FA';
    }
    return {
      borderLeft: `4px solid ${border}`,
      background: bg,
      boxShadow: !read ? '0 4px 12px rgba(11,87,142,0.04)' : 'none'
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-[1.4rem] font-extrabold text-text-heading">
            Notification Feed
          </h3>
          <p className="text-[0.85rem] text-text-muted mt-1">
            Real-time feed displaying competition updates, entry approvals, and EAF announcements.
          </p>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button 
            className="btn-gov-secondary text-[0.82rem] flex items-center gap-1.5"
            onClick={handleMarkAllRead}
          >
            <CheckSquare size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="max-w-[800px]">
        {notifications.length === 0 ? (
          <div className="text-center px-6 py-[60px] bg-white rounded-[16px] border border-border-card">
            <Bell size={40} color="#CBD5E1" className="mb-3" />
            <p className="font-bold text-text-muted">You have no notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-[18px] rounded-xl border border-border-card mb-3 flex justify-between items-center gap-4 transition-all duration-200" style={getNotifStyle(n.type, n.read)}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-[0.95rem] font-extrabold text-text-heading">
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ 
                        background: n.type === 'success' ? '#16A34A' : n.type === 'warning' ? '#D97706' : '#2563EB' 
                      }} 
                    />
                  )}
                  <span className="text-[0.72rem] text-text-muted flex items-center gap-1 ml-auto">
                    <Clock size={11} /> {n.date}
                  </span>
                </div>
                <p className="text-[0.84rem] text-text-body leading-[1.4]">
                  {n.message}
                </p>
              </div>

              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleToggleRead(n.id)}
                  className="border-0 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center"
                  style={{
                    background: n.read ? '#F1F5F9' : 'rgba(11,87,142,0.08)',
                    color: n.read ? 'var(--text-muted)' : 'var(--primary)'
                  }}
                  title={n.read ? "Mark as unread" : "Mark as read"}
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(n.id)}
                  className="bg-[#FEF2F2] border-0 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-[#EF4444]"
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
