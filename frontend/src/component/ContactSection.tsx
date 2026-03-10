import { useState } from 'react'
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
    <section id="contact" className="section contact">
      <div className="contact-left">
        <p className="section-kicker">GET IN TOUCH</p>
        <h2>{contact?.title}</h2>
        <p>{contact?.description}</p>
        <div className="contact-card">
          <h4>Office Hours</h4>
          <p>{contact?.officeHours?.weekdays}</p>
          <p>{contact?.officeHours?.weekend}</p>
          <p>{contact?.location}</p>
        </div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          name="userName"
          placeholder={fields[0] || 'User Name'}
          value={formData.userName}
          onChange={handleChange}
        />
        <input
          name="phoneNumber"
          placeholder={fields[1] || 'Phone Number'}
          value={formData.phoneNumber}
          onChange={handleChange}
        />
         <input
          name="email"
          placeholder={fields[2] || 'Email'}
          value={formData.email}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder={fields[3] || 'Message'}
          rows={4}
          value={formData.message}
          onChange={handleChange}
        />
        <button type="submit" className="btn btn-primary">{contact?.submitButton}</button>
      </form>
    </section>
  )
}

export default ContactSection
