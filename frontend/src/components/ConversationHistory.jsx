function CopyBtn({ text }) {
  return (
    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(text)} title="Copier">
      📋
    </button>
  )
}

const LABELS = { th: '🇹🇭 Thaï', fr: '🇫🇷 Français' }

export default function ConversationHistory({ messages, primaryLang }) {
  const secondaryLang = primaryLang === 'th' ? 'fr' : 'th'

  return (
    <div className="history">
      <div className="history-col-headers">
        <span>{LABELS[primaryLang]}</span>
        <span>{LABELS[secondaryLang]}</span>
      </div>

      {messages.map(msg => {
        const leftText = msg.source_lang === primaryLang ? msg.source_text : msg.target_text
        const rightText = msg.source_lang === secondaryLang ? msg.source_text : msg.target_text
        const leftIsSource = msg.source_lang === primaryLang

        return (
          <div key={msg.id} className="history-entry">
            <div className={`history-cell ${leftIsSource ? 'cell-source' : 'cell-target'}`}>
              <p>{leftText}</p>
              <CopyBtn text={leftText} />
            </div>
            <div className={`history-cell ${leftIsSource ? 'cell-target' : 'cell-source'}`}>
              <p>{rightText}</p>
              <CopyBtn text={rightText} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
