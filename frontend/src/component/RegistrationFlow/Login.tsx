import React from 'react';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, IconButton, TextField, Typography } from '@mui/material'
import CommonButton from '../ReusableButton/CommonButton'
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
    <Box className="portal-page-wrap login-popup-wrap">
      <Box component="section" className="section login-popup-container">
        <Box className="portal-content-card portal-login-card login-popup-card">
          <IconButton
            className="login-close-btn"
            aria-label="Close login popup"
            onClick={onBackToHome}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          <Box className="login-popup-icon" aria-hidden="true">
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </Box>
          <Typography component="h1" variant="h1">Welcome Back</Typography>
          <Typography component="p" className="login-popup-subtitle">Sign in to access your account</Typography>

          <Box component="form" className="portal-login-form" onSubmit={handleSubmit}>
            <Typography component="label" htmlFor="email">Email Address</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><AlternateEmailRoundedIcon fontSize="small" /></Typography>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                }}
              />
            </Box>

            <Typography component="label" htmlFor="password">Password</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><LockOutlinedIcon fontSize="small" /></Typography>
              <TextField
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                }}
              />
            </Box>
            <CommonButton type="submit" className="btn btn-primary login-submit-btn">
              Sign In
            </CommonButton>

            <Box className="login-divider" aria-hidden="true">
              <Typography component="span">or</Typography>
            </Box>

            <Typography component="p" className="login-popup-footer-note">
              Don&apos;t have an account?{' '}
              <span className="login-link-btn" onClick={onSignup}>
                Sign Up
              </span>
            </Typography>

            <Typography component="p" className="login-popup-footer-note">
              Need a session with {brandName || 'Sri Astrology'}?{' '}
              <CommonButton onClick={onBookNow}>
                Book Consultation
              </CommonButton>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
