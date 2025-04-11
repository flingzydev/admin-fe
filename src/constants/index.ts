export const API_BASE_URL = "https://api-stage.flingzy.com";
export const ADMIN_API_BASE_URL = "https://admin-api-stage.flingzy.com";

// task
export const TaskStatusMap = {
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

// user
export const GenderMap: { [key: number]: string } = {
  1: "Man",
  2: "Woman",
  3: "Other",
};

export const BodyTypeMap: { [key: number]: string } = {
  1: "Slim",
  2: "Fit",
  3: "Muscular",
  4: "Athletic",
  5: "Average",
  6: "Curvy",
  7: "Heavy",
};

export const DrinkMap: { [key: number]: string } = {
  1: "Yes",
  2: "Sometimes",
  3: "No",
  4: "Prefer not to say",
};

export const SmokeMap: { [key: number]: string } = {
  1: "Yes",
  2: "Sometimes",
  3: "No",
  4: "Prefer not to say",
};

export const TattooMap: { [key: number]: string } = {
  1: "Many",
  2: "A Few",
  3: "None",
  4: "Prefer not to say",
};

export const EthnicityMap: { [key: number]: string } = {
  1: "American Indian",
  2: "Black/African Descent",
  3: "East Asian",
  4: "Hispanic/Latino",
  5: "Middle Eastern",
  6: "Pacific Islander",
  7: "South Asian",
  8: "White/Caucasian",
  9: "Other",
};

export const MBTIMap: { [key: number]: string } = {
  1: "ENFJ",
  2: "ENFP",
  3: "ENTJ",
  4: "ENTP",
  5: "ESFJ",
  6: "ESFP",
  7: "ESTJ",
  8: "ESTP",
  9: "INFJ",
  10: "INFP",
  11: "INTJ",
  12: "INTP",
  13: "ISFJ",
  14: "ISFP",
  15: "ISTJ",
  16: "ISTP",
};

export const RelationshipSpeedArray = [
  {
    title: "Gradual and Consistent",
    value: 1,
    description: "Taking time to build a meaningful connection step by step",
  },
  {
    title: "Gentle Spark",
    value: 2,
    description: "Moving forward naturally as chemistry develops",
  },
  {
    title: "Harmonious Delight",
    value: 3,
    description: "Enjoying each moment while letting the relationship unfold",
  },
  {
    title: "Engage Without Hesitation",
    value: 4,
    description: "Ready to dive in when the connection feels right",
  },
];

export const InterestsMap: { [key: number]: string } = {
  1: "Travel",
  2: "Hiking",
  3: "Yoga",
  4: "Photography",
  5: "Cooking",
  6: "Sports",
  7: "Movies",
  8: "Music",
  9: "Animals",
  10: "Gardening",
  11: "Reading",
  12: "Gaming",
  13: "Dancing",
  14: "Volunteering",
  15: "Fashion",
  16: "Meditation",
  17: "Beach",
  18: "Surfing",
  19: "Swimming",
  20: "Wine Tasting",
  21: "Painting",
  22: "Cycling",
  23: "Camping",
  24: "Astrology",
  25: "Car",
  26: "Magic",
  27: "Baking",
  28: "Comedy",
  29: "Podcasts",
  30: "Astronomy",
  31: "Pottery",
  32: "Sculpture",
  33: "Chess",
  34: "Coding",
  35: "Writing",
  36: "Investing",
  37: "Calligraphy",
  38: "Collecting",
  39: "Flowers",
  40: "Designing",
  41: "Blogging",
  42: "Languages",
  43: "Fitness",
};
