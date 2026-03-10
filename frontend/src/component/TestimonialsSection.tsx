import type { HomeContent } from './types'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Typography } from '@mui/material'

type Props = {
  content: HomeContent | null
}

function TestimonialsSection({ content }: Props) {
  if (!content) return null

  const testimonials = content.testimonialsSection?.testimonials ?? []

  return (
    <Box component="section" className="section testimonials">
      <Typography component="p" className="section-kicker">TESTIMONIALS</Typography>
      <Typography component="h2" variant="h2">{content.testimonialsSection?.title}</Typography>
      <Box className="cards-grid">
        {testimonials.map((item, index) => (
          <Box component="article" className="quote-card" key={`${item.name}-${index}`}>
            <Typography component="p">“{item.review}”</Typography>
            <Box className="quote-stars" aria-label={`${item.rating} star rating`}>
              {Array.from({ length: item.rating }, (_, starIndex) => (
                <StarRoundedIcon key={`${item.name}-${starIndex}`} fontSize="small" />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default TestimonialsSection
