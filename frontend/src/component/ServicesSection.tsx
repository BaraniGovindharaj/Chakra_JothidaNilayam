import type { HomeContent } from './types'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import NightlightRoundOutlinedIcon from '@mui/icons-material/NightlightRoundOutlined'

type Props = {
  content: HomeContent | null
  onBookNow?: () => void
}

function ServicesSection({ content, onBookNow }: Props) {
  if (!content) return null

  const items = content.servicesSection?.services ?? []

  return (
    <section id="services" className="section services">
      <p className="section-kicker">OUR OFFERINGS</p>
      <h2>{content.servicesSection?.title ?? 'Divine Services'}</h2>
      <div className="cards-grid">
        {items.map((item, index) => (
          <article className="service-card" key={`${item.title}-${index}`}>
            <div className="service-icon" aria-hidden="true">
              <NightlightRoundOutlinedIcon fontSize="small" />
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="service-footer">
              <strong>{item.price}</strong>
              <button onClick={onBookNow}>
                <span>{item.cta}</span>
                <ArrowForwardRoundedIcon fontSize="small" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
