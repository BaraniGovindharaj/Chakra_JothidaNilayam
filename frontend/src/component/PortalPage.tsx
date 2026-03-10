import { useEffect, useMemo, useRef, useState } from 'react'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import Header from './Header'
import { apiGet, apiPost } from '../services/apiHandler'
import { useUser } from '../context/userProvider'

type PortalPageProps = {
  onBackToHome: () => void
  brandName?: string
}

type PortalView = 'bookings' | 'book' | 'profile'

type BookingRecord = {
  _id: string
  service: string
  date: string
  time: string
  amount?: number | string
}

type ApiResponse<T> = {
  status_code: number
  message: string
  data: T
}

type ServiceOption = {
  title: string
  duration: string
  amount: number
}

type ServiceDetailsEntry = {
  title?: string
  description?: string
  duration?: string
  price?: string
  amount?: number
}

type ServiceDetailsDocument = {
  servicesSection?: {
    services?: ServiceDetailsEntry[]
  }
}

const unwrapApiData = <T,>(response: T | ApiResponse<T>): T => {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  ) {
    return (response as ApiResponse<T>).data
  }

  return response as T
}

const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const timeSlots = ['10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM', '5:00 PM']

const parseTimeSlot = (timeSlot: string) => {
  const [timePart, period] = timeSlot.split(' ')
  const [hourPart, minutePart] = timePart.split(':')

  let hours = Number(hourPart)
  const minutes = Number(minutePart)

  if (period === 'PM' && hours !== 12) {
    hours += 12
  }

  if (period === 'AM' && hours === 12) {
    hours = 0
  }

  return { hours, minutes }
}

const getDefaultMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function PortalPage({ onBackToHome, brandName }: PortalPageProps) {
  const { user , logout} = useUser()
  const [activeView, setActiveView] = useState<PortalView>('bookings')
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const hasFetchedBookings = useRef(false)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null)
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [currentMonth, setCurrentMonth] = useState(getDefaultMonth)

  const loadBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const response = await apiGet<ApiResponse<BookingRecord[]>>('/api/v1/booking')
      const bookingItems = Array.isArray(response.data) ? response.data : []
      const sorted = [...bookingItems].sort(
        (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
      )
      setBookings(sorted)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const loadServiceOptions = async () => {
    setIsLoadingServices(true)
    try {
      const response = await apiGet<ServiceDetailsDocument[] | ApiResponse<ServiceDetailsDocument[]>>('/api/v1/service-details')
      const serviceDocuments = unwrapApiData<ServiceDetailsDocument[]>(response)
      const rawServices = serviceDocuments?.[0]?.servicesSection?.services

      const serviceItems: ServiceOption[] = Array.isArray(rawServices)
        ? rawServices.map((item) => {
            const numericPrice =
              typeof item.amount === 'number'
                ? item.amount
                : Number(String(item.price ?? '').replace(/[^\d.]/g, '')) || 0

            return {
              title: item.title ?? 'Consultation',
              duration: item.duration ?? '60 min',
              amount: numericPrice,
            }
          })
        : []

      setServiceOptions(serviceItems)
    } catch (error) {
      console.error('Error fetching services:', error)
      setServiceOptions([])
    } finally {
      setIsLoadingServices(false)
    }
  }

  useEffect(() => {
    if (hasFetchedBookings.current) {
      return
    }
    hasFetchedBookings.current = true

    void loadBookings()
    void loadServiceOptions()
  }, [])

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth],
  )

  const calendarDates = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]
  }, [currentMonth])

  const resetBookingForm = () => {
    setSelectedServiceIndex(null)
    setSelectedTimeIndex(null)
    setSelectedDay(null)
    setCurrentMonth(getDefaultMonth())
  }

  const changeMonth = (offset: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
      const nextDaysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()

      if (selectedDay && selectedDay > nextDaysInMonth) {
        setSelectedDay(null)
      }

      return next
    })
  }

  const handleConfirmBooking = async () => {
    if (selectedServiceIndex === null || selectedTimeIndex === null || selectedDay === null) {
      return
    }

    if (!user?.userId) {
      return
    }

    const selectedDateUtc = new Date(
      Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay),
    ).toISOString()

    const { hours, minutes } = parseTimeSlot(timeSlots[selectedTimeIndex])
    const selectedDateTimeUtc = new Date(
      Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay, hours, minutes),
    ).toISOString()

    const selectedService = serviceOptions[selectedServiceIndex]
    if (!selectedService) {
      return
    }
    const bookingData = {
      service: selectedService.title,
      date: selectedDateUtc,
      time: selectedDateTimeUtc,
      amount: selectedService.amount,
      userId: user.userId,
    }

    try {
      await apiPost<ApiResponse<BookingRecord>>('/api/v1/user-booking', bookingData)
      resetBookingForm()
      await loadBookings()
      setActiveView('bookings')
    } catch (error) {
      console.error('Booking failed:', error)
    }
  }

  const formatBookingDate = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString('en-CA')
  }

  const formatBookingTime = (value: string) => {
    const parsed = new Date(value)

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      })
    }

    return value
  }

  const renderContent = () => {
    if (activeView === 'book') {
      return (
        <section className="portal-content-card">
          <h1>Book a New Session</h1>

          <div className="booking-layout">
            <div className="booking-column">
              <h3>1. Select a Service</h3>
              {isLoadingServices && <p className="portal-empty">Loading services...</p>}
              {!isLoadingServices && serviceOptions.length === 0 && (
                <p className="portal-empty">No services available right now.</p>
              )}
              <div className="booking-service-list">
                {serviceOptions.map((service, index) => (
                  <button
                    type="button"
                    key={service.title}
                    className={`booking-service-card ${index === selectedServiceIndex ? 'is-active' : ''}`}
                    onClick={() => setSelectedServiceIndex(index)}
                  >
                    <div>
                      <h4>{service.title}</h4>
                      <p>{service.duration}</p>
                    </div>
                    <strong>${service.amount}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-column">
              <h3>2. Select Date & Time</h3>
              <div className="booking-calendar">
                <div className="booking-calendar-head">
                  <h4>{monthLabel}</h4>
                  <div>
                    <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
                      <ChevronLeftRoundedIcon fontSize="small" />
                    </button>
                    <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
                      <ChevronRightRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div className="booking-weekdays">
                  {weekDays.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="booking-days">
                  {calendarDates.map((day, index) => (
                    <button
                      type="button"
                      key={`${day}-${index}`}
                      className={day === selectedDay ? 'is-selected' : ''}
                      onClick={() => {
                        if (day) {
                          setSelectedDay(day)
                        }
                      }}
                      disabled={!day}
                    >
                      {day ?? ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-times">
                {timeSlots.map((time, index) => (
                  <button
                    key={time}
                    type="button"
                    className={index === selectedTimeIndex ? 'is-selected' : ''}
                    onClick={() => setSelectedTimeIndex(index)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="booking-footer">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleConfirmBooking}
              disabled={selectedServiceIndex === null || selectedTimeIndex === null || selectedDay === null}
            >
              Confirm Booking
            </button>
          </div>
        </section>
      )
    }

    if (activeView === 'profile') {
      return (
        <section className="portal-content-card">
          <h1>Profile Settings</h1>
          <div className="portal-profile-grid">
            <label>
              Name
              <input type="text" defaultValue={user?.name || ''} />
            </label>
            <label>
              Email
              <input type="email" defaultValue={user?.email || ''} />
            </label>
            {/* <label>
              Phone
              <input type="tel" defaultValue={user?.phone || ''} />
            </label>
            <label>
              Time Zone
              <input type="text" defaultValue={user?.timeZone || ''} />
            </label> */}
          </div>
        </section>
      )
    }

    return (
      <section className="portal-content-card">
        <h1>Your Appointments</h1>

        {isLoadingBookings && <p className="portal-empty">Loading bookings...</p>}

        {!isLoadingBookings && bookings.length === 0 && (
          <p className="portal-empty">No bookings found. Click Book New Reading to create one.</p>
        )}

        {!isLoadingBookings && bookings.length > 0 && (
          <div className="portal-booking-list">
            {bookings.map((booking) => {
              const appointmentDate = new Date(booking.date)
              const status = appointmentDate.getTime() >= Date.now() ? 'Upcoming' : 'Completed'

              return (
                <article className="portal-booking-item" key={booking._id}>
                  <div className="portal-booking-icon" aria-hidden="true">
                    <CalendarMonthOutlinedIcon fontSize="small" />
                  </div>
                  <div className="portal-booking-main">
                    <h3>{booking.service}</h3>
                    <p>
                      {formatBookingDate(booking.date)} at {formatBookingTime(booking.time)} UTC
                    </p>
                  </div>
                  <span className={`portal-status-badge ${status === 'Upcoming' ? 'is-upcoming' : 'is-completed'}`}>
                    {status}
                  </span>
                </article>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="portal-page-wrap">
      <Header
        brandName={brandName}
        onHome={onBackToHome}
        onBookNow={() => setActiveView('book')}
      />

      <main className="section portal-main-layout">
        <aside className="portal-sidebar">
          <div className="portal-user-block">
            <div className="portal-avatar">{user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'US'}</div>
            <div>
              <h4>{user?.name || 'User'}</h4>
              <p>Premium Member</p>
            </div>
          </div>

          <div className="portal-menu">
            <button
              type="button"
              className={activeView === 'bookings' ? 'is-active' : ''}
              onClick={() => setActiveView('bookings')}
            >
              <EventNoteOutlinedIcon fontSize="small" />
              <span>My Bookings</span>
            </button>
            <button
              type="button"
              className={activeView === 'book' ? 'is-active' : ''}
              onClick={() => setActiveView('book')}
            >
              <AddCircleOutlineRoundedIcon fontSize="small" />
              <span>Book New Reading</span>
            </button>
            <button
              type="button"
              className={activeView === 'profile' ? 'is-active' : ''}
              onClick={() => setActiveView('profile')}
            >
              <PersonOutlineRoundedIcon fontSize="small" />
              <span>Profile Settings</span>
            </button>
          </div>

          <button className="portal-signout logout-action" type="button" onClick={logout}>
            <LogoutRoundedIcon fontSize="small" />
            <span>Logout</span>
          </button>
        </aside>

        <div>{renderContent()}</div>
      </main>
    </div>
  )
}

export default PortalPage
