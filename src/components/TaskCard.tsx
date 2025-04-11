import { Link } from 'react-router-dom';
import {Task, User} from '../types';
import {ADMIN_API_BASE_URL, taskStatusReverseMap, taskTypeReverseMap} from '../constants';
import {useAuth} from "../contexts/AuthContext.tsx";
import React from "react";

interface TaskCardProps {
    task: Task | null;
    taskType: string | undefined;
    status: number;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    getOldestTask: () => void;
    isUserVerification: boolean;
}

const TaskCard = ({
    task,
    taskType,
    status,
    setUser,
    getOldestTask,
    isUserVerification,
}: TaskCardProps) => {

    const { accessToken } = useAuth();

    const TaskInfoRow = ({ label, value }: { label: string; value: string | number }) => (
        <div className="grid grid-cols-3 py-0 border-b border-gray-100">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
        </div>
    );

    const handleResolve = async () => {
        if (!task) {
            alert('No task available');
            return;
        }

        const isConfirmed = confirm("Are you sure you want to resolve this task?");
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/resolve?task_id=${task.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `bearer ${accessToken}`
                    },
                }
            );

            if (!response.ok) {
                alert('Failed to resolve task');
                return;
            }
        } catch (error) {
            console.error('Failed to resolve task:', error);
            alert('Failed to resolve task');
        } finally {
            setUser(null);
            getOldestTask();
        }
    };

    const handleDefer = async () => {
        if (!task) {
            alert('No task available');
            return;
        }

        const isConfirmed = confirm("Are you sure you want to defer this task?");
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/defer?task_id=${task.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `bearer ${accessToken}`
                    },
                }
            );

            if (!response.ok) {
                alert('Failed to defer task');
                return;
            }
        } catch (error) {
            console.error('Failed to defer task:', error);
            alert('Failed to defer task');
        } finally {
            setUser(null);
            getOldestTask();
        }
    };

    if (!task) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="text-center py-8">
                    <p className="text-lg text-gray-600 mb-4">
                        <span className="font-semibold lowercase">
                            {taskTypeReverseMap[Number(taskType)]}
                        </span>{' '}
                        {status === 0 ? 'unresolved' : 'deferred'} queue is empty
                    </p>
                    <Link
                        to="/home"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Go back to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    {`${taskTypeReverseMap[task.queue_type]} Task (${taskStatusReverseMap[status]})`}
                </h2>
                {!isUserVerification && (
                    <div className="flex space-x-2">
                        {status === 0 ? (
                            // Buttons for unresolved tasks
                            <>
                                <button
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
                                    onClick={handleDefer}
                                >
                                    Defer
                                </button>
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md"
                                    onClick={handleResolve}
                                >
                                    Resolve
                                </button>
                            </>
                        ) : status === 2 ? (
                            // Buttons for deferred tasks
                            <>
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md"
                                    onClick={handleResolve}
                                >
                                    Resolve
                                </button>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
            <dl className="space-y-2">
                <TaskInfoRow label="ID" value={task.id}/>
                <TaskInfoRow label="Status" value={taskStatusReverseMap[task.status]}/>
                <TaskInfoRow label="Queue Type" value={taskTypeReverseMap[task.queue_type]}/>
                <TaskInfoRow label="Created At" value={task.created_at}/>
                <TaskInfoRow label="Updated At" value={task.updated_at}/>
                <TaskInfoRow label="Source User ID" value={task.src_user_id}/>
                <TaskInfoRow label="Destination User ID" value={task.dst_user_id}/>
            </dl>

            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Metadata</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-700">
                        {task.metadata ? JSON.stringify(task.metadata, null, 2) : 'No metadata'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;