import { useState } from 'react';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { Avatar, Box, IconButton, Link, Popover, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'
import { useUser } from '../context/userProvider'

type Props = {
  brandName?: string
  navigation?: string[]
  onBookNow?: () => void
  onLogin?: () => void
  onHome?: () => void
  onSectionNavigate?: (section: string) => void
  onDashboard?: () => void
}

function Header({ brandName, navigation, onBookNow, onLogin, onHome, onSectionNavigate, onDashboard }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(null)
  const navItems = navigation?.length ? navigation : ['Home', 'Services', 'About', 'Contact']
  const { isLoggedIn, user, setActivePage, logout } = useUser()
  const avatarInitials = (user?.name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  const handleNavClick = () => {
    setIsMenuOpen(false)
    setAvatarAnchorEl(null)
  }

  const isLogoutPopoverOpen = Boolean(avatarAnchorEl)

  const handleSectionNavigation = (item: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    handleNavClick()

    if (item.toLowerCase() === 'home') {
      onSectionNavigate?.('')
      onHome?.()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const targetId = item.toLowerCase().replace(/\s+/g, '')
    onSectionNavigate?.(targetId)
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Box component="header" className="navbar section">
      <Box className="logo" onClick={() => {
        onSectionNavigate?.('')
        onHome?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}>
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
      <Box
        className={`navbar-overlay ${isMenuOpen ? 'is-open' : ''}`}
        onClick={handleNavClick}
      />
      <Box className={`navbar-content ${isMenuOpen ? 'is-open' : ''}`}>
        <Box className="drawer-head">
          <Box className="drawer-logo">
            <AutoAwesomeOutlinedIcon className="logo-icon" fontSize="small" />
            <Typography component="span">{brandName || 'Sri Chakra Jothidanilayam'}</Typography>
          </Box>
          <IconButton className="drawer-close" onClick={handleNavClick} aria-label="Close menu">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
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
                handleNavClick()
                setAvatarAnchorEl(null)
                onDashboard?.() ?? setActivePage('portal')
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
              <IconButton
                className="avatar-btn"
                aria-label="User Avatar"
                aria-expanded={isLogoutPopoverOpen}
                onClick={(event) => setAvatarAnchorEl(avatarAnchorEl ? null : event.currentTarget)}
              >
                <Avatar className="avatar" >{avatarInitials || 'US'}</Avatar>
              </IconButton>
              <Popover
                open={isLogoutPopoverOpen}
                anchorEl={avatarAnchorEl}
                onClose={() => setAvatarAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                aria-labelledby="avatar-popover-title"
                PaperProps={{ className: 'avatar-popover-paper' }}
              >
                <Box className="avatar-popover-content" role="menu" aria-label="User menu">
                  <Box className="avatar-popover-profile">
                    <Typography id="avatar-popover-title" className="avatar-popover-name">{user?.name || 'User'}</Typography>
                    <Typography className="avatar-popover-email">{user?.email || ''}</Typography>
                  </Box>
                  <Box className="avatar-popover-divider" />
                  {/* <Box
                    className="avatar-popover-item"
                    role="menuitem"
                    onClick={() => {
                      setAvatarAnchorEl(null)
                      onDashboard?.() ?? setActivePage('portal')
                    }}
                  >
                    <Typography>Settings</Typography>
                  </Box> */}
                  <Box
                    className="avatar-popover-item avatar-popover-item-logout"
                    role="menuitem"
                    onClick={() => {
                      handleNavClick()
                      setAvatarAnchorEl(null)
                      logout()
                    }}
                  >
                    <LogoutRoundedIcon fontSize="small" />
                    <Typography>Logout</Typography>
                  </Box>
                </Box>
              </Popover>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Header
