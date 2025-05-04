"use client";
import { redirect } from "next/navigation";
import { register } from "@/utils/auth";
import Form from 'next/form';
import { useToast } from "@/context/ToastContext";


export default function SignupPage() {
    const {showToast} = useToast();
    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;

        const boo = await register(form.namee.value ,form.email.value, form.password.value , form.gender.value , form.phone.value)
        if (boo) {
            showToast("User Created Successfully", "success")
            redirect("/login")
        } else {
            showToast("Error Creating User", "error")
        }
        // const formData = new FormData(form);
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                                className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-white">Male</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                required
                                className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-white">Female</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="other"
                                required
                                className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-white">Other</span>
                        </label>
                    </div>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                >
                    Login
                </button>
            </Form>
        </div>
    );
}