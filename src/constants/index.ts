export const API_BASE_URL = "https://api-stage.flingzy.com";
export const ADMIN_API_BASE_URL = "https://admin-stage.flingzy.com";

export const taskStatusMap = {
  unresolved: 0,
  resolved: 1,
  deferred: 2,
};

type TaskStatusMap = {
  [key: number]: string;
};

export const taskStatusReverseMap: TaskStatusMap = {
  0: "Unresolved",
  1: "Resolved",
  2: "Deferred",
};

export const taskTypeMap = {
  profile_report: 1,
  chat_report: 2,
  verification: 3,
};

type TaskTypeMap = {
  [key: number]: string;
};

export const taskTypeReverseMap: TaskTypeMap = {
  1: "Profile Report",
  2: "Chat Report",
  3: "User Verification",
};
