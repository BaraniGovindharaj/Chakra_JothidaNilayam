import React from 'react'
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded'
import { Box, IconButton, TextField, Typography } from '@mui/material'
import CommonButton from '../ReusableButton/CommonButton'
import { apiPost } from '../../services/apiHandler'
import showToast from '../Toast/Toast'

type SignupPageProps = {
  brandName?: string
  onBackToHome: () => void
  onBookNow?: () => void
  onLogin?: () => void
  onVerifyOtp?: (phoneNumber: string) => void
}

function SignupPage({ brandName, onBackToHome, onBookNow, onLogin, onVerifyOtp }: SignupPageProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const registerUser = async () => {
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
      showToast('Please fill in all fields.', 'warning')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'warning')
      return
    }
    setIsLoading(true)
    try {
      const response: any = await apiPost('/api/v1/register', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      })
      showToast(response?.message || 'OTP sent to your phone!', 'success')
      onVerifyOtp?.(formData.phoneNumber)
    } catch (error: any) {
      showToast(error?.message || 'Registration failed.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await registerUser()
  }

  return (
    <Box className="portal-page-wrap login-popup-wrap">
      <Box component="section" className="section login-popup-container">
        <Box className="portal-content-card portal-login-card login-popup-card">
          <IconButton
            className="login-close-btn"
            aria-label="Close signup popup"
            onClick={onBackToHome}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          <Box className="login-popup-icon" aria-hidden="true">
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </Box>
          <Typography component="h1" variant="h1">Create Account</Typography>
          <Typography component="p" className="login-popup-subtitle">Join us and discover your cosmic path</Typography>

          <Box component="form" className="portal-login-form" onSubmit={handleSubmit}>
            <Typography component="label" htmlFor="fullName">Full Name</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><PersonOutlineRoundedIcon fontSize="small" /></Typography>
              <TextField
                id="fullName"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                }}
              />
            </Box>

            <Typography component="label" htmlFor="signupEmail">Email Address</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><AlternateEmailRoundedIcon fontSize="small" /></Typography>
              <TextField
                id="signupEmail"
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

            <Typography component="label" htmlFor="phoneNumber">Phone Number</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><PhoneIphoneRoundedIcon fontSize="small" /></Typography>
              <TextField
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                }}
              />
            </Box>

            <Typography component="label" htmlFor="signupPassword">Password</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><LockOutlinedIcon fontSize="small" /></Typography>
              <TextField
                id="signupPassword"
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

            <Typography component="label" htmlFor="confirmPassword">Confirm Password</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><LockOutlinedIcon fontSize="small" /></Typography>
              <TextField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                }}
              />
            </Box>

            <CommonButton type="submit" className="btn btn-primary login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account…' : 'Sign Up'}
            </CommonButton>

            <Box className="login-divider" aria-hidden="true">
              <Typography component="span">or</Typography>
            </Box>

            <Typography component="p" className="login-popup-footer-note">
              Already have an account?{' '}
              <span className="login-link-btn" onClick={onLogin}>
                Sign In
              </span>
            </Typography>

            <Typography component="p" className="login-popup-footer-note">
              Need a session with {brandName || 'Sri Astrology'}?{' '}
              <CommonButton className="login-link-btn" onClick={onBookNow}>
                Book Consultation
              </CommonButton>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default SignupPage