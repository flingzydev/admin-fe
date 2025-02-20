import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    ADMIN_API_BASE_URL,
    TaskStatusMap,
    taskTypeMap,
    taskTypeReverseMap
} from "../constants";

interface TaskCount {
    queue_type: number;
    count: number;
}

interface TaskCountsResponse {
    task_counts?: TaskCount[];
}

type TaskCountsMap = Map<number, number>;

const TaskOverview: React.FC = () => {
    const { accessToken } = useAuth();
    const [taskCounts, setTaskCounts] = useState<TaskCountsMap>(new Map());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const countTasks = async (): Promise<void> => {
            try {
                const response = await fetch(
                    `${ADMIN_API_BASE_URL}/tasks/counts?status=${TaskStatusMap.unresolved}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch task counts');
                }

                const data: TaskCountsResponse = await response.json();
                const countsMap = new Map<number, number>(
                    (data.task_counts || []).map(({ queue_type, count }) => [queue_type, count])
                );
                setTaskCounts(countsMap);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        void countTasks();
    }, [accessToken]);

    if (error) {
        return <div className="text-red-600 p-4">{error}</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks Overview</h2>
            <ul className="space-y-3">
                {(Object.entries(taskTypeMap) as [string, number][]).map(([, queueType]) => (
                    <li
                        key={queueType}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <a href={`/tasks/${queueType}`} className="hover:underline">
                            <span className="font-semibold">
                                {taskTypeReverseMap[queueType as keyof typeof taskTypeReverseMap]}
                            </span>
                        </a>
                        <span className="text-gray-500 ml-2">
                            {isLoading ? "⏳..." : `(${taskCounts.get(queueType) || 0})`}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskOverview;