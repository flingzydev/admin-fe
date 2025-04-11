import { useState } from "react";
import { ChatMessage } from "../types";

const MediaDisplay = ({ message }: { message: ChatMessage }) => {
  const [showPopup, setShowPopup] = useState(false);

  if (!message.metadata) return null;

  const {
    image_view_url,
    video_view_url,
    video_thumbnail_view_url,
    blob_height,
    blob_width,
  } = message.metadata;

  // Calculate dimensions while maintaining aspect ratio
  const maxWidth = 160;
  const calculatedWidth = Math.min(blob_width || 0, maxWidth);
  const calculatedHeight =
    blob_width && blob_height
      ? Math.min((blob_height * calculatedWidth) / blob_width, 220)
      : 160;

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  // Image message
  if (message.image_id && image_view_url) {
    return (
      <>
        <div
          className="rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
          style={{
            width: `${calculatedWidth}px`,
            height: `${calculatedHeight}px`,
          }}
          onClick={openPopup}
        >
          <img
            src={image_view_url}
            alt="Image"
            className="w-full h-full object-cover"
          />
        </div>

        {showPopup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closePopup}
          >
            <div
              className="max-w-4xl max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={image_view_url}
                alt="Full size image"
                className="max-w-full max-h-screen object-contain"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Video message
  if (message.video_id && video_thumbnail_view_url) {
    return (
      <>
        <div
          className="rounded-lg overflow-hidden bg-gray-100 relative cursor-pointer"
          style={{
            width: `${calculatedWidth}px`,
            height: `${calculatedHeight}px`,
          }}
          onClick={openPopup}
        >
          <img
            src={video_thumbnail_view_url}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black rounded-full opacity-70 flex items-center justify-center w-12 h-12">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {showPopup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closePopup}
          >
            <div
              className="max-w-4xl max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={video_view_url}
                controls
                autoPlay
                className="max-w-full max-h-screen"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default MediaDisplay;
