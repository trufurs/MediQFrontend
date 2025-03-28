// utils/auth.ts
export const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Ensure cookies are sent
    });

    if (!res.ok) throw new Error("Invalid credentials");
    return await res.json();
};
