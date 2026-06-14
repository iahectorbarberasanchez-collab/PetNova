'use client'

import React from 'react'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileNav from './MobileNav'
import { motion } from 'framer-motion'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="dashboard-container">
            <div className="noise-overlay" />
            
            {/* Sidebar Desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Navigation & Header */}
            <div className="lg:hidden">
                <MobileHeader />
                <MobileNav />
            </div>

            <main className="dashboard-main">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    {children}
                </motion.div>

                {/* Background Decor */}
                <div 
                    className="orb" 
                    style={{ 
                        top: '-10%', right: '-5%', width: '40vw', height: '40vw', 
                        background: 'radial-gradient(circle, rgba(108,63,245,0.08) 0%, transparent 70%)',
                        filter: 'blur(80px)' 
                    }} 
                />
            </main>
        </div>
    )
}
