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
import showToast from '../component/Toast/Toast'
import '../App.css'

function Home() {
	const [content, setContent] = useState<HomeContent | null>(null)
	const [pendingSection, setPendingSection] = useState<string>('')
	const hasFetchedHomeContent = useRef(false)
	const hasFetchedServiceDetails = useRef(false)
	const { isLoggedIn, activePage, setActivePage } = useUser()

	const updatePath = (path: string, replace = false) => {
		if (window.location.pathname === path) {
			return
		}

		if (replace) {
			window.history.replaceState({}, '', path)
			return
		}

		window.history.pushState({}, '', path)
	}

	const goHome = (section = '', replace = false) => {
		setActivePage('home')
		const path = section ? `/home/${section}` : '/home'
		updatePath(path, replace)
		setPendingSection(section)
	}

	useEffect(() => {
		const syncFromPath = (replace = false) => {
			const path = window.location.pathname.toLowerCase()

			if (path.startsWith('/dashboard')) {
				if (!isLoggedIn) {
					setActivePage('login')
					updatePath('/login', replace)
					return
				}
				setActivePage('portal')
				return
			}

			if (path === '/login') {
				setActivePage('login')
				return
			}

			if (path === '/signup') {
				setActivePage('signup')
				return
			}

			if (path.startsWith('/home')) {
				setActivePage('home')
				const section = path.split('/')[2] ?? ''
				setPendingSection(section)
				return
			}

			setActivePage('home')
			updatePath('/home', replace)
			setPendingSection('')
		}

		syncFromPath(true)

		const onPopState = () => {
			syncFromPath(true)
		}

		window.addEventListener('popstate', onPopState)
		return () => window.removeEventListener('popstate', onPopState)
	}, [isLoggedIn, setActivePage])

	useEffect(() => {
		if (activePage !== 'home') {
			return
		}

		if (!pendingSection) {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			return
		}

		const scrollTarget = () => {
			const target = document.getElementById(pendingSection)
			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'start' })
			}
		}

		const timerId = window.setTimeout(scrollTarget, 0)
		return () => window.clearTimeout(timerId)
	}, [activePage, pendingSection])

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
			await apiGet('/api/v1/service-details')
		} catch (error: any) {
			showToast(error?.message, 'error')
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
		if (activePage === 'login' || activePage === 'signup') {
			showToast('Please login to book a service.', 'warning')
			setActivePage('login')
			updatePath('/login')
			return
		}

		if (!isLoggedIn) {
			showToast('Please login to book a service.', 'warning')
			setActivePage('login')
			updatePath('/login')
			return
		}
		setActivePage('portal')
		updatePath('/dashboard')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleLoginClick = () => {
		setActivePage('login')
		updatePath('/login')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleSignupClick = () => {
		setActivePage('signup')
		updatePath('/signup')
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (activePage === 'portal') {
		return (
			<PortalPage
				onBackToHome={(section = '') => goHome(section)}
				brandName={content?.brand?.name}
			/>
		)
	}

	if (activePage === 'login') {
		return (
			<LoginPage
				brandName={content?.brand?.name}
				onBackToHome={() => goHome('')}
				onBookNow={handleBookNowClick}
				onSignup={handleSignupClick}
			/>
		)
	}

	if (activePage === 'signup') {
		return (
			<SignupPage
				brandName={content?.brand?.name}
				onBackToHome={() => goHome('')}
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
				onHome={() => goHome('')}
				onSectionNavigate={(section) => goHome(section)}
				onDashboard={() => {
					setActivePage('portal')
					updatePath('/dashboard')
				}}
			/>
			<HeroSection content={content} onBookNow={handleBookNowClick} />
			<ServicesSection content={content} onBookNow={handleBookNowClick} />
			<AboutSection content={content} />
			<TestimonialsSection content={content} />
			<ContactSection content={content} />
			<FooterSection
				content={content}
				onHome={() => goHome('')}
				onSectionNavigate={(section) => goHome(section)}
			/>
		</Box>
	)
}

export default Home
