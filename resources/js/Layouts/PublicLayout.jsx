import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { FlashMessages, FloatingStatusPill, Spinner, TopProgressBar, useRouterProcessing } from '../Components/Feedback';

/**
 * Layout for public pages: sticky top navbar + editorial footer, no sidebar.
 */
export default function PublicLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const isProcessing = useRouterProcessing();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const dashboardHref = user?.role === 'admin' ? '/admin/users' : '/dashboard/posts';

    const logout = () => {
        setLoggingOut(true);
        router.post('/logout', {}, { onFinish: () => setLoggingOut(false) });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <TopProgressBar active={isProcessing} />
            <FloatingStatusPill active={isProcessing} label="Memproses tindakan..." />

            {/* Sticky Top Navbar */}
            <header id="public-navbar" className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 cursor-pointer">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center">B</span>
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">BlogVerse <span className="text-indigo-600">Pro</span></span>
                    </Link>

                    <nav className="hidden sm:flex items-center space-x-2">
                        <Link href="/articles" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-700 rounded-lg cursor-pointer">Artikel</Link>
                        {user ? (
                            <>
                                <Link href={dashboardHref} className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer">Dashboard</Link>
                                <button type="button" onClick={logout} disabled={loggingOut} className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer inline-flex items-center space-x-2 disabled:opacity-60">
                                    {loggingOut && <Spinner />}
                                    <span>Keluar</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">Masuk</Link>
                                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer">Daftar</Link>
                            </>
                        )}
                    </nav>

                    <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer" aria-label="Buka menu">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>

                {menuOpen && (
                    <div className="sm:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
                        <Link href="/articles" className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg cursor-pointer">Artikel</Link>
                        {user ? (
                            <Link href={dashboardHref} className="block px-3 py-2 text-sm font-semibold text-indigo-700 rounded-lg cursor-pointer">Dashboard</Link>
                        ) : (
                            <>
                                <Link href="/login" className="block px-3 py-2 text-sm font-semibold text-slate-700 rounded-lg cursor-pointer">Masuk</Link>
                                <Link href="/register" className="block px-3 py-2 text-sm font-semibold text-indigo-700 rounded-lg cursor-pointer">Daftar</Link>
                            </>
                        )}
                    </div>
                )}
            </header>

            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
                    <FlashMessages flash={flash} />
                </div>
                {children}
            </main>

            {/* Editorial Footer */}
            <footer id="public-footer" className="bg-slate-900 text-slate-300 mt-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
                    <div>
                        <p className="text-xl font-extrabold text-white">BlogVerse <span className="text-indigo-400">Pro</span></p>
                        <p className="mt-3 text-sm text-slate-400 leading-relaxed">Ruang editorial untuk menulis, membaca, dan berbagi gagasan lintas topik bersama komunitas penulis.</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-200">Jelajah</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-white cursor-pointer">Beranda</Link></li>
                            <li><Link href="/articles" className="hover:text-white cursor-pointer">Semua Artikel</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-200">Bergabung</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><Link href="/login" className="hover:text-white cursor-pointer">Masuk</Link></li>
                            <li><Link href="/register" className="hover:text-white cursor-pointer">Daftar Sebagai Penulis</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} BlogVerse Pro. Dibuat dengan Laravel, Inertia & React.
                </div>
            </footer>
        </div>
    );
}
