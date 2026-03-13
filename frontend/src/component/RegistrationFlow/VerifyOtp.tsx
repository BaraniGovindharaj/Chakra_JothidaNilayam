import React from 'react'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, IconButton, TextField, Typography } from '@mui/material'
import CommonButton from '../ReusableButton/CommonButton'
import { apiPost } from '../../services/apiHandler'
import { useUser } from '../../context/userProvider'
import showToast from '../Toast/Toast'

type VerifyOtpPageProps = {
  phoneNumber: string
  onBackToHome: () => void
  onSignup?: () => void
}

const maskPhoneNumber = (phone: string): string => {
  // E.164 format e.g. +917402645726
  // Show first 3 and last 4 digits, mask the rest
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return phone
  const prefix = phone.startsWith('+') ? '+' : ''
  const countryCode = digits.slice(0, digits.length - 10) // e.g. "91"
  const local = digits.slice(digits.length - 10)           // 10-digit local
  const masked = local.slice(0, 2) + 'XXXXXX' + local.slice(-2)
  return `${prefix}${countryCode} ${masked}`
}

function VerifyOtpPage({ phoneNumber, onBackToHome, onSignup }: VerifyOtpPageProps) {
  const [otp, setOtp] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const { setActivePage } = useUser()

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      showToast('Please enter the 6-digit OTP.', 'warning')
      return
    }
    setIsLoading(true)
    try {
      const response: any = await apiPost('/api/v1/verify-otp', { phoneNumber, otp })
      showToast(response?.message || 'OTP verified successfully!', 'success')
      setActivePage('login')
    } catch (error: any) {
      showToast(error?.message || 'Invalid or expired OTP.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await verifyOtp()
  }

  return (
    <Box className="portal-page-wrap login-popup-wrap">
      <Box component="section" className="section login-popup-container">
        <Box className="portal-content-card portal-login-card login-popup-card">
          <IconButton
            className="login-close-btn"
            aria-label="Close OTP popup"
            onClick={onBackToHome}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          <Box className="login-popup-icon" aria-hidden="true">
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </Box>

          <Typography component="h1" variant="h1">Verify OTP</Typography>
          <Typography component="p" className="login-popup-subtitle">
            Enter the 6-digit code sent to{' '}
            <strong>{maskPhoneNumber(phoneNumber)}</strong>
          </Typography>

          <Box component="form" className="portal-login-form" onSubmit={handleSubmit}>
            <Typography component="label" htmlFor="otp">One-Time Password</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true">
                <LockOutlinedIcon fontSize="small" />
              </Typography>
              <TextField
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                variant="standard"
                fullWidth
                slotProps={{
                  input: {
                    disableUnderline: true,
                    inputProps: { maxLength: 6, style: { letterSpacing: '0.3em', fontWeight: 600 } },
                  },
                }}
              />
            </Box>

            <CommonButton
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying…' : 'Verify OTP'}
            </CommonButton>

            <Box className="login-divider" aria-hidden="true">
              <Typography component="span">or</Typography>
            </Box>

            <Typography component="p" className="login-popup-footer-note">
              Entered the wrong number?{' '}
              <span className="login-link-btn" onClick={onSignup}>
                Go back to Sign Up
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default VerifyOtpPage
