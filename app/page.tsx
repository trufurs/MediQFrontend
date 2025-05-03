"use client";
import FeatureCard from "@/components/homecard";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import AddRequestDialog from "@/components/AddRequestDialogWrapper";
import { checkPendingRequests } from "@/utils/request";
import { useToast } from "@/context/ToastContext"; 
export default function HomePage() {
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter(); // Initialize useRouter
    const { showToast } = useToast(); // Initialize toast context

    const handleStoreManagementClick = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            showToast("Please log in to access store management.", "error"); // Show error toast
            router.push("/login"); // Redirect to login page
            return;
        }
        const userRole = localStorage.getItem("user_data");
        if (userRole === "store-owner") {
            router.push("/inventory"); // Redirect to home page if not a store manager
            return;
        }

        try {
            const pendingRequests = await checkPendingRequests(token);
            if (!pendingRequests || pendingRequests.length === 0) {
                setShowDialog(true);
            } else {
                showToast("You already have pending requests.", "success"); // Show info toast
            }
        } catch (error) {
            console.error("Error checking pending requests:", error);
            alert("Failed to check pending requests. Please try again.");
        }
    };

    return (
        <div className="bg-black text-white flex flex-col items-center ">
            <section className="hero text-center ">
                <h1 className="text-4xl font-bold">Welcome to MediQ</h1>
                <p className="text-lg text-gray-300 mt-2">
                  Your one-stop solution for medicine information, store management, and nearby medical facilities.
                </p>
                <button className="mt-5 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Explore Features</button>
            </section>

            <section id="features" className="features grid grid-cols-1 md:grid-cols-3 gap-10 p-10 w-full ">
              <FeatureCard
                src="/medicine.png" 
                title="Medicine Information" 
                description="Search for medicines, compare alternatives, and get basic details." 
                button="Learn More"
                onClick={() => router.push("/medicine")} // Use router.push
              />
              <FeatureCard 
                src="/store.png" 
                title="Store Management" 
                description="Manage your medical store inventory, orders, and reminders." 
                button="Get Started"
                onClick={handleStoreManagementClick}
              />
              <FeatureCard 
                src="/hospital.png" 
                title="Nearby Facilities" 
                description="Find nearby hospitals and medical stores with real-time location tracking." 
                button="Find Now"
                onClick={() => router.push("/map")} // Use router.push
              />
            </section>

            {showDialog && (
                <AddRequestDialog
                    onClose={() => setShowDialog(false)}
                    onRequestAdded={(request) => {
                        console.log("Request added:", request);
                        setShowDialog(false);
                        showToast("Request added successfully!", "success"); // Show success toast
                    }}
                />
            )}
        </div>
    );
}
