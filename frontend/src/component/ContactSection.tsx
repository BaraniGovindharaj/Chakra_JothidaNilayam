import { useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'
import { apiPost } from '../services/apiHandler'
import type { HomeContent } from './types'
import { useUser } from '../context/userProvider'

type Props = {
  content: HomeContent | null
}

function ContactSection({ content }: Props) {
  const { setActivePage } = useUser()
  const userId = localStorage.getItem('userId') || ''
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    email: '',
    message: '',
    userId: userId || undefined,
  })

  if (!content) return null

  const contact = content.contactSection
  const fields = contact?.formFields ?? ['User Name', 'Phone Number', 'Message']

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userId) {
      alert('Please login to send a message.')
      setActivePage('login')
      return
    }

    if (!formData.userName.trim() || !formData.phoneNumber.trim() || !formData.message.trim()) {
      alert('Please fill user name, phone number, and message.')
      return
    }

    try {
      await apiPost('/api/v1/contact-message', formData)
      alert('Message sent successfully!')
      setFormData({ userName: '', phoneNumber: '', email: '', message: '', userId: userId || undefined })
    } catch (error) {
      console.error('Error saving contact message:', error)
      setActivePage('login')
      alert('Failed to send message. Please try again.')
    }
  }

  return (
    <Box component="section" id="contact" className="section contact">
      <Box className="contact-left">
        <Typography component="p" className="section-kicker">GET IN TOUCH</Typography>
        <Typography component="h2" variant="h2">{contact?.title}</Typography>
        <Typography component="p">{contact?.description}</Typography>
        <Box className="contact-card">
          <Typography component="h4" variant="h4" className='contact-title'>Office Hours</Typography>
          <Typography component="p">{contact?.officeHours?.weekdays}</Typography>
          <Typography component="p">{contact?.officeHours?.weekend}</Typography>
          <Typography component="p">{contact?.location}</Typography>
        </Box>
      </Box>
      <Box component="form" className="contact-form" onSubmit={handleSubmit}>
        <TextField
          name="userName"
          placeholder={fields[0] || 'User Name'}
          value={formData.userName}
          onChange={handleChange}
          variant="standard"
          fullWidth
          slotProps={{
            input: { disableUnderline: true },
          }}
        />
        <TextField
          name="phoneNumber"
          placeholder={fields[1] || 'Phone Number'}
          value={formData.phoneNumber}
          onChange={handleChange}
          variant="standard"
          fullWidth
          slotProps={{
            input: { disableUnderline: true },
          }}
        />
         <TextField
          name="email"
          placeholder={fields[2] || 'Email'}
          value={formData.email}
          onChange={handleChange}
          variant="standard"
          fullWidth
          slotProps={{
            input: { disableUnderline: true },
          }}
        />
        <TextField
          name="message"
          placeholder={fields[3] || 'Message'}
          multiline
          rows={4}
          value={formData.message}
          onChange={handleChange}
          variant="standard"
          fullWidth
          slotProps={{
            input: { disableUnderline: true },
          }}
        />
        <CommonButton type="submit" className="btn btn-primary">{contact?.submitButton}</CommonButton>
      </Box>
    </Box>
  )
}

export default ContactSection
