export default function ChatSidebar({ conversations, selectedUser, onSelect }) {
  return (
    <aside className="bg-slate-900/90 border-r border-slate-800 p-4 sm:p-6 w-full max-w-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Conversations</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Active users</h2>
        </div>
      </div>

      <div className="space-y-3">
        {conversations.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-400">
            No conversations yet. Reload the page or wait for users to send messages.
          </div>
        ) : (
          conversations.map((conversation) => {
            const userId = String(conversation._id);
            const isActive = selectedUser === userId;
            return (
              <button
                key={userId}
                onClick={() => onSelect(userId)}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-600 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">User {userId.slice(-6)}</p>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                      {conversation.latestMessage || 'No message yet'}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 ? (
                    <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-semibold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : (
                    <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-slate-800 px-2 text-xs font-medium text-slate-400">
                      {conversation.messagesCount || 'OK'}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
