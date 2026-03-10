import { useEffect, useMemo, useRef, useState } from 'react'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import CommonButton from './ReusableButton/CommonButton'
import Header from './Header'
import PortalContent from './Portal/PortalContent'
import type { BookingRecord, PortalView, ServiceOption } from './types'
import { apiGet, apiPost } from '../services/apiHandler'
import { useUser } from '../context/userProvider'
import showToast from './Toast/Toast'

type PortalPageProps = {
  onBackToHome: (section?: string) => void
  brandName?: string
}

type ApiResponse<T> = {
  status_code: number
  message: string
  data: T
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
  services?: ServiceDetailsEntry[]
}

const extractServiceEntries = (documents: ServiceDetailsDocument[] | ServiceDetailsDocument | null | undefined) => {
  const source = Array.isArray(documents) ? documents : documents ? [documents] : []

  for (const doc of source) {
    const entries = doc?.servicesSection?.services ?? doc?.services
    if (Array.isArray(entries) && entries.length > 0) {
      return entries
    }
  }

  return [] as ServiceDetailsEntry[]
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

  useEffect(() => {
    const path = window.location.pathname

    if (path.startsWith('/dashboard/profile')) {
      setActiveView('profile')
      return
    }

    if (path.startsWith('/dashboard/book')) {
      setActiveView('book')
      return
    }

    setActiveView('bookings')
  }, [])

  useEffect(() => {
    const path =
      activeView === 'profile'
        ? '/dashboard/profile'
        : activeView === 'book'
          ? '/dashboard/book'
          : '/dashboard'

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
  }, [activeView])

  const loadBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const response = await apiGet<ApiResponse<BookingRecord[]>>('/api/v1/booking')
      const bookingItems = Array.isArray(response.data) ? response.data : []
      const sorted = [...bookingItems].sort(
        (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
      )
      setBookings(sorted)
    } catch (error: any) {
      showToast(error?.message, 'error')
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
      let rawServices = extractServiceEntries(serviceDocuments)

      if (rawServices.length === 0) {
        const fallbackResponse = await apiGet<ServiceDetailsDocument[] | ApiResponse<ServiceDetailsDocument[]>>('/api/v1/home-content')
        const fallbackDocuments = unwrapApiData<ServiceDetailsDocument[]>(fallbackResponse)
        rawServices = extractServiceEntries(fallbackDocuments)
      }

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
    } catch (error: any) {
      showToast(error?.message, 'error')
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
      const response = await apiPost<ApiResponse<BookingRecord>>('/api/v1/user-booking', bookingData)
      showToast(response?.message, 'success')
      resetBookingForm()
      await loadBookings()
      setActiveView('bookings')
    } catch (error: any) {
      showToast(error?.message, 'error')
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

  return (
    <Box className="portal-page-wrap">
      <Header
        brandName={brandName}
        onHome={() => onBackToHome('')}
        onSectionNavigate={(section) => onBackToHome(section)}
        onBookNow={() => setActiveView('book')}
      />

      <Box component="main" className="section portal-main-layout">
        <Box component="aside" className="portal-sidebar">
          <Box>
          <Box className="portal-user-block">
            <Box className="portal-avatar">{user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'US'}</Box>
            <Box>
              <Typography component="h4" variant="h4">{user?.name || 'User'}</Typography>
              <Typography component="p">Premium Member</Typography>
            </Box>
          </Box>

          <Tabs
            className="portal-menu"
            orientation="vertical"
            value={activeView}
            onChange={(_, value: PortalView) => setActiveView(value)}
            aria-label="Portal navigation"
          >
            <Tab
              value="bookings"
              label="My Bookings"
              icon={<EventNoteOutlinedIcon fontSize="small" />}
              iconPosition="start"
              className={activeView === 'bookings' ? 'is-active' : ''}
            />
            <Tab
              value="book"
              label="Book New Reading"
              icon={<AddCircleOutlineRoundedIcon fontSize="small" />}
              iconPosition="start"
              className={activeView === 'book' ? 'is-active' : ''}
            />
            <Tab
              value="profile"
              label="Profile Settings"
              icon={<PersonOutlineRoundedIcon fontSize="small" />}
              iconPosition="start"
              className={activeView === 'profile' ? 'is-active' : ''}
            />
          </Tabs>
          </Box>

          <CommonButton className="portal-signout logout-action" onClick={logout}>
            <LogoutRoundedIcon fontSize="small" />
            Logout
          </CommonButton>
        </Box>

        <Box>
          <PortalContent
            activeView={activeView}
            isLoadingServices={isLoadingServices}
            serviceOptions={serviceOptions}
            selectedServiceIndex={selectedServiceIndex}
            setSelectedServiceIndex={setSelectedServiceIndex}
            monthLabel={monthLabel}
            changeMonth={changeMonth}
            weekDays={weekDays}
            calendarDates={calendarDates}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            timeSlots={timeSlots}
            selectedTimeIndex={selectedTimeIndex}
            setSelectedTimeIndex={setSelectedTimeIndex}
            handleConfirmBooking={handleConfirmBooking}
            userName={user?.name || ''}
            userEmail={user?.email || ''}
            userId={user?.userId || ''}
            isLoadingBookings={isLoadingBookings}
            bookings={bookings}
            formatBookingDate={formatBookingDate}
            formatBookingTime={formatBookingTime}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default PortalPage
