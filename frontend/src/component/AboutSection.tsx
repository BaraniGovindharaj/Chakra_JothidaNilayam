import type { HomeContent } from './types'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'

type Props = {
  content: HomeContent | null
}

function AboutSection({ content }: Props) {
  if (!content) return null

  const about = content.aboutSection

  return (
    <section id="about" className="section about">
      <div className="about-image-wrap">
        <div className="about-image" aria-hidden="true">
          <img src={about?.image_url} alt="Astrologer reading a chart" className="aboutImage" />
        </div>
        {about?.quote && (
          <div className="about-quote-card">
            <p className="about-quote">“{about.quote}”</p>
            <p className="about-quote-subtitle">{about.quote_description}</p>
          </div>
        )}
      </div>
      <div className="about-content">
        <p className="section-kicker">ABOUT SRI ASTROLOGY</p>
        <h2>{about?.title}</h2>
        <p>{about?.description}</p>
        <p>{about?.extendedDescription}</p>
        <div className="stats">
          <div>
            <strong>{about?.experience}</strong>
            <span>Years Experience</span>
          </div>
          <div>
            <strong>{about?.clients}</strong>
            <span>Clients Trusted</span>
          </div>
          <div>
            <strong>{about?.satisfaction}</strong>
            <span>Client Satisfaction</span>
          </div>
        </div>
        <a href="#contact" className="learn-more">
          <span>{about?.cta}</span>
          <ArrowForwardRoundedIcon fontSize="small" />
        </a>
      </div>
    </section>
  )
}

export default AboutSection
