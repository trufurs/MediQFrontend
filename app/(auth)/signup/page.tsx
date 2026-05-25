"use client";

import { useRouter } from "next/navigation";
import { register } from "@/utils/auth";
import Form from 'next/form';
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [genderError, setGenderError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const validateForm = (form: HTMLFormElement): boolean => {
        let isValid = true;

        setNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setGenderError(null);
        setPhoneError(null);

        if (!form.namee.value.trim()) {
            setNameError("Name is required");
            isValid = false;
        }

        if (!form.email.value.trim()) {
            setEmailError("Email is required");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value)) {
            setEmailError("Invalid email format");
            isValid = false;
        }

        if (!form.password.value.trim()) {
            setPasswordError("Password is required");
            isValid = false;
        } else if (form.password.value.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        }

        const gender = form.gender?.value;
        if (!gender) {
            setGenderError("Gender is required");
            isValid = false;
        }

        if (!form.phone.value.trim()) {
            setPhoneError("Phone is required");
            isValid = false;
        } else if (!/^\d{10}$/.test(form.phone.value)) {
            setPhoneError("Invalid phone format (10 digits required)");
            isValid = false;
        }

        return isValid;
    };

    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;

        if (!validateForm(form)) {
            return;
        }

        setLoading(true);
        try {
            const success = await register(
                form.namee.value,
                form.email.value,
                form.password.value,
                form.gender.value,
                form.phone.value
            );
            if (success) {
                showToast("User Created Successfully", "success");
                router.push("/login");
            } else {
                showToast("Error Creating User. Email might be in use.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("An error occurred during registration", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl transition duration-300">
                <h1 className="text-3xl font-extrabold text-white text-center mb-2 tracking-tight">Signup</h1>
                <p className="text-gray-400 text-sm text-center mb-8">Create your MediQ account</p>
                
                <Form
                    action={""}
                    onSubmit={handleSignup}
                    className="flex flex-col space-y-5"
                >
                    <div>
                        <label htmlFor="namee" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Full Name*
                        </label>
                        <input
                            type="text"
                            name="Name"
                            id="namee"
                            placeholder="John Doe"
                            required
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 ${nameError ? 'border-red-500/50' : 'border-white/10'}`}
                        />
                        {nameError && <p className="text-red-400 text-xs mt-1.5 font-medium">{nameError}</p>}
                    </div>

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
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 ${emailError ? 'border-red-500/50' : 'border-white/10'}`}
                        />
                        {emailError && <p className="text-red-400 text-xs mt-1.5 font-medium">{emailError}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Password*
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            required
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 ${passwordError ? 'border-red-500/50' : 'border-white/10'}`}
                        />
                        {passwordError && <p className="text-red-400 text-xs mt-1.5 font-medium">{passwordError}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                            Gender*
                        </label>
                        <div className="flex items-center space-x-6">
                            {["male", "female", "other"].map((g) => (
                                <label key={g} className="flex items-center cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        required
                                        className="form-radio text-blue-600 border-white/10 bg-white/5 focus:ring-blue-500/50 h-4 w-4"
                                    />
                                    <span className="ml-2 text-sm text-gray-300 capitalize">{g}</span>
                                </label>
                            ))}
                        </div>
                        {genderError && <p className="text-red-400 text-xs mt-1.5 font-medium">{genderError}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Phone Number*
                        </label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            placeholder="10-digit number"
                            required
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 ${phoneError ? 'border-red-500/50' : 'border-white/10'}`}
                        />
                        {phoneError && <p className="text-red-400 text-xs mt-1.5 font-medium">{phoneError}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition duration-250 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </Form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-400 hover:text-blue-300 transition duration-200"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}