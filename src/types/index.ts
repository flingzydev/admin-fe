export interface TaskCount {
  queue_type: number;
  count: number;
}

export interface TaskCountsResponse {
  task_counts: TaskCount[];
}

export interface Task {
  created_at: string;
  dst_user_id: string;
  id: string;
  metadata: object;
  queue_type: number;
  src_user_id: string;
  status: number;
  updated_at: string;
}

interface UserMetadata {
  global_logout_ts?: number; // Timestamp in nanoseconds for global logout
  first_name?: string; // User's first name
  last_name?: string; // User's last name
  bio?: string; // User's biography
  about?: string; // User's "About Me" section
  interests?: string; // User's interests
  preferences?: string; // User preferences
  public_album?: string; // Comma-separated list of blob IDs for the public album
  public_album_details?: string; // JSON string with details of the public album
  private_album?: string; // Comma-separated list of blob IDs for the private album
  private_album_details?: string; // JSON string with details of the private album
  verification_album?: string; // Blob ID for the verification album
  verification_album_detail?: string; // JSON string with details of the verification album
  verification_album_original?: string; // S3 key for the original verification video
  verification_album_review_in_progress?: number; // 1 if review is in progress, 0 otherwise
  age?: number; // User's age (calculated on the fly)
  is_favorite?: number; // 1 if the user is marked as a favorite
}


export interface User {
  birthday: string;
  body_type: number;
  created_at: string;
  deleted: boolean;
  drink: number;
  email: string;
  ethnicity: number;
  gender: number;
  height: number;
  id: string;
  is_hidden: boolean;
  is_onboarded: boolean;
  is_online: boolean;
  is_verified: boolean;
  last_online: string;
  mbti: number;
  metadata: UserMetadata;
  phone: string;
  relationship_speed: number;
  smoke: number;
  tattoo: number;
  updated_at: string;
  username: string;
}
