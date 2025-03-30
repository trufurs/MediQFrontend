// utils/auth.ts
export const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const { token } = await res.json();
    localStorage.setItem("auth_token", token);

    // Optionally, you can also store user data in localStorage or sessionStorage
    const resUser = await fetch("http://localhost:3000/user/", {
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
    const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, email, password , gender , phone }),
    });

    if (!res.ok) return false;
    return await true;
}