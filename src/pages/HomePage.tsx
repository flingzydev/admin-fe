import { useAuth } from '../contexts/AuthContext';
import { ADMIN_API_BASE_URL, taskTypeMap, taskTypeReverseMap } from '../constants';
import { useEffect, useState } from 'react';

interface TaskCount {
    queue_type: number;
    count: number;
}

interface TaskCountsResponse {
    task_counts?: TaskCount[];
}

export function HomePage() {
    const { accessToken, logout } = useAuth();
    const [taskCounts, setTaskCounts] = useState<Map<number, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const countTasks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/tasks/counts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TaskCountsResponse = await response.json();
            const countsMap = new Map(
                (data.task_counts || []).map(({queue_type, count}) => [queue_type, count])
            );
            setTaskCounts(countsMap);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
            console.error('Failed to count tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        countTasks();
    }, [accessToken]);

    const taskItems = Object.entries(taskTypeMap).map(([, queueType]) => {
        const count = taskCounts.get(queueType) ?? 0;
        return (
            <li key={queueType}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <a href={`/tasks/${queueType}`}
                   className="hover:underline">
                    <span className="font-semibold">
                        {taskTypeReverseMap[queueType]}
                    </span>
                </a>
                <span className="text-gray-500 ml-2">
                    ({count})
                </span>
            </li>
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Task Dashboard
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
                        Tasks Overview
                    </h2>
                    {isLoading ? (
                        <div className="text-center p-4">Loading...</div>
                    ) : error ? (
                        <div className="text-red-600 p-4 text-center">
                            {error}
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {taskItems}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}