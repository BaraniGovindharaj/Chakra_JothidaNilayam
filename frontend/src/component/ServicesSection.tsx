import type { ReactNode } from 'react'
import type { HomeContent } from './types'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import SolarPowerIcon from '@mui/icons-material/SolarPower'
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'
import NightlightRoundOutlinedIcon from '@mui/icons-material/NightlightRoundOutlined'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'


type Props = {
  content: HomeContent | null
  onBookNow?: () => void
}

function ServicesSection({ content, onBookNow }: Props) {
  if (!content) return null

  const items = content.servicesSection?.services ?? []

  const renderServiceIcon = (iconName?: string, title?: string, description?: string) => {
    const normalized = (iconName || '').trim().toLowerCase().replace(/icon$/i, '')
    const keywordSource = `${normalized} ${title || ''} ${description || ''}`.toLowerCase()

    const exactIconMap: Record<string, ReactNode> = {
      autostories: <AutoStoriesIcon fontSize="small" />,
      workoutline: <WorkOutlineIcon fontSize="small" />,
      familyrestroom: <FamilyRestroomIcon fontSize="small" />,
      starhalf: <StarHalfIcon fontSize="small" />,
      solarpower: <SolarPowerIcon fontSize="small" />,
    }

    if (exactIconMap[normalized]) {
      return exactIconMap[normalized]
    }

    if (keywordSource.includes('career') || keywordSource.includes('work') || keywordSource.includes('job')) {
      return <WorkOutlineIcon fontSize="small" />
    }

    if (keywordSource.includes('natal')) {
      return <AutoStoriesIcon fontSize="small" />
    }

    if (keywordSource.includes('family') || keywordSource.includes('relation') || keywordSource.includes('relationship') || keywordSource.includes('marriage')) {
      return <FamilyRestroomIcon fontSize="small" />
    }

    if (keywordSource.includes('solar') || keywordSource.includes('sun')) {
      return <SolarPowerIcon fontSize="small" />
    }

    if (keywordSource.includes('horary')) {
      return <FavoriteIcon fontSize="small" />
    }

    if (keywordSource.includes('tarot') || keywordSource.includes('torat') || keywordSource.includes('star') || keywordSource.includes('astro')) {
      return <StarHalfIcon fontSize="small" />
    }

    if (keywordSource.includes('horary') || keywordSource.includes('heart')) {
      return <FavoriteIcon fontSize="small" />
    }

    return <NightlightRoundOutlinedIcon fontSize="small" />
  }

  return (
    <Box component="section" id="services" className="section services">
      <Typography component="p" className="section-kicker">OUR OFFERINGS</Typography>
      <Typography component="h2" variant="h2">{content.servicesSection?.title ?? 'Divine Services'}</Typography>
      <Box className="cards-grid">
        {items.map((item, index) => (
          <Box component="article" className="service-card" key={`${item.title}-${index}`}>
            <Box className="service-icon" aria-hidden="true">
              {renderServiceIcon(item.iconName, item.title, item.description)}
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
