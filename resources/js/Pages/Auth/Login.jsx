import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Masuk" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link
                    href="/"
                    aria-label="Beranda BlogVerse Pro"
                    className="inline-flex w-12 h-12 rounded-2xl bg-indigo-700 items-center justify-center text-white font-bold text-2xl shadow-md cursor-pointer"
                >
                    B
                </Link>
                <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
                    BlogVerse <span className="text-indigo-700">Pro</span>
                </h1>
                <p className="mt-2 text-sm text-slate-700">
                    Masuk ke akun Anda untuk menulis dan mengelola artikel blog
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200">
                    <form onSubmit={submit} className="space-y-5">
                        {errors.login && (
                            <div role="alert" className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-sm font-medium">
                                {errors.login}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="login-username"
                                className="block text-sm font-semibold text-slate-800"
                            >
                                Username atau Email
                            </label>
                            <div className="mt-1.5">
                                <input
                                    id="login-username"
                                    type="text"
                                    name="login"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    autoComplete="username"
                                    required
                                    className="block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                    placeholder="Masukkan username atau email"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="block text-sm font-semibold text-slate-800"
                            >
                                Password
                            </label>
                            <div className="mt-1.5">
                                <input
                                    id="login-password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-700 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label htmlFor="login-remember" className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                                <input
                                    id="login-remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-700 focus:ring-indigo-600 border-slate-300"
                                />
                                <span>Ingat saya</span>
                            </label>
                        </div>

                        <div>
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-700">
                        Belum punya akun?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-indigo-800 hover:text-indigo-950 hover:underline cursor-pointer"
                        >
                            Daftar sekarang
                        </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 text-center text-sm">
                        <Link
                            href="/"
                            className="font-semibold text-slate-700 hover:text-indigo-800 cursor-pointer"
                        >
                            ← Kembali ke Beranda Publik
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
