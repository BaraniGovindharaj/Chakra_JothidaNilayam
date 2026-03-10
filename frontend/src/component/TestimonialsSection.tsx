import type { HomeContent } from './types'
import StarRoundedIcon from '@mui/icons-material/StarRounded'

type Props = {
  content: HomeContent | null
}

function TestimonialsSection({ content }: Props) {
  if (!content) return null

  const testimonials = content.testimonialsSection?.testimonials ?? []

  return (
    <section className="section testimonials">
      <p className="section-kicker">TESTIMONIALS</p>
      <h2>{content.testimonialsSection?.title}</h2>
      <div className="cards-grid">
        {testimonials.map((item, index) => (
          <article className="quote-card" key={`${item.name}-${index}`}>
            <p>“{item.review}”</p>
            <div className="quote-stars" aria-label={`${item.rating} star rating`}>
              {Array.from({ length: item.rating }, (_, starIndex) => (
                <StarRoundedIcon key={`${item.name}-${starIndex}`} fontSize="small" />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
