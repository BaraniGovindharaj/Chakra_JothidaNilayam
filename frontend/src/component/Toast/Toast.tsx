import { ToastContainer, toast, type ToastOptions } from 'react-toastify'

const defaultToastOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
}

export function AppToastContainer() {
    return (
        <ToastContainer
            {...defaultToastOptions}
            newestOnTop
            toastClassName="custom-toast"
            progressClassName="custom-toast-progress"
            icon={false}
        />
    )
}

export default function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    if (!message) {
        return
    }

    toast[type](message, defaultToastOptions)
}