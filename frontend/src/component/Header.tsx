import { useState } from 'react';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { Box, IconButton, Link, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'
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
    <Box component="header" className="navbar section">
      <Box className="logo">
        <AutoAwesomeOutlinedIcon className="logo-icon" fontSize="small" />
        <Typography component="span">{brandName || 'Sri Chakra Jothidanilayam'}</Typography>
      </Box>
      <IconButton
        className="menu-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <CloseRoundedIcon fontSize="small" /> : <MenuRoundedIcon fontSize="small" />}
      </IconButton>
      <Box className={`navbar-content ${isMenuOpen ? 'is-open' : ''}`}>
        <Box component="nav">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
              onClick={(event) => handleSectionNavigation(item, event)}
              className="nav-link"
              underline="none"
            >
              {item}
            </Link>
          ))}
        </Box>
        <Box className="navbar-actions">
          {!isLoggedIn ? (
            <CommonButton
              // className="btn btn-secondary"
              onClick={() => {
                handleNavClick()
                onLogin?.()
              }}
            >
              Login
            </CommonButton>
          ) : (
            <CommonButton
              className="btn btn-primary"
              onClick={() => {
                setIsAvatarMenuOpen(false)
                setActivePage('portal')
              }}
            >
              Dashboard
            </CommonButton>
          )}
          {!isLoggedIn ? (
            <CommonButton
              className="btn btn-primary"
              onClick={() => {
                handleNavClick()
                onBookNow?.()
              }}
            >
              Book Consultation
            </CommonButton>
          ) : (
            <Box className="avatar-menu-wrap">
              <CommonButton
                className="avatar avatar-btn"
                aria-label="User Avatar"
                aria-expanded={isAvatarMenuOpen}
                onClick={() => setIsAvatarMenuOpen((open) => !open)}
              >
                {avatarInitials || 'US'}
              </CommonButton>
              {isAvatarMenuOpen && (
                <Box className="avatar-dropdown" role="menu" aria-label="User menu">
                  <CommonButton
                    className="avatar-dropdown-item logout-action"
                    role="menuitem"
                    onClick={() => {
                      setIsAvatarMenuOpen(false)
                      logout()
                    }}
                  >
                    <LogoutRoundedIcon fontSize="small" />
                    Logout
                  </CommonButton>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Header
