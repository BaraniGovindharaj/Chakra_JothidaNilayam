import { useState } from 'react';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { useUser } from '../context/userProvider'

type Props = {
  brandName?: string
  navigation?: string[]
  onBookNow?: () => void
  onLogin?: () => void
  onHome?: () => void
}

function Header({ brandName, navigation, onBookNow, onLogin, onHome }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const navItems = navigation?.length ? navigation : ['Home', 'Services', 'About', 'Contact']
  const { isLoggedIn, user, setActivePage, logout } = useUser()
  const avatarInitials = (user?.name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  console.log('Header - isLoggedIn:', isLoggedIn)

  const handleNavClick = () => {
    setIsMenuOpen(false)
    setIsAvatarMenuOpen(false)
  }

  const handleSectionNavigation = (item: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    handleNavClick()

    if (item.toLowerCase() === 'home') {
      onHome?.()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const targetId = item.toLowerCase().replace(/\s+/g, '')
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header className="navbar section">
      <div className="logo">
        <AutoAwesomeOutlinedIcon className="logo-icon" fontSize="small" />
        {brandName || 'Sri Chakra Jothidanilayam'}
      </div>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <CloseRoundedIcon fontSize="small" /> : <MenuRoundedIcon fontSize="small" />}
      </button>
      <div className={`navbar-content ${isMenuOpen ? 'is-open' : ''}`}>
        <nav>
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
              onClick={(event) => handleSectionNavigation(item, event)}
              className="nav-link"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="navbar-actions">
          {!isLoggedIn ? (
            <button
              className="btn btn-secondary"
              onClick={() => {
                handleNavClick()
                onLogin?.()
              }}
            >
              Login
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsAvatarMenuOpen(false)
                setActivePage('portal')
              }}
            >
              Dashboard
            </button>
          )}
          {!isLoggedIn ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                handleNavClick()
                onBookNow?.()
              }}
            >
              Book Consultation
            </button>
          ) : (
            <div className="avatar-menu-wrap">
              <button
                type="button"
                className="avatar avatar-btn"
                aria-label="User Avatar"
                aria-expanded={isAvatarMenuOpen}
                onClick={() => setIsAvatarMenuOpen((open) => !open)}
              >
                <span aria-hidden="true">{avatarInitials || 'US'}</span>
              </button>
              {isAvatarMenuOpen && (
                <div className="avatar-dropdown" role="menu" aria-label="User menu">
                  <button
                    type="button"
                    className="avatar-dropdown-item logout-action"
                    role="menuitem"
                    onClick={() => {
                      setIsAvatarMenuOpen(false)
                      logout()
                    }}
                  >
                    <LogoutRoundedIcon fontSize="small" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
