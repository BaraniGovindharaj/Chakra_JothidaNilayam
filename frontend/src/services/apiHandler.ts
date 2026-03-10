type RequestInterceptor = (
	input: string,
	init: RequestInit,
) => Promise<[string, RequestInit]> | [string, RequestInit]

type ResponseInterceptor = (
	response: Response,
) => Promise<Response> | Response

type ErrorInterceptor = (error: unknown) => Promise<unknown> | unknown

const getDefaultApiBaseUrl = () => {
	if (typeof window !== 'undefined') {
		return `${window.location.protocol}//${window.location.hostname}:8000`
	}

	return 'http://127.0.0.1:8000'
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? getDefaultApiBaseUrl()

const requestInterceptors: RequestInterceptor[] = []
const responseInterceptors: ResponseInterceptor[] = []
const errorInterceptors: ErrorInterceptor[] = []

export const addRequestInterceptor = (interceptor: RequestInterceptor) => {
	requestInterceptors.push(interceptor)
}

export const addResponseInterceptor = (interceptor: ResponseInterceptor) => {
	responseInterceptors.push(interceptor)
}

export const addErrorInterceptor = (interceptor: ErrorInterceptor) => {
	errorInterceptors.push(interceptor)
}

const runRequestInterceptors = async (url: string, init: RequestInit) => {
	let nextUrl = url
	let nextInit = init

	for (const interceptor of requestInterceptors) {
		const updated = await interceptor(nextUrl, nextInit)
		nextUrl = updated[0]
		nextInit = updated[1]
	}

	return [nextUrl, nextInit] as const
}

const runResponseInterceptors = async (response: Response) => {
	let nextResponse = response
	for (const interceptor of responseInterceptors) {
		nextResponse = await interceptor(nextResponse)
	}
	return nextResponse
}

const runErrorInterceptors = async (error: unknown) => {
	let nextError = error
	for (const interceptor of errorInterceptors) {
		nextError = await interceptor(nextError)
	}
	throw nextError
}

const buildUrl = (path: string) => `${API_BASE_URL}${path}`

export const http = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
	const defaultHeaders: HeadersInit = {
		'Content-Type': 'application/json',
	}

	const mergedInit: RequestInit = {
		...init,
		headers: {
			...defaultHeaders,
			...(init.headers ?? {}),
		},
	}

	try {
		const [url, finalInit] = await runRequestInterceptors(buildUrl(path), mergedInit)
		const response = await fetch(url, finalInit)
		const interceptedResponse = await runResponseInterceptors(response)

		if (!interceptedResponse.ok) {
			const message = `HTTP ${interceptedResponse.status}: ${interceptedResponse.statusText}`
			throw new Error(message)
		}

		if (interceptedResponse.status === 204) {
			return null as T
		}

		return (await interceptedResponse.json()) as T
	} catch (error) {
		return runErrorInterceptors(error)
	}
}

export const apiGet = <T>(path: string, init: RequestInit = {}) =>
	http<T>(path, { ...init, method: 'GET' })

export const apiPost = <T>(path: string, body: unknown, init: RequestInit = {}) =>
	http<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) })


addErrorInterceptor((error) => {
	console.error('HTTP interceptor error:', error)
	return error
})