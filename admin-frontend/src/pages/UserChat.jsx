import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import socket from '../sockets/socket';
import ChatWindow from '../components/ChatWindow';

export default function UserChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || role !== 'user' || !storedUser) {
      navigate('/');
      return;
    }

    setUser(storedUser);

    const userRoom = String(storedUser._id || storedUser.id);
    const joinUserRoom = () => {
      socket.emit('user:join', userRoom);
    };

    socket.on('connect', joinUserRoom);
    if (socket.connected) {
      joinUserRoom();
    }

    const loadMessages = async () => {
      try {
        const res = await api.get('/chat/my-messages/' + (user._id || user.id));
        setMessages(res.data);
      } catch (err) {
        setError('Unable to load chat.');
      }
    };

    loadMessages();
    const handleMessageReceive = (msg) => {
      console.log('Received message:', msg);
      setMessages((prev) => {
        const isDuplicate = prev.some((item) => item._id === msg._id);
        return isDuplicate ? prev : [...prev, msg];
      });
    };

    socket.on('message:receive', handleMessageReceive);

    return () => {
      socket.off('connect', joinUserRoom);
      socket.off('message:receive', handleMessageReceive);
    };
  }, [navigate]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
          console.log('Sending message:', newMessage);

      const res = await api.post('/chat/send', {
        message: newMessage.trim(),
        id: user._id || user.id
      });

      setMessages((prev) => {
        const isDuplicate = prev.some((item) => item._id === res.data._id);
        return isDuplicate ? prev : [...prev, res.data];
      });
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send message.');
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
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 rounded-[32px] border border-slate-800 bg-slate-900/90 px-6 py-5 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">User chat</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Chat with Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {user
                ? `Welcome ${user.name || user.email}. Send a message to connect with the admin in real time.`
                : 'Loading your chat...'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <ChatWindow
          selectedUser={user?.name || 'Admin'}
          selectedUserLabel="Admin"
          messages={messages}
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSend={sendMessage}
          onLogout={handleLogout}
          loading={loading}
        />

        {error && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
