import React from "react";

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

// Tab components
const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-medium rounded-t-lg ${
            active
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 bg-gray-100'
        }`}
    >
        {children}
    </button>
);

export default TabButton;