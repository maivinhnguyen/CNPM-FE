export const ENDPOINTS = {
  MEMBERS: {
    LIST: "/members",
    CREATE: "/members",
    BY_ID: (id: string) => `/members/${id}`,
    BY_STUDENT_ID: (studentId: string) => `/members/student/${studentId}`,
    UPDATE: (id: string) => `/members/${id}`,
    DELETE: (id: string) => `/members/${id}`,
  },
  CARDS: {
    CREATE: "/cards",
    BY_UID: (cardUid: string) => `/cards/${cardUid}`,
    BY_MEMBER: (memberId: string) => `/cards/member/${memberId}`,
    UPDATE: (cardUid: string) => `/cards/${cardUid}`,
    TOGGLE: (cardUid: string) => `/cards/${cardUid}/toggle`,
    DELETE: (cardUid: string) => `/cards/${cardUid}`,
  },
  SESSIONS: {
    CHECK_IN: "/sessions/checkin",
    CHECK_OUT: (id: number) => `/sessions/${id}/checkout`,
  },
} as const;
