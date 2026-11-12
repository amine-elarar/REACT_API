
import { useState } from 'react'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password.trim()) {
            setError('Email and Password are required')
            return
        }

        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email')
            return
        }

        if (password.length < 6) {
            setError('Password must contain at least 6 characters')
            return
        }

        try {
            const response = await fetch('http://13.48.171.128/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Login failed')
                return
            }

            console.log('Login successful:', data)
            console.log('Token:', data.token)

        } catch (error) 
        {
            setError('Cannot connect to server')
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login
