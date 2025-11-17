import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import type { ICourse } from "~/utils/types";
import OverviewPanel from "./course-details/OverviewPanel";
import CurriculumPanel from "./course-details/CurriculumPanel";
import InstructorPanel from "./course-details/InstructorPanel";
import CourseInfo from "./course-details/CourseInfo";

export interface CoursePageProps extends ICourse {}

export default function CoursePage(props: CoursePageProps) {
  const {
    description,
    long_description,
    modules,
    slug,
    price,
    duration,
    total_lectures,
    total_students,
    language,
    publishedAt,
    instructor,
  } = props;

  return (
    <section className="py-32">
      <div className="container mx-auto grid lg:grid-cols-3 gap-12 px-4">
        <div className="lg:col-[1/3]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-10 lg:mt-[50px]">
              {description && (
                <OverviewPanel
                  description={description}
                  long_description={long_description}
                />
              )}
            </TabsContent>
            <TabsContent value="curriculum" className="mt-10 lg:mt-[50px]">
              {modules && modules.length > 0 && (
                <CurriculumPanel modules={modules} courseSlug={slug} />
              )}
            </TabsContent>
            <TabsContent value="instructor" className="mt-10 lg:mt-[50px]">
              <InstructorPanel {...instructor} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-[3/-1]">
          <div className="sticky top-24">
            <CourseInfo
              slug={slug}
              documentId={props.documentId}
              price={price}
              instructor={instructor.name}
              duration={duration}
              lectures={total_lectures}
              students={total_students}
              language={language}
              publishedAt={publishedAt}
              showButton
            />
          </div>
        </div>
      </div>
    </section>
  );
}
