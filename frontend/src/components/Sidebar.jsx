function formatDate(isoString) {
  const d = new Date(isoString)
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function Sidebar({ conversations, currentConvId, onSelect, onDelete, onNew, onClose }) {
  return (
    <>
      <div className="sidebar-backdrop" onClick={onClose} />
      <div className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Conversations</span>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        <button className="new-conv-btn" onClick={onNew}>+ Nouvelle conversation</button>

        <div className="sidebar-list">
          {conversations.length === 0 && (
            <p className="sidebar-empty">Aucune conversation</p>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`sidebar-item ${conv.id === currentConvId ? 'active' : ''}`}
              onClick={() => onSelect(conv)}
            >
              <span className="sidebar-date">{formatDate(conv.created_at)}</span>
              <button
                className="sidebar-delete"
                onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                title="Supprimer"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
