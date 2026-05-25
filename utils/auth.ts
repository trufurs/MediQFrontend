
// utils/auth.ts
const host = `${process.env.NEXT_PUBLIC_BACKEND}`; // Define the host URL
export const login = async (email: string, password: string) => {
    const res = await fetch(`${host}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const { token } = await res.json();
    localStorage.setItem("auth_token", token);

    // Optionally, you can also store user data in localStorage or sessionStorage
    const resUser = await fetch(`${host}/user/`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    if (resUser.ok) {
        const userData = await resUser.json();
        localStorage.setItem("user_data", JSON.stringify(userData)); // Store user data in localStorage
    }
    console.log("User data stored in localStorage:", localStorage.getItem("user_data"));
    window.dispatchEvent(new Event("storage")); // Trigger the storage event manually
    return true // ✅ Store token in localStorage
};


export const register = async (name:string , email: string, password: string , gender:string , phone:string) => {
    const res = await fetch(`${host}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, email, password , gender , phone }),
    });

    if (!res.ok) return false;
    return await true;
};

export const forgotPassword = async (email: string) => {
    const res = await fetch(`${host}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) return false;
    return await res.json();
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const res = await fetch(`${host}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
    });
    return res.ok;
};