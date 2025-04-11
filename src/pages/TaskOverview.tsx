import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ADMIN_API_BASE_URL,
  TaskStatusMap,
  taskTypeMap,
  taskTypeReverseMap,
} from "../constants";

interface TaskCount {
  queue_type: number;
  count: number;
}

interface TaskCountsResponse {
  task_counts?: TaskCount[];
}

type TaskCountsMap = Map<number, number>;

interface TaskOverviewProps {
  status?: number;
  title?: string;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({
  status = TaskStatusMap.unresolved,
  title = "Tasks Overview",
}) => {
  const { accessToken } = useAuth();
  const [taskCounts, setTaskCounts] = useState<TaskCountsMap>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const countTasks = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${ADMIN_API_BASE_URL}/tasks/counts?status=${status}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          alert(`Failed to fetch ${status} task counts`);
        }

        const data: TaskCountsResponse = await response.json();
        const countsMap = new Map<number, number>(
          (data.task_counts || []).map(({ queue_type, count }) => [
            queue_type,
            count,
          ]),
        );
        setTaskCounts(countsMap);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void countTasks();

    // Reset loading state when status changes
    setIsLoading(true);
  }, [accessToken, status]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <ul className="space-y-3">
        {(Object.entries(taskTypeMap) as [string, number][]).map(
          ([, queueType]) => (
            <li
              key={queueType}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <a
                href={`/tasks/${queueType}?status=${status}`}
                className="hover:underline"
              >
                <span className="font-semibold">
                  {
                    taskTypeReverseMap[
                      queueType as keyof typeof taskTypeReverseMap
                    ]
                  }
                </span>
              </a>
              <span className="text-gray-500 ml-2">
                {isLoading ? "⏳..." : `(${taskCounts.get(queueType) || 0})`}
              </span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};

export default TaskOverview;
