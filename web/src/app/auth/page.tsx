'use client'

import { Suspense } from 'react'
import { AuthContent } from './AuthContent'

export default function AuthPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070F' }} />}>
            <AuthContent />
        </Suspense>
    )
}
