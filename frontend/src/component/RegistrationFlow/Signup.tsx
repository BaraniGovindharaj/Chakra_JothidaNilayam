import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded'
import { Box, IconButton, TextField, Typography } from '@mui/material'
import CommonButton from '../ReusableButton/CommonButton'

type SignupPageProps = {
  brandName?: string
  onBackToHome: () => void
  onBookNow?: () => void
  onLogin?: () => void
}

function SignupPage({ brandName, onBackToHome, onBookNow, onLogin }: SignupPageProps) {
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

          <Box component="form" className="portal-login-form" onSubmit={(event) => event.preventDefault()}>
            <Typography component="label" htmlFor="fullName">Full Name</Typography>
            <Box className="login-input-wrap">
              <Typography component="span" aria-hidden="true"><PersonOutlineRoundedIcon fontSize="small" /></Typography>
              <TextField
                id="fullName"
                type="text"
                placeholder="Enter your full name"
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
                type="email"
                placeholder="you@example.com"
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
                type="tel"
                placeholder="+91 98765 43210"
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
                type="password"
                placeholder="••••••••"
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
                type="password"
                placeholder="••••••••"
                variant="standard"
                fullWidth
                slotProps={{
                  input: { disableUnderline: true },
                }}
              />
            </Box>

            <CommonButton type="submit" className="btn btn-primary login-submit-btn">
              Sign Up
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