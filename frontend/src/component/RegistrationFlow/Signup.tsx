import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded'

type SignupPageProps = {
  brandName?: string
  onBackToHome: () => void
  onBookNow?: () => void
  onLogin?: () => void
}

function SignupPage({ brandName, onBackToHome, onBookNow, onLogin }: SignupPageProps) {
  return (
    <div className="portal-page-wrap login-popup-wrap">
      <section className="section login-popup-container">
        <div className="portal-content-card portal-login-card login-popup-card">
          <button
            type="button"
            className="login-close-btn"
            aria-label="Close signup popup"
            onClick={onBackToHome}
          >
            <CloseRoundedIcon fontSize="small" />
          </button>

          <div className="login-popup-icon" aria-hidden="true">
            <AutoAwesomeOutlinedIcon fontSize="small" />
          </div>
          <h1>Create Account</h1>
          <p className="login-popup-subtitle">Join us and discover your cosmic path</p>

          <form className="portal-login-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="fullName">Full Name</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><PersonOutlineRoundedIcon fontSize="small" /></span>
              <input id="fullName" type="text" placeholder="Enter your full name" />
            </div>

            <label htmlFor="signupEmail">Email Address</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><AlternateEmailRoundedIcon fontSize="small" /></span>
              <input id="signupEmail" type="email" placeholder="you@example.com" />
            </div>

            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><PhoneIphoneRoundedIcon fontSize="small" /></span>
              <input id="phoneNumber" type="tel" placeholder="+91 98765 43210" />
            </div>

            <label htmlFor="signupPassword">Password</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><LockOutlinedIcon fontSize="small" /></span>
              <input id="signupPassword" type="password" placeholder="••••••••" />
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="login-input-wrap">
              <span aria-hidden="true"><LockOutlinedIcon fontSize="small" /></span>
              <input id="confirmPassword" type="password" placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn">
              Sign Up
            </button>

            <div className="login-divider" aria-hidden="true">
              <span>or</span>
            </div>

            <p className="login-popup-footer-note">
              Already have an account?{' '}
              <button type="button" className="login-link-btn" onClick={onLogin}>
                Sign In
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

export default SignupPage