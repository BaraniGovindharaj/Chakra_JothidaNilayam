import { Box, Typography } from '@mui/material'

type FooterContactInfoProps = {
  address?: string
  phone?: string
  email?: string
  copyright?: string
}

function FooterContactInfo({ address, phone, email, copyright }: FooterContactInfoProps) {
  return (
    <Box>
      <Typography component="h4" variant="h4" className="footer-header">Contact Us</Typography>
      <Typography component="p">Address: {address}</Typography>
      <Typography component="p">Phone: {phone}</Typography>
      <Typography component="p">Email: {email}</Typography>
      <Typography component="p">{copyright}</Typography>
    </Box>
  )
}

export default FooterContactInfo
