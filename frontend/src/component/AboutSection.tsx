import type { HomeContent } from './types'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Box, Link, Typography } from '@mui/material'

type Props = {
  content: HomeContent | null
}

function AboutSection({ content }: Props) {
  if (!content) return null

  const about = content.aboutSection

  return (
    <Box component="section" id="about" className="section about">
      <Box className="about-image-wrap">
        <Box className="about-image" aria-hidden="true">
          <Box component="img" src={about?.image_url} alt="Astrologer reading a chart" className="aboutImage" />
        </Box>
        {about?.quote && (
          <Box className="about-quote-card">
            <Typography component="p" className="about-quote">“{about.quote}”</Typography>
            <Typography component="p" className="about-quote-subtitle">{about.quote_description}</Typography>
          </Box>
        )}
      </Box>
      <Box className="about-content">
        <Typography component="p" className="section-kicker">ABOUT SRI ASTROLOGY</Typography>
        <Typography component="h2" variant="h2">{about?.title}</Typography>
        <Typography component="p">{about?.description}</Typography>
        <Typography component="p">{about?.extendedDescription}</Typography>
        <Box className="stats">
          <Box>
            <Typography component="strong">{about?.experience}</Typography>
            <Typography component="span">Years Experience</Typography>
          </Box>
          <Box>
            <Typography component="strong">{about?.clients}</Typography>
            <Typography component="span">Clients Trusted</Typography>
          </Box>
          <Box>
            <Typography component="strong">{about?.satisfaction}</Typography>
            <Typography component="span">Client Satisfaction</Typography>
          </Box>
        </Box>
        <Link href="#contact" className="learn-more" underline="none">
          <Typography component="span">{about?.cta}</Typography>
          <ArrowForwardRoundedIcon fontSize="small" />
        </Link>
      </Box>
    </Box>
  )
}

export default AboutSection
