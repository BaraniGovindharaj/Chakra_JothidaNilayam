import type { HomeContent } from './types'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

type Props = {
  content: HomeContent | null
  onHome?: () => void
}

function FooterSection({ content, onHome }: Props) {
  if (!content) return null

  const footer = content.footer

  const handleSectionNavigation = (item: string) => {
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
    <footer className="footer section">
      <div>
        <div className="logo">
          <AutoAwesomeOutlinedIcon className="logo-icon" fontSize="small" />
          {content.brand?.name}
        </div>
        <p>{footer?.description}</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        {footer?.quickLinks?.map((item) => (
          <button
            key={item}
            type="button"
            className="footer-link"
            onClick={() => handleSectionNavigation(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div>
        <h4>Services</h4>
        {footer?.services?.map((item) => <p key={item}>{item}</p>)}
      </div>
      <div>
        <h4>Contact Us</h4>
        <p>{footer?.contact?.address}</p>
        <p>{footer?.contact?.phone}</p>
        <p>{footer?.contact?.email}</p>
        <p>{footer?.copyright}</p>
      </div>
    </footer>
  )
}

export default FooterSection
