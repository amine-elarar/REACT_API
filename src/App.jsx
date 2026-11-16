
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  function handleLogin(userData, userToken) {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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

