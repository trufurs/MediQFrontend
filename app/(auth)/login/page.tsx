"use client";
import { redirect } from "next/navigation";
import { login } from "@/utils/auth";
import Form from 'next/form'


export default  function LoginPage() {
    const handleLogin =  async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        if(await login(form.email.value, form.password.value)){
            redirect("/");
        }
    }
    return (
        <div className="flex flex-row items-center justify-center">
            <Form
                action={""}
                onSubmit={handleLogin}
                className="flex flex-col items-center justify-center p-10 bg-gray-900 rounded-lg shadow-md"
            >
                <h1 className="text-2xl font-bold text-white-800 mb-6">Login</h1>
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