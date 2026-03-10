import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import AboutSection from '../component/AboutSection'
import ContactSection from '../component/ContactSection'
import FooterSection from '../component/FooterSection'
import Header from '../component/Header'
import HeroSection from '../component/HeroSection'
import PortalPage from '../component/PortalPage'
import LoginPage from '../component/RegistrationFlow/Login'
import SignupPage from '../component/RegistrationFlow/Signup'
import ServicesSection from '../component/ServicesSection'
import TestimonialsSection from '../component/TestimonialsSection'
import { type HomeContent } from '../component/types'
import { useUser } from '../context/userProvider'
import { apiGet } from '../services/apiHandler'
import '../App.css'

function Home() {
	const [content, setContent] = useState<HomeContent | null>(null)
	const hasFetchedHomeContent = useRef(false)
	const hasFetchedServiceDetails = useRef(false)
	const { isLoggedIn, activePage, setActivePage } = useUser()

	useEffect(() => {
		if (hasFetchedHomeContent.current) {
			return
		}
		hasFetchedHomeContent.current = true

		const fetchContent = async () => {
			try {
				const data = await apiGet<HomeContent[] | HomeContent>('/api/v1/home-content')
				if (Array.isArray(data) && data[0]) {
					setContent(data[0])
					return
				}
				if (!Array.isArray(data) && data) {
					setContent(data)
				}
			} catch {
				setContent(null)
			}
		}

		void fetchContent()
	}, [])

	const servcieDetails = async () => {
		try {
			const data = await apiGet('/api/v1/service-details')
			console.log('Service Details:', data)
		} catch (error) {
			console.error('Error fetching service details:', error)
		}
	}

	useEffect(() => {
		if (hasFetchedServiceDetails.current) {
			return
		}
		hasFetchedServiceDetails.current = true

		void servcieDetails()
	}, [])

	const handleBookNowClick = () => {
		if (!isLoggedIn) {
			alert('Please login to book a service.')
			setActivePage('login')
			return
		}
		setActivePage('portal')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleLoginClick = () => {
		setActivePage('login')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleSignupClick = () => {
		setActivePage('signup')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (activePage === 'portal') {
		return (
			<PortalPage
				onBackToHome={() => setActivePage('home')}
				brandName={content?.brand?.name}
			/>
		)
	}

	if (activePage === 'login') {
		return (
			<LoginPage
				brandName={content?.brand?.name}
				onBackToHome={() => setActivePage('home')}
				onBookNow={handleBookNowClick}
				onSignup={handleSignupClick}
			/>
		)
	}

	if (activePage === 'signup') {
		return (
			<SignupPage
				brandName={content?.brand?.name}
				onBackToHome={() => setActivePage('home')}
				onBookNow={handleBookNowClick}
				onLogin={handleLoginClick}
			/>
		)
	}

	return (
		<Box className="page">
			<Header
				brandName={content?.brand?.name}
				navigation={content?.navigation}
				onBookNow={handleBookNowClick}
				onLogin={handleLoginClick}
			/>
			<HeroSection content={content} onBookNow={handleBookNowClick} />
			<ServicesSection content={content} onBookNow={handleBookNowClick} />
			<AboutSection content={content} />
			<TestimonialsSection content={content} />
			<ContactSection content={content} />
			<FooterSection
				content={content}
				onHome={() => setActivePage('home')}
			/>
		</Box>
	)
}

export default Home
