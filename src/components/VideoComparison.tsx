import VideoCropper from './VideoEditor.tsx'
import { Task, User } from '../types';
import {ADMIN_API_BASE_URL, API_BASE_URL} from '../constants';
import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../contexts/AuthContext.tsx";

interface VideoComparisonProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    task: Task | null;
    getOldestTask: () => void;
    getUser: () => void;
}

const VideoComparison = ({
    user,
    setUser,
    task,
    getOldestTask,
    getUser,
}: VideoComparisonProps) => {
    const { accessToken } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const ws = useRef<WebSocket | null>(null);

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

    const handleReject = async () => {
        if (!task?.dst_user_id) {
            console.error('No user ID available');
            return;
        }
        // Add confirmation dialog
        const isConfirmed = confirm("Are you sure you want to reject this verification video?");
        // Only proceed if user clicked "OK"
        if (!isConfirmed) {
            return;
        }
        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/reject-verification-video?user_id=${task.dst_user_id}&task_id=${task?.id}`,
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
                alert('Failed to reject verification video');
            }
        } catch (error) {
            console.log('error:', error)
        } finally {
            setUser(null);
            getOldestTask();
        }
    };

    const handleConfirmVerification = async () => {
        try {
            const response = await fetch(
                `${ADMIN_API_BASE_URL}/tasks/confirm-edited-verification-video?user_id=${task?.dst_user_id}&task_id=${task?.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `bearer ${accessToken}`
                    },
                }
            );
            if (!response.ok) throw new Error('Failed to confirm video');
            setUser(null);
            getOldestTask();
        } catch (error) {
            console.error('Failed to confirm video:', error);
        } finally {
            setUser(null);
            getOldestTask();
        }
    };
    if (!user?.metadata?.verification_album_original_detail) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Original Video</h3>
                    <div className="aspect-[3/4]">
                        <VideoCropper
                            videoUrl={user.metadata.verification_album_original_detail}
                            onEdit={handleEdit}
                            onReject={handleReject}
                        />
                    </div>
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
                                onClick={handleConfirmVerification}
                            >
                                Confirm Verification
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoComparison;