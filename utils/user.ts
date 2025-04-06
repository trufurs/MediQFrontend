import React from 'react'

export default async function GetUserDetails() {
    const token = localStorage.getItem("auth_token");
    if(token){
        const resUser = await fetch(`${process.env.backend}/user/`, {
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        });
        if (resUser.ok) {
            const userData = await resUser.json();
            localStorage.setItem("user_data", JSON.stringify(userData)); // Store user data in localStorage
            console.log("User data stored in localStorage:", localStorage.getItem("user_data"));
            return true;
            }
        else{
            console.log("User data not found in localStorage:", localStorage.getItem("user_data"));
            return false;
        }
    }else{
        console.log("login again");
        return false;
    }
}