import type { HomeContent } from './types'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Box, Button, Typography } from '@mui/material'
import FooterContactInfo from './FooterContactInfo'

type Props = {
  content: HomeContent | null
  onHome?: () => void
  onSectionNavigate?: (section: string) => void
}

function FooterSection({ content, onHome, onSectionNavigate }: Props) {
  if (!content) return null

  const footer = content.footer

  const handleSectionNavigation = (item: string) => {
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
    <Box component="footer" className="footer section">
      <Box>
        <Box className="logo">
          <AutoAwesomeOutlinedIcon className="logo-icon" fontSize="small" />
          <Typography component="span">{content.brand?.name}</Typography>
        </Box>
        <Typography component="p">{footer?.description}</Typography>
      </Box>
      <Box>
        <Typography component="h4" variant="h4" className='footer-header'>Quick Links</Typography>
        {footer?.quickLinks?.map((item) => (
          <Button
            key={item}
            className="footer-link"
            onClick={() => handleSectionNavigation(item)}
          >
            {item}
          </Button>
        ))}
      </Box>
      <Box>
        <Typography component="h4" variant="h4" className='footer-header'>Services</Typography>
        {footer?.services?.map((item) => <Typography component="p" key={item}>{item}</Typography>)}
      </Box>
      <FooterContactInfo
        address={footer?.contact?.address}
        phone={footer?.contact?.phone}
        email={footer?.contact?.email}
        copyright={footer?.copyright}
      />
    </Box>
  )
}

export default FooterSection
