import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { Box, TextField, Typography } from '@mui/material'
import CommonButton from '../ReusableButton/CommonButton'
import type { BookingRecord, PortalView, ServiceOption } from '../types'

type PortalContentProps = {
  activeView: PortalView
  isLoadingServices: boolean
  serviceOptions: ServiceOption[]
  selectedServiceIndex: number | null
  setSelectedServiceIndex: (value: number | null) => void
  monthLabel: string
  changeMonth: (offset: number) => void
  weekDays: string[]
  calendarDates: Array<number | null>
  selectedDay: number | null
  setSelectedDay: (value: number | null) => void
  timeSlots: string[]
  selectedTimeIndex: number | null
  setSelectedTimeIndex: (value: number | null) => void
  handleConfirmBooking: () => Promise<void>
  userName: string
  userEmail: string
  isLoadingBookings: boolean
  bookings: BookingRecord[]
  formatBookingDate: (value: string) => string
  formatBookingTime: (value: string) => string
}

function PortalContent({
  activeView,
  isLoadingServices,
  serviceOptions,
  selectedServiceIndex,
  setSelectedServiceIndex,
  monthLabel,
  changeMonth,
  weekDays,
  calendarDates,
  selectedDay,
  setSelectedDay,
  timeSlots,
  selectedTimeIndex,
  setSelectedTimeIndex,
  handleConfirmBooking,
  userName,
  userEmail,
  isLoadingBookings,
  bookings,
  formatBookingDate,
  formatBookingTime,
}: PortalContentProps) {
  if (activeView === 'book') {
    return (
      <Box component="section" className="portal-content-card portal-book-section">
        <Typography component="h2" variant="h2" gutterBottom>Book a New Session</Typography>

        <Box className="booking-layout">
          <Box className="booking-column">
            <Typography component="h3" variant="h3">1. Select a Service</Typography>
            {isLoadingServices && <Typography component="p" className="portal-empty">Loading services...</Typography>}
            {!isLoadingServices && serviceOptions.length === 0 && (
              <Typography component="p" className="portal-empty">No services available right now.</Typography>
            )}
            <Box className="booking-service-list">
              {serviceOptions.map((service, index) => (
                <Box
                  key={service.title}
                  className={`booking-service-card ${index === selectedServiceIndex ? 'is-active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedServiceIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedServiceIndex(index)
                    }
                  }}
                >
                  <Box>
                    <Typography component="h4" variant="h4">{service.title}</Typography>
                    <Typography component="p">{service.duration}</Typography>
                  </Box>
                  <Typography component="strong">${service.amount}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className="booking-column">
            <Typography component="h3" variant="h3">2. Select Date & Time</Typography>
            <Box className="booking-calendar">
              <Box className="booking-calendar-head">
                <Typography component="h4" variant="h4">{monthLabel}</Typography>
                <Box className="booking-calendar-nav">
                  <Typography
                    component="span"
                    className="booking-calendar-nav-item"
                    aria-label="Previous month"
                    role="button"
                    tabIndex={0}
                    onClick={() => changeMonth(-1)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        changeMonth(-1)
                      }
                    }}
                  >
                    <ChevronLeftRoundedIcon fontSize="small" />
                  </Typography>
                  <Typography
                    component="span"
                    className="booking-calendar-nav-item"
                    aria-label="Next month"
                    role="button"
                    tabIndex={0}
                    onClick={() => changeMonth(1)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        changeMonth(1)
                      }
                    }}
                  >
                    <ChevronRightRoundedIcon fontSize="small" />
                  </Typography>
                </Box>
              </Box>

              <Box className="booking-weekdays">
                {weekDays.map((day) => (
                  <Typography component="span" key={day}>{day}</Typography>
                ))}
              </Box>

              <Box className="booking-days">
                {calendarDates.map((day, index) => {
                  if (!day) {
                    return <Box key={`${day}-${index}`} className="booking-day-item is-empty" aria-hidden="true" />
                  }

                  return (
                    <Typography
                      key={`${day}-${index}`}
                      component="span"
                      className={`booking-day-item ${day === selectedDay ? 'is-selected' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDay(day)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedDay(day)
                        }
                      }}
                    >
                      {day}
                    </Typography>
                  )
                })}
              </Box>
            </Box>

            <Box className="booking-times">
              {timeSlots.map((time, index) => (
                <Typography
                  key={time}
                  component="span"
                  className={`booking-time-item ${index === selectedTimeIndex ? 'is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTimeIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedTimeIndex(index)
                    }
                  }}
                >
                  {time}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Box className="booking-footer">
          <CommonButton
            className="btn btn-primary"
            onClick={handleConfirmBooking}
            disabled={selectedServiceIndex === null || selectedTimeIndex === null || selectedDay === null}
          >
            Confirm Booking
          </CommonButton>
        </Box>
      </Box>
    )
  }

  if (activeView === 'profile') {
    return (
      <Box component="section" className="portal-content-card">
        <Typography component="h2" gutterBottom variant="h2">Profile Settings</Typography>
        <Box className="portal-profile-grid">
          <Typography component="label">
            Name
            <TextField
              type="text"
              defaultValue={userName}
              variant="standard"
              fullWidth
              slotProps={{
                input: { disableUnderline: true },
              }}
            />
          </Typography>
          <Typography component="label">
            Email
            <TextField
              type="email"
              defaultValue={userEmail}
              variant="standard"
              fullWidth
              slotProps={{
                input: { disableUnderline: true },
              }}
            />
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box component="section" className="portal-content-card">
      <Typography component="h2" variant="h2" gutterBottom>Your Appointments</Typography>

      {isLoadingBookings && <Typography component="p" className="portal-empty">Loading bookings...</Typography>}

      {!isLoadingBookings && bookings.length === 0 && (
        <Typography component="p" className="portal-empty">No bookings found. Click Book New Reading to create one.</Typography>
      )}

      {!isLoadingBookings && bookings.length > 0 && (
        <Box className="portal-booking-list">
          {bookings.map((booking) => {
            const appointmentDate = new Date(booking.date)
            const status = appointmentDate.getTime() >= Date.now() ? 'Upcoming' : 'Completed'
            const statusClass = booking.iscancelled
              ? 'is-cancelled'
              : booking.inprogress
                ? 'is-in-progress'
                : status === 'Upcoming'
                  ? 'is-upcoming'
                  : 'is-completed'
            const statusLabel = booking.iscancelled
              ? 'Cancelled'
              : booking.inprogress
                ? 'In Progress'
                : status

            return (
              <Box component="article" className="portal-booking-item" key={booking._id}>
                <Box className="portal-booking-icon" aria-hidden="true">
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </Box>
                <Box className="portal-booking-main">
                  <Typography component="h3" variant="h3">{booking.service}</Typography>
                  <Typography component="p">
                    {formatBookingDate(booking.date)} at {formatBookingTime(booking.time)} UTC
                  </Typography>
                </Box>
                <Typography component="span" className={`portal-status-badge ${statusClass}`}>
                  {statusLabel}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default PortalContent
