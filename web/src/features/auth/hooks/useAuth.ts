import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export type AuthMode = 'login' | 'signup'

export function useAuth() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [refCode, setRefCode] = useState<string | null>(null)

    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) {
            const code = ref.toUpperCase().trim()
            setRefCode(code)
            setMode('signup')
            document.cookie = `petnova_ref=${code}; path=/; max-age=7200; SameSite=Lax`
        }
    }, [searchParams])

    const getCallbackUrl = () => refCode
        ? `${window.location.origin}/auth/callback?ref=${refCode}`
        : `${window.location.origin}/auth/callback`

    const getErrorMessage = (err: any) => {
        if (!err) return 'Ocurrió un error inesperado'
        const msg = typeof err === 'string' ? err : err.message
        return msg === 'Failed to fetch' 
            ? 'El servidor no está accesible en este momento. Por favor, revisa tu conexión a internet o inténtalo más tarde.' 
            : msg
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(null); setSuccess(null)
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name },
                        emailRedirectTo: getCallbackUrl(),
                    },
                })
                if (error) setError(getErrorMessage(error))
                else setSuccess('¡Revisa tu email para confirmar tu cuenta! 🐾')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) setError(getErrorMessage(error))
                else router.push('/dashboard')
            }
        } catch (err: any) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setGoogleLoading(true); setError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getCallbackUrl(),
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                },
            })
            if (error) { setError(getErrorMessage(error)); setGoogleLoading(false) }
        } catch (err: any) {
            setError(getErrorMessage(err)); setGoogleLoading(false)
        }
    }

    const switchMode = (m: AuthMode) => { setMode(m); setError(null); setSuccess(null) }

    return {
        mode,
        email, setEmail,
        password, setPassword,
        name, setName,
        loading,
        googleLoading,
        error,
        success,
        refCode,
        handleEmailAuth,
        handleGoogleAuth,
        switchMode
    }
}
