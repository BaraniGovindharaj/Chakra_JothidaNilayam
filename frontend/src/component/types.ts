export type HomeContent = {
  brand: {
    name: string
    tagline: string
    subTagline: string
  }
  navigation: string[]
  hero: {
    badge: string
    primaryButton: string
    secondaryButton: string
  }
  servicesSection: {
    title: string
    services: {
      title: string
      description: string
      price: string
      cta: string
    }[]
  }
  aboutSection: {
    title: string
    description: string
    extendedDescription: string
    image_url?: string
    quote: string
    experience: string
    clients: string
    satisfaction: string
    cta: string
    quote_description: string
  }
  testimonialsSection: {
    title: string
    testimonials: {
      name: string
      role: string
      review: string
      rating: number
    }[]
  }
  contactSection: {
    title: string
    description: string
    officeHours: {
      weekdays: string
      weekend: string
    }
    location: string
    formFields: string[]
    submitButton: string
  }
  footer: {
    description: string
    quickLinks: string[]
    services: string[]
    contact: {
      address: string
      phone: string
      email: string
    }
    copyright: string
  }
}

