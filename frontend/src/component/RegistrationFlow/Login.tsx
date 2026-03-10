import React from 'react';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { apiPost } from '../../services/apiHandler';
import { useUser } from '../../context/userProvider'
type LoginPageProps = {
  brandName?: string
  onBackToHome: () => void
  onBookNow?: () => void
  onSignup?: () => void
}

function LoginPage({ brandName, onBackToHome, onBookNow, onSignup }: LoginPageProps) {
  const [formData, setFormData] = React.useState({ email: '', password: '' })
  const { setUserFromLogin, setActivePage} = useUser()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const userLogin = async () => {
    try {
      const response:any = await apiPost('/api/v1/login', formData)
      console.log('Login response:', response)
      setUserFromLogin(response?.data || {})
      setActivePage('portal')
      alert('Login successful!')
    } catch (error) {
      alert('Login failed. Please check your credentials and try again.')
      console.error('Login error:', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await userLogin()
  }

  return (
    <div className="portal-page-wrap login-popup-wrap">
      <section className="section login-popup-container">
        <div className="portal-content-card portal-login-card login-popup-card">
          <button
            type="button"
            className="login-close-btn"
            aria-label="Close login popup"
            onClick={onBackToHome}
          >
            <CloseRoundedIcon fontSize="small" />
          </button>

          <div className="login-popup-icon" aria-hidden="true">
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </div>
          <h1>Welcome Back</h1>
          <p className="login-popup-subtitle">Sign in to access your account</p>

          <form className="portal-login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><AlternateEmailRoundedIcon fontSize="small" /></span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><LockOutlinedIcon fontSize="small" /></span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary login-submit-btn">
              Sign In
            </button>

            <div className="login-divider" aria-hidden="true">
              <span>or</span>
            </div>

            <p className="login-popup-footer-note">
              Don&apos;t have an account?{' '}
              <button type="button" className="login-link-btn" onClick={onSignup}>
                Sign Up
              </button>
            </p>

            <p className="login-popup-footer-note">
              Need a session with {brandName || 'Sri Astrology'}?{' '}
              <button type="button" className="login-link-btn" onClick={onBookNow}>
                Book Consultation
              </button>
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
