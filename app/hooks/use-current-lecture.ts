import { useState, useEffect } from "react";
import { useUser } from "~/contexts/user-context";
import axios from "axios";
import type { ILecture } from "~/utils/types";
import { getStrapiError } from "~/utils/axiosErrors";
import { STRAPI } from "~/lib/strapi";

export default function useCurrentLecture(documentId?: string) {
  const [currentLecture, setCurrentLecture] = useState<ILecture | null>(null);
  const [serverState, setServerState] = useState<string>("");
  const { courses, token } = useUser();
  
  // Check if user has access to the course
  // ICourseStudent.course.documentId is the unique id for the course
  const hasAccess = !!courses.find(
    (cs) => cs.course.documentId === documentId
  );

  useEffect(() => {
    const getCurrentLecture = async () => {
      if (!STRAPI || !documentId || !hasAccess) {
        return;
      }
      type CurrentLectureResponse = {
        currentLecture: ILecture;
      };
      try {
        const response = await axios.get<CurrentLectureResponse>(
          `${STRAPI}/api/maestro/courses/${documentId}/get-current-lecture`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCurrentLecture(response.data.currentLecture);
      } catch (error) {
        let errorMsg = "An error occurred";
        const strapiErrorMsg = getStrapiError(error);
        if (strapiErrorMsg) {
          errorMsg = strapiErrorMsg;
        }
        setServerState(errorMsg);
      }
    };
    if (hasAccess) {
      void getCurrentLecture();
    }
  }, [hasAccess, token, documentId]);

  return { currentLecture, serverState, hasAccess };
}

