import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  RiCalendarEventLine, RiUserUnfollowLine,
  RiSpyLine, RiStackLine
} from 'react-icons/ri';

const NotificationContext = createContext();

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'renewal',
    title: 'Upcoming Renewal: Slack',
    desc: 'Slack contract renews in 14 days. Estimated cost: ₹1,20,000.',
    time: '2 hours ago',
    iconName: 'RiCalendarEventLine',
    color: 'amber',
    unread: true,
    actionText: 'Review Contract',
    link: '/renewals'
  },
  {
    id: 2,
    type: 'offboarding',
    title: 'Security Risk: Active Access',
    desc: 'Ex-employee Rohan Mehta still has active access to Salesforce.',
    time: '5 hours ago',
    iconName: 'RiUserUnfollowLine',
    color: 'red',
    unread: true,
    actionText: 'Revoke Access',
    link: '/offboarding'
  },
  {
    id: 3,
    type: 'shadow_it',
    title: 'New Shadow IT Detected',
    desc: 'ChatGPT Plus was detected via expense reports in the Marketing department.',
    time: '1 day ago',
    iconName: 'RiSpyLine',
    color: 'indigo',
    unread: false,
    actionText: 'View Details',
    link: '/shadow-it'
  },
  {
    id: 4,
    type: 'overlap',
    title: 'Tool Overlap Discovered',
    desc: 'Zoom and Google Meet are both heavily used for video conferencing.',
    time: '2 days ago',
    iconName: 'RiStackLine',
    color: 'indigo',
    unread: false,
    actionText: 'See Overlaps',
    link: '/overlaps'
  }
];

export const NotificationProvider = ({ children }) => {
  const { companyId, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Re-map icon strings to actual React components since functions can't be stringified easily
  const getIcon = (name) => {
    switch (name) {
      case 'RiCalendarEventLine': return RiCalendarEventLine;
      case 'RiUserUnfollowLine': return RiUserUnfollowLine;
      case 'RiSpyLine': return RiSpyLine;
      case 'RiStackLine': return RiStackLine;
      default: return RiCalendarEventLine;
    }
  };

  const parsedNotifications = notifications.map(n => ({
    ...n,
    icon: getIcon(n.iconName)
  }));

  const unreadCount = parsedNotifications.filter(n => n.unread).length;

  useEffect(() => {
    if (!isAuthenticated || !companyId) return;

    // Connect to Socket.io server
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true
    });

    setSocket(newSocket);

    // Join company room
    newSocket.on('connect', () => {
      newSocket.emit('join_room', `company_${companyId}`);
    });

    // Listen for notification updates broadcast by other clients in the same room
    newSocket.on('notifications_updated', ({ action, payload }) => {
      if (action === 'mark_all_read') {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      } else if (action === 'toggle_read') {
        setNotifications(prev => prev.map(n => 
          n.id === payload.id ? { ...n, unread: payload.unread } : n
        ));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [companyId, isAuthenticated]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    if (socket && companyId) {
      socket.emit('update_notifications', {
        roomId: `company_${companyId}`,
        action: 'mark_all_read'
      });
    }
  };

  const toggleRead = (id, unreadStatus) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: unreadStatus } : n
    ));
    if (socket && companyId) {
      socket.emit('update_notifications', {
        roomId: `company_${companyId}`,
        action: 'toggle_read',
        payload: { id, unread: unreadStatus }
      });
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications: parsedNotifications, unreadCount, markAllRead, toggleRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
