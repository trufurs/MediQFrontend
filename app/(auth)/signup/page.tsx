"use client";
import { redirect } from "next/navigation";
import { register } from "@/utils/auth";
import Form from 'next/form';
import { useToast } from "@/context/ToastContext";
import { useState } from "react";

export default function SignupPage() {
    const { showToast } = useToast();
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [genderError, setGenderError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const validateForm = (form: HTMLFormElement): boolean => {
        let isValid = true;

        // Reset errors
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

        const boo = await register(form.namee.value, form.email.value, form.password.value, form.gender.value, form.phone.value);
        if (boo) {
            showToast("User Created Successfully", "success");
            redirect("/login");
        } else {
            showToast("Error Creating User", "error");
        }
    }

    return (
        <div className="flex flex-row items-center justify-center">
            <Form
                action={""}
                onSubmit={handleSignup}
                className="flex flex-col items-center justify-center p-10 bg-gray-900 rounded-lg shadow-md"
            >
                <h1 className="text-2xl font-bold text-white-800 mb-6">Signup</h1>
                <div className="w-full mb-4">
                    <label htmlFor="Name" className="block text-sm font-medium text-white-700 mb-1">
                        Name*
                    </label>
                    <input
                        type="text"
                        name="Name"
                        id="namee"
                        placeholder="Enter your Full Name"
                        required
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${nameError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                </div>
                <div className="w-full mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-white-700 mb-1">
                        Email*
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter your email"
                        required
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                <div className="w-full mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-white-700 mb-1">
                        Password*
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        required
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>
                <div className="w-full mb-6">
                    <label className="block text-sm font-medium text-white-700 mb-1">
                        Gender*
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                required
                                className={`form-radio text-blue-600 ${genderError ? 'border-red-500' : ''}`}
                            />
                            <span className="ml-2 text-white">Male</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                required
                                className={`form-radio text-blue-600 ${genderError ? 'border-red-500' : ''}`}
                            />
                            <span className="ml-2 text-white">Female</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="other"
                                required
                                className={`form-radio text-blue-600 ${genderError ? 'border-red-500' : ''}`}
                            />
                            <span className="ml-2 text-white">Other</span>
                        </label>
                    </div>
                    {genderError && <p className="text-red-500 text-sm mt-1">{genderError}</p>}
                </div>
                <div className="w-full mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-white-700 mb-1">
                        Phone*
                    </label>
                    <input
                        type="phone"
                        name="phone"
                        id="phone"
                        placeholder="Enter your phone"
                        required
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                >
                    SignUp
                </button>
            </Form>
        </div>
    );
}