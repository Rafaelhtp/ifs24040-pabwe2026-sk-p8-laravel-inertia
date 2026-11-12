import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Track whether an Inertia visit is currently in-flight.
 */
export function useRouterProcessing() {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setIsProcessing(true));
        const removeFinish = router.on('finish', () => setIsProcessing(false));
        const removeError = router.on('error', () => setIsProcessing(false));

        return () => {
            removeStart();
            removeFinish();
            removeError();
        };
    }, []);

    return isProcessing;
}

/**
 * Thin animated progress bar fixed at the very top of the viewport.
 */
export function TopProgressBar({ active }) {
    if (!active) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-indigo-100 overflow-hidden" role="progressbar" aria-label="Memuat">
            <div className="h-full w-1/3 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 animate-[progress-slide_1.1s_ease-in-out_infinite]" />
            <style>{`@keyframes progress-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
        </div>
    );
}

/**
 * Floating pill at the bottom of the screen that tells the user an action is running.
 */
export function FloatingStatusPill({ active, label = 'Memproses tindakan...' }) {
    if (!active) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center space-x-2.5 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl" role="status">
            <Spinner className="w-4 h-4" />
            <span>{label}</span>
        </div>
    );
}

/**
 * Small inline spinner used inside buttons.
 */
export function Spinner({ className = 'w-4 h-4' }) {
    return (
        <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

/**
 * Flash message banners shared across layouts.
 */
export function FlashMessages({ flash }) {
    return (
        <>
            {flash?.success && (
                <div className="mb-4 bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-sm font-medium shadow-xs" role="status">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 bg-red-100 border border-red-300 text-red-900 px-4 py-3 rounded-xl text-sm font-medium shadow-xs" role="alert">
                    {flash.error}
                </div>
            )}
        </>
    );
}
