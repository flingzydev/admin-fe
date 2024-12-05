import { useAuth } from '../contexts/AuthContext';
import { ADMIN_API_BASE_URL, taskStatusReverseMap, taskTypeReverseMap } from '../constants';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Task, User } from '../types';

export function TaskPage() {
    const { accessToken, logout } = useAuth();
    const { taskType } = useParams();

    const [task, setTask] = useState<Task | null>(null);
    const [user, setUser] = useState<User | null>(null);

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

    const getUser = async () => {
        const response = await fetch(`${ADMIN_API_BASE_URL}/users/user?id=${task?.dst_user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `bearer ${accessToken}`
            },
        });
        if (response.ok) {
            const data: User = await response.json();
            setUser(data);
        } else {
            throw new Error('Failed to get user');
        }
    }

    useEffect(() => {
        getOldestTask();
    }, []);

    useEffect(() => {
        if (task) {
            getUser();
        }
    }, [task]);

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
                                <p>ID: {task.id}</p>
                                <p>Status: {taskStatusReverseMap[task.status]}</p>
                                <p>Queue Type: {taskTypeReverseMap[task.queue_type]}</p>
                                <p>Created At: {task.created_at}</p>
                                <p>Updated At: {task.updated_at}</p>
                                <p>Source User ID: {task.src_user_id}</p>
                                <p>Destination User ID: {task.dst_user_id}</p>
                                <p>Metadata:</p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                                        {task.metadata ? JSON.stringify(task.metadata, null, 2) : 'No metadata'}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Destination User
                    </h2>
                    <div className="overflow-y-auto max-h-[500px]">
                        <p>User ID: {user?.id}</p>
                        <p>Username: {user?.username}</p>
                        <p>Phone: {user?.phone}</p>
                        <p>Email: {user?.email}</p>
                        <p>Gender: {user?.gender}</p>
                        <p>Birthday: {user?.birthday}</p>
                        <p>Height: {user?.height}</p>
                        <p>Body Type: {user?.body_type}</p>
                        <p>Ethnicity: {user?.ethnicity}</p>
                        <p>Drink: {user?.drink}</p>
                        <p>Smoke: {user?.smoke}</p>
                        <p>Tattoo: {user?.tattoo}</p>
                        <p>MBTI: {user?.mbti}</p>
                        <p>Relationship Speed: {user?.relationship_speed}</p>
                        <p>Created At: {user?.created_at}</p>
                        <p>Updated At: {user?.updated_at}</p>
                        <p>Deleted: {user?.deleted ? 'Yes' : 'No'}</p>
                        <p>Is Hidden: {user?.is_hidden ? 'Yes' : 'No'}</p>
                        <p>Is Onboarded: {user?.is_onboarded ? 'Yes' : 'No'}</p>
                        <p>Is Online: {user?.is_online ? 'Yes' : 'No'}</p>
                        <p>Is Verified: {user?.is_verified ? 'Yes' : 'No'}</p>
                        <p>Last Online: {user?.last_online}</p>
                        <p>Metadata:</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                                {user?.metadata ? JSON.stringify(user.metadata, null, 2) : 'No metadata'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 