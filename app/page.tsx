"use client";
import FeatureCard from "@/components/homecard";
import Image from "next/image";

export default function HomePage() {
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
                src="/medicine.jpg" 
                title="Medicine Information" 
                description="Search for medicines, compare alternatives, and get basic details." 
                button="Learn More"
              />
              <FeatureCard 
                src="/store.jpg" 
                title="Store Management" 
                description="Manage your medical store inventory, orders, and reminders." 
                button="Get Started"
              />
              <FeatureCard 
                src="/hospital.jpg" 
                title="Nearby Facilities" 
                description="Find nearby hospitals and medical stores with real-time location tracking." 
                button="Find Now"
              />
            </section>
        </div>
    );
}
