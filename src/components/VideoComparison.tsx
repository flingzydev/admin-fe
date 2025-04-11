import VideoCropper from "./VideoEditor";
import { Task, User } from "../types";
import { ADMIN_API_BASE_URL } from "../constants";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface VideoComparisonProps {
  user: User | null;
  task: Task | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  getOldestTask: () => void;
  getUser: () => void;
}

const VideoComparison = ({
  user,
  task,
  setUser,
  getOldestTask,
  getUser,
}: VideoComparisonProps) => {
  const { accessToken, ws } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Subscribe to WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const unsubscribe = ws.subscribe((message) => {
      console.log("WebSocket message received:", message);

      if (message.topic === "edit-user-verification-video-completed") {
        setIsEditing(false);
        getUser(); // Fetch updated user data
      }
    });

    return () => {
      unsubscribe();
    };
  }, [ws, getUser]);

  const handleEdit = async (start: number, end: number, rotation: number) => {
    if (!task?.dst_user_id) {
      alert("No user ID available");
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/tasks/edit-verification-video?user_id=${task.dst_user_id}&start_mil=${start * 1000}&end_mil=${end * 1000}&rotation=${rotation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to request editing video");
      }

      // Success response handling happens via WebSocket
    } catch (error) {
      console.error("Failed to request editing video:", error);
      alert("Failed to request editing video");
      setIsEditing(false);
    }
  };

  const handleReject = async () => {
    if (!task?.dst_user_id) {
      alert("No user ID available");
      return;
    }

    const isConfirmed = confirm(
      "Are you sure you want to reject this verification video?",
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/tasks/reject-verification-video?user_id=${task.dst_user_id}&task_id=${task?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        alert("Failed to reject verification video");
        return;
      }
    } catch (error) {
      console.error("Failed to reject verification video:", error);
      alert("Failed to reject verification video");
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
          method: "POST",
          headers: {
            Authorization: `bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to confirm video");
      }
    } catch (error) {
      console.error("Failed to confirm video:", error);
      alert("Failed to confirm video");
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
              <p className="text-blue-700">
                Processing video edit. Please wait...
              </p>
            </div>
          )}
          {!isEditing &&
            user?.metadata?.verification_album_original_edited_detail && (
              <>
                <h3 className="text-lg font-semibold mb-4">Edited Video</h3>
                <div className="aspect-[3/4]">
                  <video
                    src={
                      user.metadata.verification_album_original_edited_detail
                    }
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
