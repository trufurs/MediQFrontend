"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchInventory } from "@/utils/management";
import { FiBell } from "react-icons/fi";

interface InventoryItem {
  _id: string;
  medicine: {
    name: string;
  };
  expiryDate: string;
  remainingDays: number;
}

const ReminderBell = () => {
  const [notifications, setNotifications] = useState<InventoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cachedInventory, setCachedInventory] = useState<InventoryItem[] | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const loadInventory = useCallback(async () => {
    try {
      let data: InventoryItem[];
      if (cachedInventory) {
        data = cachedInventory;
        console.log("Using cached inventory");
      } else {
        data = await fetchInventory();
        setCachedInventory(data);
        console.log("Fetched inventory from API");
      }

      const expired: InventoryItem[] = [];
      const nearExpiry: InventoryItem[] = [];

      data.forEach((item) => {
        if (item.remainingDays <= 0) {
          expired.push(item);
        } else if (item.remainingDays <= 30) {
          nearExpiry.push(item);
        }
      });

      setNotifications([...expired, ...nearExpiry]);
      // Send browser notifications
      sendBrowserNotifications([...expired, ...nearExpiry]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }, [cachedInventory]);

  const sendBrowserNotifications = (items: InventoryItem[]) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        items.forEach((item) => {
          const isExpired = item.remainingDays <= 0;
          const notificationTitle = isExpired
            ? `Expired Medicine: ${item.medicine.name}`
            : `Near Expiry: ${item.medicine.name}`;
          const notificationBody = isExpired
            ? `Expired on ${new Date(item.expiryDate).toLocaleDateString()}`
            : `Expires in ${item.remainingDays} days, on ${new Date(
                item.expiryDate
              ).toLocaleDateString()}`;

          new Notification(notificationTitle, {
            body: notificationBody,
            icon: "/logo.svg", // Replace with your icon path
          });
        });
      } else {
        console.log("Notification permission denied.");
      }
    });
  };

  useEffect(() => {
    loadInventory();

    const intervalId = setInterval(() => {
      loadInventory();
    }, 60 * 60 * 1000); // Refresh every 1 hour

    return () => clearInterval(intervalId);
  }, [loadInventory]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      // Clear any existing timeout
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // Set a new timeout to close the menu after 10 seconds
      timeoutId.current = setTimeout(() => {
        setIsOpen(false);
      }, 10000);
    }

    // Cleanup function to clear the timeout if the component unmounts or isOpen changes
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block mr-2">
      <button
        onClick={toggleMenu}
        className="relative p-2 text-gray-300 hover:text-white focus:outline-none transition-transform transform hover:scale-110"
      >
        <FiBell className="h-6 w-6 hover-wiggle" />
        {notifications.length > 0 && (
          <div className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-gray-800">
            {notifications.length}
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-md shadow-xl bg-gray-700 ring-1 ring-gray-900 ring-opacity-5 focus:outline-none z-10 md:right-0"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-2" role="none">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`block px-4 py-3 text-sm ${
                    item.remainingDays <= 0 ? "text-red-400" : "text-yellow-300"
                  } hover:bg-gray-600 transition-colors duration-200`}
                  role="menuitem"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{item.medicine.name}</p>
                    <span className="text-gray-500">
                      {item.remainingDays <= 0
                        ? "Expired"
                        : `Expires in ${item.remainingDays} days`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="block px-4 py-2 text-sm text-gray-400" role="menuitem">
                No notifications
              </div>
            )}
          </div>
          {notifications.length > 5 && (
            <div className="py-2 px-4 text-center">
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                See All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderBell;