import { useState } from 'react'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email et mot de passe sont obligatoires.')
      return
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }

    if (trimmedPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }

    setLoading(true)

    try {
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        setError(loginData.message || 'Identifiants invalides.')
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
        setError('Impossible de récupérer le profil utilisateur.')
        return
      }

      const user = profileData.data.user
      onLoginSuccess(user, token)

    } catch (err) {
      setError('Impossible de se connecter au serveur backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '440px', margin: '70px auto 0' }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#F8FAFC', marginBottom: '8px' }}>
            Portail LMS
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.9)' }}>
            Accédez à votre espace sécurisé
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>
              Adresse Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin.demo@example.test"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '12px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              borderColor: '#818CF8',
              color: '#FFFFFF',
              fontWeight: '600'
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
