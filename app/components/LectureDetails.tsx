import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useUser } from "~/contexts/user-context";
import type { ILecture, ICourse } from "~/utils/types";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { STRAPI } from "~/lib/strapi";
import BlockRendererClient from "~/components/BlockRenderer";
import axios from "axios";
import { getStrapiError } from "~/utils/axiosErrors";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import CourseSidebar, { type CourseSidebarRef } from "~/components/CourseSidebar";

type LectureDetailsProps = {
  data: {
    lecture: ILecture;
    prevNextLesson: {
      prev: ILecture | null;
      next: ILecture | null;
    };
    courseSlug: string;
    courseId: string;
    coursePath: string;
    course: ICourse;
  };
};

export default function LectureDetails({ data }: LectureDetailsProps) {
  const {
    lecture,
    prevNextLesson: { prev, next },
    courseSlug,
    courseId,
    coursePath,
  } = data;

  const { courses, isLoggedIn, email, token } = useUser();
  const hasAccess = !!courses.find((cs) => cs.course.slug === courseSlug);
  const [render, setRender] = useState(false);
  const [playAuth, setPlayAuth] = useState("");
  const [videoId, setVideoId] = useState("");
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const sidebarRef = useRef<CourseSidebarRef>(null);
  const [hasFired, setHasFired] = useState(false);
  const navigate = useNavigate();
  const [serverState, setServerState] = useState(() => {
    if (!STRAPI) {
      return "Server address is unset";
    }
    return "";
  });

  // Check access and redirect if needed
  useEffect(() => {
    if (!render) {
      if (!hasAccess && !isLoggedIn) {
        navigate("/login-register");
        return;
      } else if (!hasAccess) {
        navigate(coursePath);
        return;
      }
      setRender(true);
    }
  }, [render, navigate, isLoggedIn, hasAccess, coursePath]);

  // Get play auth for video
  useEffect(() => {
    setHasFired(false);
    const getPlayAuth = async () => {
      if (!STRAPI || !hasAccess) {
        return;
      }
      try {
        setServerState("");
        type PlayAuthResponse = {
          PlayAuth: string;
          VideoId: string;
        };
        const response = await axios.get<PlayAuthResponse>(
          `${STRAPI}/api/maestro/courses/${courseId}/get-play-auth-lecture`,
          {
            params: {
              lecture: lecture.slug,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const { PlayAuth, VideoId } = response.data;
        setPlayAuth(PlayAuth || "");
        setVideoId(VideoId || "");
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
      void getPlayAuth();
    }
  }, [hasAccess, lecture, courseId, token]);

  const checkLecture = async () => {
    if (!STRAPI) {
      return;
    }
    try {
      await axios.put(
        `${STRAPI}/api/maestro/courses/${courseId}/check-lecture`,
        {
          lecture_id: lecture.documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh sidebar progress after marking lecture as completed
      sidebarRef.current?.refreshProgress();
    } catch (error) {
      let errorMsg = "An error checkLecture";
      const strapiErrorMsg = getStrapiError(error);
      if (strapiErrorMsg) {
        errorMsg = strapiErrorMsg;
      }
      setServerState(errorMsg);
    }
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (player) {
      const { currentTime } = player;
      const { duration } = player;
      if (!hasFired && duration && currentTime / duration >= 0.9) {
        setHasFired(true);
        void checkLecture();
      }
    }
  };

  if (!render) {
    return (
      <div className="fixed w-screen h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 lg:py-[50px] py-[10px] max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h2 className="mb-[18px] text-2xl md:text-3xl">
            {lecture.title}
          </h2>
          {serverState && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-4">
              {serverState}
            </div>
          )}
          {render && playAuth && (
            <div className="mb-6">
              <MuxPlayer
                className="w-full rounded-lg"
                ref={playerRef}
                src={playAuth}
                metadata={{
                  video_id: videoId,
                  video_title: lecture.title,
                  viewer_user_id: email,
                }}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          )}
          {lecture.description && (
            <div className="mb-8">
              <BlockRendererClient content={lecture.description} />
            </div>
          )}
          {/* Prev/Next Lecture Navigation */}
          <div className="flex justify-between mt-8 gap-4">
            <Button
              variant="outline"
              disabled={!prev}
              className={!prev ? "opacity-50" : ""}
              asChild
            >
              {prev ? (
                <Link to={`/courses/${courseSlug}/${prev.slug}`}>
                  Prev Lecture
                </Link>
              ) : (
                <span>Prev Lecture</span>
              )}
            </Button>
            <Button
              disabled={!next}
              className={!next ? "opacity-50" : ""}
              asChild
            >
              {next ? (
                <Link to={`/courses/${courseSlug}/${next.slug}`}>
                  Next Lecture
                </Link>
              ) : (
                <span>Next Lecture</span>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <CourseSidebar
            ref={sidebarRef}
            course={data.course}
            courseSlug={courseSlug}
            currentLectureSlug={lecture.slug}
          />
        </div>
      </div>
    </div>
  );
}

