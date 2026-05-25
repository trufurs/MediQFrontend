"use client";

import { login } from "@/utils/auth";
import Form from 'next/form';
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        
        setLoading(true);
        try {
            const success = await login(form.email.value, form.password.value);
            if (success) {
                showToast("Login Successful", "success");
                router.push("/");
            } else {
                showToast("Invalid email or password", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("An error occurred during login", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 flex flex-col justify-center">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl transition duration-300">
                <h1 className="text-3xl font-extrabold text-white text-center mb-2 tracking-tight">Login</h1>
                <p className="text-gray-400 text-sm text-center mb-8">Access your MediQ account</p>
                
                <Form
                    action={""}
                    onSubmit={handleLogin}
                    className="flex flex-col space-y-6"
                >
                    <div>
                        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Email Address*
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Password*
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-blue-400 hover:text-blue-300 transition duration-200"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition duration-250 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </Form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-blue-400 hover:text-blue-300 transition duration-200"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}