
import { useState } from 'react'
import Login from './pages/Login'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  function handleLogin(userData, userToken) {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome {user.name}</h1>
          <button onClick={handleLogout}>Logout</button>
          <Profile token={token} />
        </div>
      ) : (
        <Login routeLogin={handleLogin} />
      )}
    </div>
  )
}

export default App

