import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Daftar Akun" />

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
                    Daftar akun penulis untuk mulai menerbitkan dan mengelola artikel blog Anda
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="register-name" className="block text-sm font-semibold text-slate-800">
                                Nama Lengkap
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                placeholder="Contoh: Budi Santoso"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-700 font-medium">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="register-username" className="block text-sm font-semibold text-slate-800">
                                Username
                            </label>
                            <input
                                id="register-username"
                                type="text"
                                name="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                placeholder="Contoh: budi123"
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-700 font-medium">{errors.username}</p>}
                        </div>

                        <div>
                            <label htmlFor="register-email" className="block text-sm font-semibold text-slate-800">
                                Alamat Email
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                placeholder="budi@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-700 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="register-password" className="block text-sm font-semibold text-slate-800">
                                Password
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                placeholder="Minimal 8 karakter"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-700 font-medium">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="register-password-confirmation" className="block text-sm font-semibold text-slate-800">
                                Konfirmasi Password
                            </label>
                            <input
                                id="register-password-confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                                placeholder="Ulangi password"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                id="register-submit"
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-700">
                        Sudah punya akun?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-indigo-800 hover:text-indigo-950 hover:underline cursor-pointer"
                        >
                            Masuk di sini
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
