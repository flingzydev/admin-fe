import { useAuth } from '../contexts/AuthContext';
import {ADMIN_API_BASE_URL, API_BASE_URL, taskStatusReverseMap, taskTypeReverseMap} from '../constants';
import {useEffect, useState, useRef, useCallback} from 'react';
import { useParams } from 'react-router-dom';
import { Task, User } from '../types';
import VideoCropper from "../components/VideoEditor.tsx";
import {Link} from "react-router-dom"
import UserCard from "../components/UserCard.tsx";

export function TaskPage() {
    const { accessToken, logout } = useAuth();
    const { taskType } = useParams();
    const ws = useRef<WebSocket | null>(null);

    const [task, setTask] = useState<Task | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = async (start: number, end: number, rotation: number) => {
        if (!task?.dst_user_id) {
            console.error('No user ID available');
            return;
        }

        setIsEditing(true);
        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/edit-verification-video?user_id=${task.dst_user_id}&start_mil=${start*1000}&end_mil=${end*1000}&rotation=${rotation}`,
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
                throw new Error('Failed to request editing video');
            }

            // Success response handling happens via WebSocket
        } catch (error) {
            console.error('Failed to request editing video:', error);
            setIsEditing(false);
        }
    };

    const getUser = useCallback(async () => {
        try {
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
                console.log('user?.metadata?.verification_album_original_detail:', user?.metadata?.verification_album_original_detail);
                console.log('user?.metadata?.verification_album_original_edited_detail:', user?.metadata?.verification_album_original_edited_detail);
            } else {
                throw new Error('Failed to get user');
            }
        } catch (error) {
            console.error('Failed to get user:', error);
        }
    },[accessToken, task?.dst_user_id]);

    const getOldestTask = async () => {
        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/oldest-task?status=0&queue_type=${taskType}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `bearer ${accessToken}`
                    },
                }
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
                throw new Error('Failed to get task');
            }
        } catch (error) {
            console.error('Failed to get task:', error);
            throw new Error('Failed to get task');
        }
    };

    // Initialize WebSocket connection
    useEffect(() => {
        ws.current = new WebSocket(`${API_BASE_URL}/ws?token=Bearer ${accessToken}`);

        ws.current.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.current.onmessage = (event) => {
            console.log("WebSocket message received:", event.data);
            const [status] = event.data.split("|");

            if (status === 'edit-user-verification-video-completed') {
                setIsEditing(false);
                getUser(); // Fetch updated user data
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [accessToken, getUser]);

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
                        {task ? (
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
                        ): (
                            <>
                                <p>There's no task for this given queue type.</p>
                                <Link to="/home" style={{ color: 'blue' }}>
                                    Go back to Homepage
                                </Link>
                            </>
                        )}
                    </ul>
                </div>

                {task?.queue_type === 3 && (
                    <div className="mb-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Original Video</h3>
                                {user?.metadata?.verification_album_original_detail ? (
                                    <div className="aspect-[3/4]">
                                        <VideoCropper
                                            videoUrl={user.metadata.verification_album_original_detail}
                                            onEdit={handleEdit}
                                        />
                                    </div>
                                ) : (
                                    <p>**No original video available**</p>
                                )}
                            </div>

                            <div>
                                {isEditing && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-blue-700">Processing video edit. Please wait...</p>
                                    </div>
                                )}
                                {!isEditing && user?.metadata?.verification_album_original_edited_detail && (
                                    <>
                                        <h3 className="text-lg font-semibold mb-4">Edited Video</h3>
                                        <div className="aspect-[3/4]">
                                            <video
                                                src={user.metadata.verification_album_original_edited_detail}
                                                controls
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        </div>
                                        <button
                                            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(
                                                        `${ADMIN_API_BASE_URL}/tasks/confirm-edited-verification-video?user_id=${task.dst_user_id}&task_id=${task.id}`,
                                                        {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `bearer ${accessToken}`
                                                            },
                                                        }
                                                    );
                                                    if (!response.ok) throw new Error('Failed to confirm video');
                                                    getOldestTask();
                                                } catch (error) {
                                                    console.error('Failed to confirm video:', error);
                                                }
                                            }}
                                        >
                                            Confirm Verification
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <UserCard user={user} />
            </div>
        </div>
    );
}