import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import TaskOverview from './TaskOverview';
import UserSearch from './UserSearch';

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

type TabType = 'tasks' | 'users';

export const HomePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tasks');
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="mb-6 flex gap-2">
                    <TabButton
                        active={activeTab === 'tasks'}
                        onClick={() => setActiveTab('tasks')}
                    >
                        Tasks
                    </TabButton>
                    <TabButton
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </TabButton>
                </div>

                {activeTab === 'tasks' ? <TaskOverview /> : <UserSearch />}
            </div>
        </div>
    );
}