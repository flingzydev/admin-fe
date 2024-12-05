import { useAuth } from '../contexts/AuthContext';
import { ADMIN_API_BASE_URL } from '../constants';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Task {
    created_at: string,
    dst_user_id: string,
    id: string,
    metadata: object,
    queue_type: number,
    src_user_id: string,
    status: number,
    updated_at: string
}

interface User {
    birthday: string,
    body_type: number,
    created_at: string,
    deleted: boolean,
    drink: number,
    email: string,
    ethnicity: number,
    gender: number,
    height: number,
    id: string,
    is_hidden: boolean,
    is_onboarded: boolean,
    is_online: boolean,
    is_verified: boolean,
    last_online: string,
    mbti: number,
    metadata: object,
    phone: string,
    relationship_speed: number,
    smoke: number,
    tattoo: number,
    updated_at: string,
    username: string
}

export function TaskPage() {
    const { accessToken, logout } = useAuth();
    const [task, setTask] = useState<Task | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const { taskType } = useParams();

    const getOldestTask = async () => {
        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/oldest-task?status=0&queue_type=${taskType}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `bearer ${accessToken}`
                },
            });
            if (response.ok) {
                const data: Task = await response.json();
                console.log(data);
                setTask(data);
            } else {
                throw new Error('Failed to get task');
            }
        } catch (error) {
            console.error('Failed to get task:', error);
            throw new Error('Failed to get task');
        }
    };

    useEffect(() => {
        getOldestTask();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome!
                    </h1>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Task
                    </h2>
                    <ul className="space-y-3">
                        {task && (
                            <div>
                                <p>{task.created_at}</p>
                                <p>{JSON.stringify(task.metadata)}</p>
                            </div>
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        User
                    </h2>
                    <ul className="space-y-3">
                        <li>
                            <p>User ID: {task?.dst_user_id}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 