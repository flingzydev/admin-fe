import { User } from "../types";
import {
  GenderMap,
  BodyTypeMap,
  DrinkMap,
  SmokeMap,
  TattooMap,
  EthnicityMap,
  MBTIMap,
  RelationshipSpeedArray,
  InterestsMap,
} from "../constants";
import { useState } from "react";

interface UserCardProps {
  user?: User | null;
}

const UserCard = ({ user }: UserCardProps) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  if (!user) return null;

  const formatBirthday = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatHeight = (inches?: number) => {
    if (!inches) return "N/A";
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const renderAlbum = (albumDetailsStr?: string) => {
    if (!albumDetailsStr) return null;
    try {
      const photos = JSON.parse(albumDetailsStr);
      return (
        <div className="flex flex-wrap gap-4">
          {photos.map((photo: any) => (
            <div
              key={photo.blob_id}
              className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => {
                setSelectedImageUrl(photo.medium_view_url);
                setShowImageModal(true);
              }}
            >
              <img
                src={photo.medium_view_url}
                alt="Album photo"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      );
    } catch {
      return null;
    }
  };

  const getPreferences = () => {
    try {
      return JSON.parse(user.metadata?.preferences || "{}");
    } catch {
      return {};
    }
  };

  const prefs = getPreferences();

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden">
            {user.metadata?.public_album_details ? (
              <img
                src={
                  JSON.parse(user.metadata.public_album_details)[0]
                    ?.small_view_url
                }
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-xl">No photo</span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.metadata?.first_name || "N/A"}
                </h2>
                <p className="text-sm text-gray-500">{user.id || "N/A"}</p>
                <p className="text-sm text-gray-500">
                  {user.username || "N/A"} / {user.email || "N/A"} /{" "}
                  {user.phone || "N/A"}
                </p>
                {user?.metadata?.verification_album_detail && (
                  <div>
                    <button
                      className="cursor-pointer"
                      style={{
                        padding: "2px 4px",
                        backgroundColor: "white",
                        border: "2px solid #d0d0d0",
                        borderRadius: "5px",
                      }}
                      onClick={() => setShowVideoModal(true)}
                    >
                      Play Verification Video
                    </button>

                    {showVideoModal && (
                      <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setShowVideoModal(false)}
                      >
                        <div
                          className="relative max-w-3xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="absolute -top-10 right-0 text-white text-2xl"
                            onClick={() => setShowVideoModal(false)}
                          >
                            ×
                          </button>
                          <video controls autoPlay className="w-full">
                            <source
                              src={user.metadata.verification_album_detail}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}

                    {showImageModal && (
                      <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setShowImageModal(false)}
                      >
                        <div
                          className="relative max-w-3xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="absolute -top-10 right-0 text-white text-2xl"
                            onClick={() => setShowImageModal(false)}
                          >
                            ×
                          </button>
                          <img
                            src={selectedImageUrl}
                            alt="Selected photo"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="flex gap-2 mb-2">
                  {user.is_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Verified
                    </span>
                  )}
                  {user.is_online && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Online
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  <p>Created: {new Date(user.created_at).toLocaleString()}</p>
                  <p>
                    Last Online: {new Date(user.last_online).toLocaleString()}
                  </p>
                  <p>
                    {!user.is_hidden && (
                      <span className="text-green-500">Visible</span>
                    )}
                    {user.is_hidden && (
                      <span className="text-red-500">Hidden</span>
                    )}
                  </p>
                  <p>
                    {user.is_onboarded ? (
                      <span className="text-green-500">Onboarded</span>
                    ) : (
                      <span className="text-red-500">Not Onboarded</span>
                    )}
                  </p>
                  <p>
                    {user.deleted ? (
                      <span className="text-red-500">Deleted</span>
                    ) : (
                      <span className="text-green-500">Not Deleted</span>
                    )}
                  </p>
                  <p>
                    {user.blocked ? (
                      <span className="text-red-500">Blocked</span>
                    ) : (
                      <span className="text-green-500">Not Blocked</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-2">
              Basic Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2">
                <div>
                  <span className="text-gray-600 font-semibold">Birthday:</span>
                </div>
                <div>{formatBirthday(user.birthday)}</div>
                <div>
                  <span className="text-gray-600 font-semibold">Age:</span>
                </div>
                <div>{user.age || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">Height:</span>
                </div>
                <div>{formatHeight(user.height)}</div>
                <div>
                  <span className="text-gray-600 font-semibold">Gender:</span>
                </div>
                <div>{GenderMap[user.gender] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">
                    Ethnicity:
                  </span>
                </div>
                <div>{EthnicityMap[user.ethnicity] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">
                    Body Type:
                  </span>
                </div>
                <div>{BodyTypeMap[user.body_type] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">Drink:</span>
                </div>
                <div>{DrinkMap[user.drink] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">Smoke:</span>
                </div>
                <div>{SmokeMap[user.smoke] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">Tattoo:</span>
                </div>
                <div>{TattooMap[user.tattoo] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">MBTI:</span>
                </div>
                <div>{MBTIMap[user.mbti] || "N/A"}</div>
                <div>
                  <span className="text-gray-600 font-semibold">
                    Relationship Speed:
                  </span>
                </div>
                <div>
                  {RelationshipSpeedArray.find(
                    (speed) => speed.value === user.relationship_speed,
                  )?.title || "N/A"}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-gray-600 font-semibold">Interests:</div>
                <div className="mt-1">
                  {user.metadata?.interests
                    ? user.metadata.interests
                        .split(",")
                        .map((id) => InterestsMap[parseInt(id)] || "")
                        .filter(Boolean)
                        .join(", ") || "N/A"
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-2">
              Preferences
            </h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2">
                <div>
                  <span className="text-gray-600 font-semibold">
                    Height Preference:
                  </span>
                </div>
                <div>
                  {formatHeight(prefs.height_pref_min)} -{" "}
                  {formatHeight(prefs.height_pref_max)}
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">
                    Age Preference:
                  </span>
                </div>
                <div>
                  {prefs.age_pref_min || "N/A"} - {prefs.age_pref_max || "N/A"}{" "}
                  years old
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">
                    Gender Preference:
                  </span>
                </div>
                <div>{GenderMap[prefs.gender_pref] || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">
            Public Album
          </h3>
          {user.metadata?.public_album_details ? (
            renderAlbum(user.metadata.public_album_details)
          ) : (
            <p className="text-sm text-gray-500">No public photos available</p>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">
            Private Album
          </h3>
          {user.metadata?.private_album_details ? (
            renderAlbum(user.metadata.private_album_details)
          ) : (
            <p className="text-sm text-gray-500">No private photos available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
