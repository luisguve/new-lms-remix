import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { Link } from "react-router";
import type { ICourse, ILecture, Module } from "~/utils/types";
import { STRAPI } from "~/lib/strapi";
import axios from "axios";
import { getStrapiError } from "~/utils/axiosErrors";
import { useUser } from "~/contexts/user-context";
import { cn } from "~/lib/utils";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

type CourseSidebarProps = {
  course: ICourse;
  courseSlug: string;
  currentLectureSlug: string;
};

export type CourseSidebarRef = {
  refreshProgress: () => void;
};

const CourseSidebar = forwardRef<CourseSidebarRef, CourseSidebarProps>(
  ({ course, courseSlug, currentLectureSlug }, ref) => {
    const { token, isLoggedIn } = useUser();
    const [completedLectures, setCompletedLectures] = useState<Set<string>>(
      new Set()
    );
    const [loading, setLoading] = useState(true);

    const fetchCompletedLectures = useCallback(async () => {
      if (!STRAPI || !isLoggedIn || !token) {
        setLoading(false);
        return;
      }

      try {
        type ClassesResponse = {
          classesCompleted: {
            slug: string;
          }[];
        };
        const response = await axios.get<ClassesResponse>(
          `${STRAPI}/api/maestro/courses/${course.documentId}/classes-completed`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          response.data &&
          Array.isArray(response.data.classesCompleted)
        ) {
          const slugs = new Set(
            response.data.classesCompleted.map((item) => item.slug)
          );
          setCompletedLectures(slugs);
        }
      } catch (error) {
        const errorMsg = getStrapiError(error);
        console.error("Error fetching completed lectures:", errorMsg);
      } finally {
        setLoading(false);
      }
    }, [course.documentId, token, isLoggedIn]);

    // Expose refresh function via ref
    useImperativeHandle(ref, () => ({
      refreshProgress: () => {
        void fetchCompletedLectures();
      },
    }));

    // Fetch completed lectures
    useEffect(() => {
      void fetchCompletedLectures();
    }, [fetchCompletedLectures]);

  // Calculate progress
  const totalLectures = course.modules.reduce(
    (total, module) => total + module.lectures.length,
    0
  );
  const completedCount = course.modules.reduce((count, module) => {
    return (
      count +
      module.lectures.filter((lecture) =>
        completedLectures.has(lecture.slug)
      ).length
    );
  }, 0);
  const progressPercentage =
    totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      <div className="sticky top-4 space-y-4">
        {/* Progress Card */}
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {completedCount} of {totalLectures} lectures completed
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Course Content</h3>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {course.modules.map((module, moduleIndex) => (
              <ModuleSection
                key={module.documentId || module.id}
                module={module}
                moduleIndex={moduleIndex}
                courseSlug={courseSlug}
                currentLectureSlug={currentLectureSlug}
                completedLectures={completedLectures}
                loading={loading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  }
);

CourseSidebar.displayName = "CourseSidebar";

export default CourseSidebar;

type ModuleSectionProps = {
  module: Module;
  moduleIndex: number;
  courseSlug: string;
  currentLectureSlug: string;
  completedLectures: Set<string>;
  loading: boolean;
};

function ModuleSection({
  module,
  moduleIndex,
  courseSlug,
  currentLectureSlug,
  completedLectures,
  loading,
}: ModuleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(moduleIndex === 0);

  const moduleCompletedCount = module.lectures.filter((lecture) =>
    completedLectures.has(lecture.slug)
  ).length;
  const moduleProgress =
    module.lectures.length > 0
      ? Math.round((moduleCompletedCount / module.lectures.length) * 100)
      : 0;

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <span className="text-sm font-medium">{module.title}</span>
          <span className="text-xs text-muted-foreground">
            ({module.lectures.length} lectures)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {module.lectures.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {moduleProgress}%
            </span>
          )}
          <svg
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>
      {isExpanded && (
        <div className="bg-accent/30">
          {module.lectures.map((lecture, lectureIndex) => (
            <LectureItem
              key={lecture.documentId || lecture.id}
              lecture={lecture}
              lectureIndex={lectureIndex}
              courseSlug={courseSlug}
              currentLectureSlug={currentLectureSlug}
              isCompleted={completedLectures.has(lecture.slug)}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type LectureItemProps = {
  lecture: ILecture;
  lectureIndex: number;
  courseSlug: string;
  currentLectureSlug: string;
  isCompleted: boolean;
  loading: boolean;
};

function LectureItem({
  lecture,
  courseSlug,
  currentLectureSlug,
  isCompleted,
  loading,
}: LectureItemProps) {
  const isActive = lecture.slug === currentLectureSlug;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}`;
    }
    return `${minutes}:00`;
  };

  return (
    <Link
      to={`/courses/${courseSlug}/${lecture.slug}`}
      className={cn(
        "block px-4 py-2.5 hover:bg-accent transition-colors",
        isActive && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {loading ? (
            <Circle className="w-4 h-4 text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <PlayCircle className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-medium line-clamp-2",
              isActive && "text-primary",
              !isActive && "text-foreground"
            )}
          >
            {lecture.title}
          </div>
          {lecture.duration > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {formatDuration(lecture.duration)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

