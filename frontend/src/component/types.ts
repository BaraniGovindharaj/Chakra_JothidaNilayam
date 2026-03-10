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
      iconName?: string
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
    office_hours?: {
      monday_to_friday: {
        start_time: string
        end_time: string
        timezone: string
      }
      saturday: {
        start_time: string
        end_time: string
        timezone: string
      }
    }
    unavailable_month_dates?: {
      month_start?: string
      month_end?: string
    }
    location: string
    contact_method?: string
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

export type PortalView = 'bookings' | 'book' | 'profile'

export type BookingRecord = {
  _id: string
  service: string
  date: string
  time: string
  amount?: number | string
  iscancelled?: boolean
  inprogress?: boolean
}

export type ServiceOption = {
  title: string
  duration: string
  amount: number
}

export type ToastOptions = {
    position: "top-right";
    autoClose: number;
    hideProgressBar: boolean;
    closeOnClick: boolean;
    pauseOnHover: boolean;
    draggable: boolean;
  progress?: number;
}


