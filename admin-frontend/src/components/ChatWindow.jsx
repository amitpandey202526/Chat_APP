export default function ChatWindow({ selectedUser, selectedUserLabel, messages, newMessage, onMessageChange, onSend, onLogout, loading }) {
  const chatTitle = selectedUserLabel ?? (selectedUser ? `User ${selectedUser.slice(-6)}` : 'Select a user');

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/90 shadow-2xl shadow-slate-950/40">
      <div className="border-b border-slate-800 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Conversation</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{chatTitle}</h1>
          </div>
          {/* <button
            onClick={onLogout}
            className="mt-4 inline-flex items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 sm:mt-0"
          >
            Logout1
          </button> */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {selectedUser ? (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-6 text-center text-slate-400">
                Chat is empty. Send a message to start the conversation.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-6 shadow-sm ${
                      msg.senderType === 'admin'
                        ? 'bg-indigo-500/15 text-white backdrop-blur'
                        : 'bg-slate-900 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className="mt-2 text-right text-[11px] uppercase tracking-[0.24em] text-slate-500">
                      {msg.senderType === 'admin' ? 'You' : 'Customer'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
            <div>
              <p className="text-lg font-semibold text-slate-100">Pick a conversation from the left</p>
              <p className="mt-2 text-sm text-slate-400">Then reply instantly using the chat form below.</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSend} className="border-t border-slate-800 bg-slate-950/95 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={selectedUser ? 'Type your reply...' : 'Select a conversation first'}
            disabled={!selectedUser || loading}
            className="min-w-0 flex-1 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!selectedUser || !newMessage.trim() || loading}
            className="inline-flex items-center justify-center rounded-3xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? 'Sending...' : 'Send reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
