import type { HomeContent } from './types'
import { Box, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'
import { useUser } from '../context/userProvider'

type Props = {
  content: HomeContent | null
  onBookNow?: () => void
}

function HeroSection({ content, onBookNow }: Props) {
  const { setActivePage } = useUser()
  if (!content) return null

  const tagline = content.brand?.tagline || ''
  const starsWord = 'The Stars'
  const titleStart = tagline.includes(starsWord) ? tagline.split(starsWord)[0] : tagline

  return (
    <Box component="section" id="home" className="hero section">
      <Typography component="p" className="hero-badge">{content.hero?.badge}</Typography>
      <Typography component="h1" variant="h1">
        {titleStart}
        <Typography component="span">{starsWord}</Typography>
      </Typography>
      <Typography component="p" className="hero-subtitle">{content.brand?.subTagline}</Typography>
      <Box className="hero-actions">
        <CommonButton className="btn btn-primary" onClick={onBookNow}>
          {content.hero?.primaryButton}
        </CommonButton>
        <CommonButton className="btn btn-outline"
        onClick={()=>{
          setActivePage('home')
          const target = document.getElementById('services')
          if(target){
            target.scrollIntoView({behavior:'smooth', block:'start'})
          }
        }}
        >{content.hero?.secondaryButton}</CommonButton>
      </Box>
    </Box>
  )
}

export default HeroSection
