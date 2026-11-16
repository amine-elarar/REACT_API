import { useState } from 'react'
import Login from './pages/Login'

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

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default App
