import React, { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { FlashMessages, FloatingStatusPill, Spinner, TopProgressBar, useRouterProcessing } from '../Components/Feedback';

const activeTones = {
    indigo: 'bg-indigo-100 text-indigo-900',
    purple: 'bg-purple-100 text-purple-900',
};

const navItemClass = (active, tone = 'indigo') =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
        active
            ? `${activeTones[tone]} font-semibold shadow-xs`
            : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
    }`;

function Icon({ d, className = 'w-5 h-5 shrink-0' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
        </svg>
    );
}

export default function AppLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const isProcessing = useRouterProcessing();
    const path = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        setAvatarError(false);
    }, [user?.profile_photo_path]);

    const handleLogout = (e) => {
        e.preventDefault();
        setLoggingOut(true);
        router.post('/logout', {}, { onFinish: () => setLoggingOut(false) });
    };

    const showAvatarImage = Boolean(user?.profile_photo_path && !avatarError);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <TopProgressBar active={isProcessing} />
            <FloatingStatusPill active={isProcessing} label="Memproses tindakan..." />

            {/* Mobile header */}
            <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
                <Link href="/" className="text-lg font-extrabold text-indigo-800 cursor-pointer">BlogVerse Pro</Link>
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg text-slate-800 hover:bg-slate-100 cursor-pointer"
                    aria-label="Buka menu navigasi"
                >
                    <Icon d="M4 6h16M4 12h16M4 18h16" />
                </button>
            </header>

            {/* Sidebar */}
            <aside
                aria-label="Sidebar Navigasi"
                className={`fixed md:sticky md:top-0 inset-y-0 left-0 z-40 w-64 md:h-screen bg-white border-r border-slate-200 flex flex-col transform transition-transform ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="px-6 py-5 border-b border-slate-100">
                    <Link href="/" className="flex items-center space-x-2 cursor-pointer">
                        <span className="w-9 h-9 rounded-xl bg-indigo-700 text-white font-extrabold flex items-center justify-center">B</span>
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">BlogVerse <span className="text-indigo-700">Pro</span></span>
                    </Link>
                </div>

                {user && (
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center space-x-3">
                        {showAvatarImage ? (
                            <img
                                src={`/storage/${user.profile_photo_path}`}
                                onError={() => setAvatarError(true)}
                                alt={user.name}
                                width="40"
                                height="40"
                                decoding="async"
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center border border-indigo-200 shrink-0"
                            >
                                {(user.name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-700 truncate">@{user.username} · {user.role}</p>
                        </div>
                    </div>
                )}

                <nav aria-label="Navigasi Utama" className="flex-1 overflow-y-auto p-4 space-y-1.5">
                    <Link href="/articles" className={navItemClass(path.startsWith('/articles') || path === '/')}>
                        <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        <span>Jelajah Artikel</span>
                    </Link>

                    {user && (
                        <Link href="/dashboard/posts" className={navItemClass(path.startsWith('/dashboard/posts'))}>
                            <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            <span>Artikel Saya</span>
                        </Link>
                    )}

                    <Link href="/profile" className={navItemClass(path.startsWith('/profile'))}>
                        <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        <span>Profil Saya</span>
                    </Link>

                    {user?.role === 'admin' && (
                        <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5">
                            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">Admin Area</span>
                            <Link href="/admin/users" className={navItemClass(path.startsWith('/admin/users'), 'purple')}>
                                <Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                <span>Manajemen User</span>
                            </Link>
                            <Link href="/admin/posts" className={navItemClass(path.startsWith('/admin/posts'), 'purple')}>
                                <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                <span>Semua Artikel</span>
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {user ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50 transition cursor-pointer disabled:opacity-60"
                        >
                            {loggingOut ? <Spinner className="w-5 h-5" /> : <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />}
                            <span>Keluar (Logout)</span>
                        </button>
                    ) : (
                        <Link href="/login" className="w-full flex items-center justify-center px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-700 text-white hover:bg-indigo-800 shadow-sm transition cursor-pointer">
                            Masuk ke Akun
                        </Link>
                    )}
                </div>
            </aside>

            {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" />}

            <main id="main-content" className="flex-1 flex flex-col min-w-0">
                <div className="p-4 sm:p-6 lg:p-8 flex-1">
                    <FlashMessages flash={flash} />
                    {children}
                </div>
            </main>
        </div>
    );
}
