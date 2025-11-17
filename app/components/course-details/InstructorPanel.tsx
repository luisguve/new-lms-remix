import type { BlocksContent } from "@strapi/blocks-react-renderer";
import BlockRendererClient from "../BlockRenderer";
import { StrapiImage } from "../StrapiImage";
import type { Image } from "~/utils/types";

interface Social {
  label: string;
  icon: string;
  url: string;
}

interface Instructor {
  name: string;
  image?: Image | { url: string; alternativeText?: string | null } | null;
  designation: string;
  bio?: BlocksContent;
  socials?: Social[];
}

type InstructorPanelProps = Instructor;

export default function InstructorPanel({
  name,
  image,
  designation,
  bio,
  socials,
}: InstructorPanelProps) {
  return (
    <div className="instructor grid gap-7.5 md:grid-cols-3 lg:gap-[50px]">
      {image && typeof image === "object" && "url" in image && image.url && (
        <figure className="md:col-[1/1]">
          <StrapiImage
            {...image}
            alternativeText={name}
            width={238}
            height={238}
            className="rounded-lg"
          />
        </figure>
      )}
      <div className="md:col-[2/-1]">
        <h3 className="flex justify-between items-center mb-3">
          <span>{name}</span>
          <span className="font-normal text-muted-foreground leading-relaxed mb-0 text-base">
            /{designation}
          </span>
        </h3>
        {bio && <BlockRendererClient content={bio} />}

        {socials && socials.length > 0 && (
          <div className="mt-7.5 flex gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-border w-10 h-10 hover:bg-accent transition-colors"
                aria-label={social.label}
              >
                <i className={social.icon} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

