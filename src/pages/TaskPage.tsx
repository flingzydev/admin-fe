import { useAuth } from "../contexts/AuthContext";
import { ADMIN_API_BASE_URL, taskTypeMap } from "../constants";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Task, User } from "../types";
import UserCard from "../components/UserCard.tsx";
import VideoComparison from "../components/VideoComparison.tsx";
import TaskCard from "../components/TaskCard.tsx";
import ConnectionStatus from "../components/ConnectionStatus.tsx";

export function TaskPage() {
  const { accessToken, logout } = useAuth();
  const { taskType } = useParams();
  const [searchParams] = useSearchParams();
  const status = parseInt(searchParams.get("status") || "0", 10); // Default to unresolved (0)

  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getUser = useCallback(async () => {
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/users/user?id=${task?.dst_user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `bearer ${accessToken}`,
          },
        },
      );
      if (response.ok) {
        const data: User = await response.json();
        setUser(data);
      } else {
        throw new Error("Failed to get user");
      }
    } catch (error) {
      console.error("Failed to get user:", error);
    }
  }, [accessToken, task?.dst_user_id]);

  const getOldestTask = useCallback(async () => {
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/tasks/oldest-task?status=${status}&queue_type=${taskType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `bearer ${accessToken}`,
          },
        },
      );
      if (response.ok) {
        const data: Task[] = await response.json();
        // If there's no data or the array is empty, handle it appropriately
        if (!data || data.length === 0) {
          // perhaps set some default state, or show an error
          setTask(null);
        } else {
          // Otherwise, use the first element
          setTask(data[0]);
        }
      } else {
        throw new Error("Failed to get task");
      }
    } catch (error) {
      console.error("Failed to get task:", error);
      throw new Error("Failed to get task");
    }
  }, [accessToken, status, taskType]);

  useEffect(() => {
    getOldestTask();
  }, [getOldestTask]);

  useEffect(() => {
    if (task) {
      getUser();
    }
  }, [task, getUser]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <a href={`/home`} className="hover:underline">
              Dashboard
            </a>
          </h1>
          <ConnectionStatus />
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <TaskCard
          task={task}
          taskType={taskType}
          status={status}
          setUser={setUser}
          getOldestTask={getOldestTask}
          isUserVerification={Number(taskType) === taskTypeMap.verification}
        />

        <UserCard user={user} />

        {Number(taskType) === taskTypeMap.verification && (
          <VideoComparison
            user={user}
            task={task}
            setUser={setUser}
            getOldestTask={getOldestTask}
            getUser={getUser}
          />
        )}
      </div>
    </div>
  );
}
