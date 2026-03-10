import type { HomeContent } from './types'

type Props = {
  content: HomeContent | null
  onBookNow?: () => void
}

function HeroSection({ content, onBookNow }: Props) {
  if (!content) return null

  const tagline = content.brand?.tagline || ''
  const starsWord = 'The Stars'
  const titleStart = tagline.includes(starsWord) ? tagline.split(starsWord)[0] : tagline

  return (
    <section id="home" className="hero section">
      <p className="hero-badge">{content.hero?.badge}</p>
      <h1>
        {titleStart}
        <span>{starsWord}</span>
      </h1>
      <p className="hero-subtitle">{content.brand?.subTagline}</p>
      <div className="hero-actions">
        <button className="btn btn-primary" onClick={onBookNow}>
          {content.hero?.primaryButton}
        </button>
        <button className="btn btn-outline">{content.hero?.secondaryButton}</button>
      </div>
    </section>
  )
}

export default HeroSection
