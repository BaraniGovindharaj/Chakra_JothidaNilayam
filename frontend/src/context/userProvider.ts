import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import showToast from '../component/Toast/Toast'

type UserProfile = {
	userId: string
	name: string
	email: string
}

type LoginPayload = {
	userId?: string
	user_id?: string
	name?: string
	email?: string
}

type UserContextValue = {
	user: UserProfile | null
	isLoggedIn: boolean
	activePage: 'home' | 'portal' | 'login' | 'signup'
	setActivePage: React.Dispatch<React.SetStateAction<'home' | 'portal' | 'login' | 'signup'>>
	setUserFromLogin: (payload: LoginPayload) => void
	logout: () => void
}

const USER_ID_KEY = 'userId'
const USER_NAME_KEY = 'name'
const USER_EMAIL_KEY = 'email'

const UserContext = createContext<UserContextValue | undefined>(undefined)

const readUserFromStorage = (): UserProfile | null => {
	const userId = localStorage.getItem(USER_ID_KEY) || ''
	const name = localStorage.getItem(USER_NAME_KEY) || ''
	const email = localStorage.getItem(USER_EMAIL_KEY) || ''

	if (!userId) {
		return null
	}

	return { userId, name, email }
}

type UserProviderProps = {
	children: React.ReactNode
    
}

export function UserProvider({ children }: UserProviderProps) {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [activePage, setActivePage] = useState<'home' | 'portal' | 'login' | 'signup'>('home')

	useEffect(() => {
		setUser(readUserFromStorage())
	}, [])

	const setUserFromLogin = (payload: LoginPayload) => {
		const nextUser: UserProfile = {
			userId: payload.userId || payload.user_id || '',
			name: payload.name || '',
			email: payload.email || '',
		}

		if (!nextUser.userId) {
			return
		}

		localStorage.setItem(USER_ID_KEY, nextUser.userId)
		localStorage.setItem(USER_NAME_KEY, nextUser.name)
		localStorage.setItem(USER_EMAIL_KEY, nextUser.email)

		setUser(nextUser)
	}

	const logout = () => {
		localStorage.removeItem(USER_ID_KEY)
		localStorage.removeItem(USER_NAME_KEY)
		localStorage.removeItem(USER_EMAIL_KEY)
		setUser(null)
		setActivePage('home')
		if (window.location.pathname.startsWith('/dashboard')) {
			window.history.pushState({}, '', '/home')
		}
		showToast('Logged out successfully', 'success')
	}

	const value = useMemo<UserContextValue>(
		() => ({
			user,
			isLoggedIn: Boolean(user?.userId),
			setUserFromLogin,
			logout,
            setActivePage,
            activePage,
		}),
		[user, activePage],
	)

	return React.createElement(UserContext.Provider, { value }, children)
}

export const useUser = () => {
	const context = useContext(UserContext)

	if (!context) {
		throw new Error('useUser must be used within UserProvider')
	}

	return context
}
