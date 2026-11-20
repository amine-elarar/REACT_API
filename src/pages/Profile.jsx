
import { useState } from 'react'

function Profile({ token }) {
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function getProfile()
    {
        setLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/profiles/me`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Failed to load profile')
                return
            }

            setProfile(data)

        } catch (error){
            setError('Cannot connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>My Profile</h1>
            
            <button onClick={getProfile} disabled={loading}>
                {loading ? 'Loading...' : 'Get Profile'}
            </button>

            {error && <p>{error}</p>}

            {profile && (
                <pre>{JSON.stringify(profile, null, 2)}</pre>
            )}
        </div>
    )
}

export default Profile
