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
  metadata: object;
  phone: string;
  relationship_speed: number;
  smoke: number;
  tattoo: number;
  updated_at: string;
  username: string;
}
