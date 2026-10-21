import React, { useState, useEffect } from 'react';
import { useGetAthleteNotificationsQuery } from '../../store/api/athleteApi';
import { Bell, Clock } from 'lucide-react';

interface AthleteNotificationsProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AthleteNotifications(_props: AthleteNotificationsProps) {
  const { data: backendNotifs = [] } = useGetAthleteNotificationsQuery(undefined, { pollingInterval: 4000 });
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    setNotifications((backendNotifs || []).map((item: any) => ({
      id: item.id,
      title: item.title || 'Notification',
      message: item.message || '',
      date: item.date || item.createdAt || 'Date not recorded',
      type: item.type || 'info',
      read: Boolean(item.read),
    })));
  }, [backendNotifs]);

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


            </div>
          ))
        )}
      </div>
    </div>
  );
}
