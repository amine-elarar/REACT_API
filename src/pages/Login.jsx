import { useState } from 'react'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe obligatoires.')
      return
    }

    setLoading(true)

    try {
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        setError(loginData.message || 'Identifiants incorrects.')
        return
      }

      const token = loginData.token

      const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/profiles/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const profileData = await profileResponse.json()

      if (!profileResponse.ok) {
        setError('Impossible de récupérer le profil.')
        return
      }

      const user = profileData.data.user
      onLoginSuccess(user, token)

    } catch (err) {
      setError('Impossible de se connecter au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#38BDF8' }}>Connexion LMS</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={{ color: '#F87171', fontSize: '13px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
