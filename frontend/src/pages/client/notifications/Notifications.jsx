import React, { useEffect, useState } from 'react';
import UserDrawer from '../../client/components/UserDrawer';
import { getMyNotifications, deleteNotification, markNotificationRead } from '../../../api/notificationApi';

const Notifications = () => {
  const [notes, setNotes] = useState([]);

  const fetch = async () => {
    try {
      const res = await getMyNotifications();
      setNotes(res || []);
    } catch (err) {
      console.error('Failed to load notifications', err.message);
    }
  };

  useEffect(() => { fetch(); }, []);

  // When this page mounts, mark all unread notifications as read
  useEffect(() => {
    const markAllRead = async () => {
      // clear badge immediately (optimistic)
      window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { unread: 0 } }));
      try {
        const res = await getMyNotifications();
        const unread = (res || []).filter(n => !n.read);
        if (unread.length > 0) {
          await Promise.all(unread.map(n => markNotificationRead(n._id)));
          // refresh list
          const refreshed = await getMyNotifications();
          setNotes(refreshed || []);
          // ensure sidebar has correct count from server
          const finalUnread = (refreshed || []).filter(x => !x.read).length;
          window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { unread: finalUnread } }));
        }
      } catch (err) {
        console.error('Failed to mark all read', err.message);
      }
    };
    markAllRead();
  }, []);

  return (
    <UserDrawer>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {notes.length === 0 ? (
          <div className="text-gray-600">No notifications</div>
        ) : (
          <ul className="space-y-3">
            {notes.map(n => (
              <li key={n._id} className="p-4 bg-white rounded shadow-sm flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                  <div className="font-semibold">{n.title} {n.read ? null : <span className="text-xs bg-red-200 px-2 py-0.5 rounded ml-2">New</span>}</div>
                  <div className="text-sm text-gray-700 mt-1">{n.message}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {!n.read && (
                    <button className="text-blue-600 text-sm" onClick={async () => {
                      try {
                        await markNotificationRead(n._id);
                        // refresh server state and local list, then notify sidebar
                        const remaining = await getMyNotifications();
                        setNotes(remaining || []);
                        const unread = (remaining || []).filter(x => !x.read).length;
                        window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { unread } }));
                      } catch (err) { console.error(err); }
                    }}>Mark read</button>
                  )}
                  <button className="text-red-600 text-sm" onClick={async () => {
                    try {
                      await deleteNotification(n._id);
                      setNotes(ns => ns.filter(x => x._id !== n._id));
                      // update unread count elsewhere
                      const remaining = (await getMyNotifications()) || [];
                      const unread = remaining.filter(x => !x.read).length;
                      window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: { unread } }));
                    } catch (err) { console.error(err); }
                  }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserDrawer>
  );
};

export default Notifications;
