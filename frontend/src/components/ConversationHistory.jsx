function CopyBtn({ text }) {
  return (
    <button
      className="copy-btn"
      onClick={() => navigator.clipboard.writeText(text)}
      title="Copier"
    >
      📋
    </button>
  )
}

const LABELS = {
  th: '🇹🇭 Thaï',
  fr: '🇫🇷 Français',
}

export default function ConversationHistory({ history, primaryLang, onClear }) {
  const secondaryLang = primaryLang === 'th' ? 'fr' : 'th'

  return (
    <div className="history">
      <div className="history-col-headers">
        <span>{LABELS[primaryLang]}</span>
        <span>{LABELS[secondaryLang]}</span>
      </div>

      {history.map(entry => {
        // Text in primary language → left column
        // Text in secondary language → right column
        const leftText = entry.sourceLang === primaryLang
          ? entry.sourceText
          : entry.targetText
        const rightText = entry.sourceLang === secondaryLang
          ? entry.sourceText
          : entry.targetText
        // White = what the user typed (source), gray = translation
        const leftIsSource = entry.sourceLang === primaryLang

        return (
          <div key={entry.id} className="history-entry">
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

      <div className="history-footer">
        <button className="clear-btn" onClick={onClear}>
          🗑 Effacer l'historique
        </button>
      </div>
    </div>
  )
}
