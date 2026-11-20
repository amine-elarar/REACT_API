import { useState } from 'react'
import Login from './pages/Login'
import AdminLayout from './pages/admin/AdminLayout'
import LearnerLayout from './pages/learner/LearnerLayout'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  function handleLoginSuccess(userData, userToken) {
    setUser(userData)
    setToken(userToken)
  }

  function handleLogout() {
    setUser(null)
    setToken(null)
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (user.role === 'admin') {
    return <AdminLayout user={user} token={token} onLogout={handleLogout} />
  }

  if (user.role === 'learner') {
    return <LearnerLayout user={user} token={token} onLogout={handleLogout} />
  }

  return (
    <div>
      <p>Rôle non reconnu: {user.role}</p>
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  )
}

export default App
