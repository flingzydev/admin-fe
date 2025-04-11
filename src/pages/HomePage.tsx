import { useAuth } from '../contexts/AuthContext';
import { useState} from 'react';
import TaskOverview from './TaskOverview';
import UserSearch from './UserSearch';
import ConnectionStatus from "../components/ConnectionStatus.tsx";
import TabButton from "../components/TabButton.tsx";
import {TaskStatusMap} from "../constants";

type TabType = 'tasksUnresolved' | 'tasksDeferred' | 'users' ;

export const HomePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tasksUnresolved');
    const {logout} = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        <a href={`/home`} className="hover:underline">
                            Dashboard
                        </a>
                    </h1>
                    <ConnectionStatus/>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="mb-6 flex gap-2">
                    <TabButton
                        active={activeTab === 'tasksUnresolved'}
                        onClick={() => setActiveTab('tasksUnresolved')}
                    >
                        Tasks Unresolved
                    </TabButton>
                    <TabButton
                        active={activeTab === 'tasksDeferred'}
                        onClick={() => setActiveTab('tasksDeferred')}
                    >
                        Tasks Deferred
                    </TabButton>
                    <TabButton
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </TabButton>
                </div>

                {activeTab === 'tasksUnresolved' && <TaskOverview status={TaskStatusMap.unresolved} title="Unresolved Tasks" />}
                {activeTab === 'tasksDeferred' && <TaskOverview status={TaskStatusMap.deferred} title="Deferred Tasks" />}
                {activeTab === 'users' && <UserSearch />}
            </div>
        </div>
    );
}