import { useEffect, useState } from 'react'

export default function Liseuse() {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('Chargement…')

  useEffect(() => {
    fetch('/mock/chapters/tale1/1.json')
      .then((response) => response.json())
      .then((data) => {
        setContent(JSON.stringify(data, null, 2))
        setStatus('JSON chargé, modifiable localement')
      })
      .catch(() => setStatus('Erreur lors du chargement'))
  }, [])

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content)
      setContent(JSON.stringify(parsed, null, 2))
      setStatus('JSON valide reformatté')
    } catch {
      setStatus('JSON invalide, vérifiez la syntaxe')
    }
  }

  return (
    <section className="page-section liseuse">
      <h1>Liseuse</h1>
      <p>
        Le fichier est chargé depuis <code>/mock/chapters/tale1/1.json</code>. Les modifications restent locales pour le
        moment.
      </p>
      <textarea
        className="liseuse-editor"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={20}
        spellCheck={false}
      />
      <div className="liseuse-actions">
        <button type="button" className="link-btn" onClick={handleFormat}>
          Reformater le JSON
        </button>
        <span className="liseuse-status">{status}</span>
      </div>
    </section>
  )
}
