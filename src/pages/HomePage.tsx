import { useAuth } from '../contexts/AuthContext';
import { ADMIN_API_BASE_URL, taskTypeReverseMap } from '../constants';
import { useEffect, useState } from 'react';
import { TaskCountsResponse } from '../types';

export function HomePage() {
    const { accessToken, logout } = useAuth();
    const [taskCounts, setTaskCounts] = useState<TaskCountsResponse | null>(null);

    const countTasks = async () => {
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/tasks/counts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `bearer ${accessToken}`
                },
            });
            if (response.ok) {
                const data: TaskCountsResponse = await response.json();
                console.log(data.task_counts);
                setTaskCounts(data);
            } else {
                throw new Error('Failed to count tasks');
            }
        } catch (error) {
            console.error('Failed to count tasks:', error);
            throw new Error('Failed to count tasks');
        }
    };

    useEffect(() => {
        countTasks();
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

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Tasks
                    </h2>
                    {!taskCounts?.task_counts?.length ? (
                        <p className="text-gray-500 p-4 text-center">No tasks available</p>
                    ) : (
                        <ul className="space-y-3">
                            {taskCounts.task_counts.map((task) => (
                                <li
                                    key={task.queue_type}
                                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <a href={`/tasks/${task.queue_type}`} className="hover:underline">
                                        <span className="font-semibold">{taskTypeReverseMap[task.queue_type]}</span>
                                    </a> <span className="text-gray-500">({task.count})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
} 