import type { BlocksContent } from "@strapi/blocks-react-renderer";
import type { CoursesListingInlineProps } from "~/components";
import type { HeroAreaProps } from "~/components/HeroArea";

export interface Image {
  id?: string;
  documentId?: string;
  url: string;
  alternativeText: string;
}

export interface Category {
  id: number;
  documentId: string;
  slug: string;
  title: string;
}

export interface Instructor {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio: BlocksContent;
  designation: string;
  image: Image;
}

export interface Lecture {
  id: number;
  documentId: string;
  title: string;
  duration: number;
  slug: string;
  description: BlocksContent;
}

export interface Module {
  id: number;
  documentId: string;
  title: string;
  duration: number;
  description: BlocksContent;
  slug: string;
  lectures: Lecture[];
}

export interface ICourse {
  id: number;
  documentId: string;
  title: string;
  duration: number;
  description: BlocksContent;
  price: number;
  long_description: BlocksContent;
  difficulty: string;
  language: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  highlighted: boolean;
  thumbnail: Image;
  modules: Module[];
  seo: unknown | null;
  category: Category;
  instructor: Instructor;
  students: unknown[];
  total_students: number;
  total_lectures: number;
}

export interface LinkItem {
  id: number;
  title: string;
  url: string;
  is_external: boolean;
}

export interface LinksSection {
  id: number;
  title: string;
  links: LinkItem[];
}

export interface Header {
  logo: Image;
  links: LinkItem[];
}

export interface Footer {
  logo: Image;
  sections: LinksSection[];
}

export interface Layout {
  header: Header;
  footer: Footer;
}

export type ComponentType = "block.hero" | "block.courses-listing-inline";

interface Base<T extends ComponentType> {
  __component: T;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroArea extends Base<"block.hero">, HeroAreaProps {}
export interface CoursesListingInline
  extends Base<"block.courses-listing-inline">,
    CoursesListingInlineProps {}

export type Component = HeroArea | CoursesListingInline;

export interface DynamicData {
  data: {
    blocks: Component[];
  };
}

// Alias for Lecture to match user-context expectations
export type ILecture = Lecture;

// Course Student interface for tracking user course progress
export interface ICourseStudent {
  course: ICourse;
  current_lecture: ILecture | null;
  lectures_completed: ILecture[];
}
