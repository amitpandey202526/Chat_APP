import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import socket from '../sockets/socket';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';

export default function Dashboard() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchConversations = async () => {
    setError('');

    try {
      const res = await api.get('/admin/conversations');
      setConversations(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load conversations.');
    }
  };

  const fetchConversation = async (userId) => {
    const normalizedUserId = String(userId);
    setError('');

    try {
      setLoading(true);
      const res = await api.get(`/admin/conversations/${normalizedUserId}`);
      setMessages(res.data);
      setSelectedUser(normalizedUserId);
      setConversations((prev) =>
        prev.map((item) => {
          const itemId = String(item._id);
          return itemId === normalizedUserId ? { ...item, unreadCount: 0 } : item;
        })
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load chat.');
      setLoading(false);
      return;
    }

    try {
      await api.patch(`/admin/conversations/${normalizedUserId}/read`);
    } catch (err) {
      console.warn('Could not mark messages read:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomingMessage = useCallback(
    (msg) => {
      const messageUserId = String(msg.userId);

      setConversations((prev) => {
        const existing = prev.find((item) => String(item._id) === messageUserId);
        if (existing) {
          return prev.map((item) => {
            const itemId = String(item._id);
            return itemId === messageUserId
              ? {
                  ...item,
                  latestMessage: msg.message,
                  unreadCount: itemId === selectedUser ? 0 : item.unreadCount + 1
                }
              : item;
          });
        }

        return [
          {
            _id: messageUserId,
            latestMessage: msg.message,
            unreadCount: selectedUser === messageUserId ? 0 : 1
          },
          ...prev
        ];
      });

      if (selectedUser === messageUserId) {
        setMessages((prev) => {
          const isDuplicate = prev.some((item) => item._id === msg._id);
          return isDuplicate ? prev : [...prev, msg];
        });
      }
    },
    [selectedUser]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      navigate('/');
      return;
    }

    socket.emit('admin:join');
    fetchConversations();
    socket.on('message:receive', handleIncomingMessage);

    return () => {
      socket.off('message:receive', handleIncomingMessage);
    };
  }, [handleIncomingMessage, navigate]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) {
      return;
    }

    const normalizedUserId = String(selectedUser);
    setError('');

    try {
      setLoading(true);
      const res = await api.post(`/admin/conversations/${normalizedUserId}/reply`, {
        message: newMessage.trim()
      });
      setMessages((prev) => {
        const isDuplicate = prev.some((item) => item._id === res.data._id);
        return isDuplicate ? prev : [...prev, res.data];
      });
      setNewMessage('');
      setConversations((prev) =>
        prev.map((item) => {
          const itemId = String(item._id);
          return itemId === normalizedUserId ? { ...item, latestMessage: res.data.message } : item;
        })
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to send reply.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 rounded-[32px] border border-slate-800 bg-slate-900/90 px-6 py-5 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Admin panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Customer Chat Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Select a user to view the conversation, reply instantly, and monitor unread messages in real time.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <main className="grid flex-1 gap-6 xl:grid-cols-[320px_1fr]">
          <ChatSidebar conversations={conversations} selectedUser={selectedUser} onSelect={fetchConversation} />
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSend={sendReply}
            onLogout={handleLogout}
            loading={loading}
          />
        </main>

        {error && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
