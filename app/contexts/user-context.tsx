/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { ICourseStudent, ICourse } from "~/utils/types";
import { STRAPI } from "~/lib/strapi";
import axios from "axios";
import { getStrapiError } from "~/utils/axiosErrors";

const COURSESTORE_KEY = "maxCourse";
const AUTH_KEY = "maxAuth";

// User Context

export interface ILoginData {
  username: string;
  email: string;
  token: string;
}

//  Context Type
export type UserContextType = {
  isLoggedIn: boolean | null;
  username: string;
  email: string;
  token: string;
  courses: ICourseStudent[];
  presetEmail: string;
  setEmail: (email: string) => void;
  setLogin: (loginData: ILoginData) => void;
  logout: () => void;
  enrollCourses: (data: ICourse[]) => void;
  lessonComplete: (data: {
    course: string;
    lessonLink: string;
    lesson: string;
  }) => void;
};

export const UserContext = createContext({} as UserContextType);

// User Reducer

const initialState = {
  isLoggedIn: false,
  username: "",
  email: "",
  presetEmail: "",
  token: "",
  courses: [] as ICourseStudent[],
};

const init = () => {
  if (typeof window === "undefined") return initialState;
  const loginStore = localStorage.getItem(AUTH_KEY);
  const courseStore = localStorage.getItem(COURSESTORE_KEY);

  const coursesParse =
    courseStore !== null
      ? (JSON.parse(courseStore) as ICourseStudent[])
      : ([] as ICourseStudent[]);

  const loginParse = loginStore !== null ? JSON.parse(loginStore) : null;

  let result = {
    ...initialState,
    isLoggedIn: loginStore !== null,
    courses: coursesParse,
  };
  if (loginParse) {
    result = {
      ...result,
      ...loginParse,
    };
  }

  return result;
};

interface UserAction {
  type:
    | "LOGIN"
    | "LOGOUT"
    | "PRESET_EMAIL"
    | "ENROLL_COURSES"
    | "LESSON_COMPLETE"
    | "SET_COURSES";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

function reducer(
  state: typeof initialState,
  action: UserAction
): typeof initialState {
  switch (action.type) {
    case "LOGIN": {
      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
          username: action.payload.username,
          email: action.payload.email,
          token: action.payload.token,
        })
      );
      return {
        ...state,
        isLoggedIn: true,
        username: action.payload.username,
        email: action.payload.email,
        token: action.payload.token,
      };
    }
    case "PRESET_EMAIL": {
      return {
        ...state,
        presetEmail: action.payload,
      };
    }
    case "SET_COURSES": {
      localStorage.setItem(COURSESTORE_KEY, JSON.stringify(action.payload));
      return {
        ...state,
        courses: action.payload,
      };
    }
    case "LOGOUT": {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(COURSESTORE_KEY);
      return {
        ...initialState,
      };
    }
    case "ENROLL_COURSES": {
      const payload = action.payload as ICourse[];
      const newCourses = payload.reduce((result, course) => {
        return result.concat({
          course,
          current_lecture: null,
          lectures_completed: [],
        });
      }, [] as ICourseStudent[]);
      const courses = state.courses.concat(newCourses);
      localStorage.setItem(COURSESTORE_KEY, JSON.stringify(courses));
      return {
        ...state,
        courses,
      };
    }
    default:
      return state;
  }
}

// User Context Provider

type TProps = {
  children: React.ReactNode;
};

export const UserProvider = ({ children }: TProps) => {
  const [state, dispatch] = useReducer(reducer, initialState, init);

  const fetchUserCourses = async (token: string) => {
    if (!STRAPI) {
      return;
    }
    try {
      type CoursesResponse = {
        courses: ICourse[];
      };
      const response = await axios.get<CoursesResponse>(
        `${STRAPI}/api/maestro/my-learning`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.courses) {
        dispatch({
          type: "SET_COURSES",
          payload: response.data.courses,
        });
      }
    } catch (error) {
      let errorMsg = "fetchUserCourses error";
      const strapiErrorMsg = getStrapiError(error);
      if (strapiErrorMsg) {
        errorMsg = strapiErrorMsg;
      }
      console.log(errorMsg);
    }
  };

  const enrollCourses = useCallback(
    (data: ICourse[]) => {
      dispatch({
        type: "ENROLL_COURSES",
        payload: data,
      });
    },
    [dispatch]
  );

  const value = useMemo(
    () => ({
      ...state,
      setLogin: (data: ILoginData) => {
        dispatch({
          type: "LOGIN",
          payload: data,
        });
        // Fetch user courses after login
        void fetchUserCourses(data.token);
      },
      refreshCourses: () => {
        if (state.token) {
          void fetchUserCourses(state.token);
        }
      },
      logout: () => {
        dispatch({
          type: "LOGOUT",
        });
      },
      enrollCourses,
      lessonComplete: (data: {
        course: string;
        lessonLink: string;
        lesson: string;
      }) => {
        dispatch({
          type: "LESSON_COMPLETE",
          payload: data,
        });
      },
      setEmail: (data: string) => {
        dispatch({
          type: "PRESET_EMAIL",
          payload: data,
        });
      },
    }),
    [state, enrollCourses]
  );

  // Initial fetch when token exists (e.g., page refresh)
  useEffect(() => {
    if (state.token) {
      void fetchUserCourses(state.token);
    }
  }, [state.token]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// User Context Consumer hooks

export const useUser = () => useContext(UserContext);
