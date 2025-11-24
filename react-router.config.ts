import type { Config } from "@react-router/dev/config";

interface CourseSlugsResponse {
  courses: Array<{
    id: number;
    documentId: string;
    slug: string;
    modules: Array<{
      id: number;
      documentId: string;
      slug: string;
      lectures: Array<{
        id: number;
        documentId: string;
        slug: string;
      }>;
    }>;
  }>;
}

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  prerender: async ({ getStaticPaths }) => {
    const staticPaths = getStaticPaths();
    const dynamicPaths: string[] = [];

    try {
      const strapiUrl = process.env.VITE_STRAPI_URL;
      if (!strapiUrl) {
        console.warn(
          "VITE_STRAPI_URL is not set, skipping dynamic route generation"
        );
        return staticPaths;
      }

      const response = await fetch(`${strapiUrl}/api/maestro/courses-slugs`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch courses slugs: ${response.statusText}`
        );
      }

      const data: CourseSlugsResponse = await response.json();

      // Generate paths for each course
      for (const course of data.courses) {
        // Add course page: /courses/:slug
        dynamicPaths.push(`/courses/${course.slug}`);

        // Add lecture pages: /courses/:slug/:lecture
        for (const module of course.modules) {
          for (const lecture of module.lectures) {
            dynamicPaths.push(`/courses/${course.slug}/${lecture.slug}`);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching courses slugs:", error);
      // Return static paths even if dynamic fetch fails
    }

    return [...staticPaths, ...dynamicPaths];
  },
} satisfies Config;
