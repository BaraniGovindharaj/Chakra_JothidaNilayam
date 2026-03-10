import type { HomeContent } from './types'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import NightlightRoundOutlinedIcon from '@mui/icons-material/NightlightRoundOutlined'
import { Box, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'

type Props = {
  content: HomeContent | null
  onBookNow?: () => void
}

function ServicesSection({ content, onBookNow }: Props) {
  if (!content) return null

  const items = content.servicesSection?.services ?? []

  return (
    <Box component="section" id="services" className="section services">
      <Typography component="p" className="section-kicker">OUR OFFERINGS</Typography>
      <Typography component="h2" variant="h2">{content.servicesSection?.title ?? 'Divine Services'}</Typography>
      <Box className="cards-grid">
        {items.map((item, index) => (
          <Box component="article" className="service-card" key={`${item.title}-${index}`}>
            <Box className="service-icon" aria-hidden="true">
              <NightlightRoundOutlinedIcon fontSize="small" />
            </Box>
            <Typography component="h3" variant="h3">{item.title}</Typography>
            <Typography component="p">{item.description}</Typography>
            <Box className="service-footer">
              <Typography component="strong">{item.price}</Typography>
              <CommonButton onClick={onBookNow}>
                {item.cta}
                <ArrowForwardRoundedIcon fontSize="small" />
              </CommonButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default ServicesSection
