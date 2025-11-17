import { Link } from "react-router";
import type { Image, LinkItem, LinksSection } from "~/utils/types";
import { StrapiImage } from "./StrapiImage";

interface FooterProps {
  logo?: Image;
  tagline?: string;
  sections?: LinksSection[];
  copyright?: string;
  bottomLinks?: LinkItem[];
}

const Footer = ({
  logo,
  tagline = "Components made easy.",
  sections = [
    {
      id: 1,
      title: "Product",
      links: [
        { title: "Overview", url: "#", id: 1, is_external: false },
        { title: "Pricing", url: "#", id: 2, is_external: false },
        { title: "Marketplace", url: "#", id: 3, is_external: false },
        { title: "Features", url: "#", id: 4, is_external: false },
        { title: "Integrations", url: "#", id: 5, is_external: false },
        { title: "Pricing", url: "#", id: 6, is_external: false },
      ],
    },
    {
      id: 2,
      title: "Company",
      links: [
        { title: "About", url: "#", id: 7, is_external: false },
        { title: "Team", url: "#", id: 8, is_external: false },
        { title: "Blog", url: "#", id: 9, is_external: false },
        { title: "Careers", url: "#", id: 10, is_external: false },
        { title: "Contact", url: "#", id: 11, is_external: false },
        { title: "Privacy", url: "#", id: 12, is_external: false },
      ],
    },
    {
      id:3,
      title: "Resources",
      links: [
        { title: "Help", url: "#", id: 13, is_external: false },
        { title: "Sales", url: "#", id: 14, is_external: false },
        { title: "Advertise", url: "#", id: 15, is_external: false },
      ],
    },
    {
      id: 4,
      title: "Social",
      links: [
        { title: "Twitter", url: "#", id: 16, is_external: false },
        { title: "Instagram", url: "#", id: 17, is_external: false },
        { title: "LinkedIn", url: "#", id: 18, is_external: false },
      ],
    },
  ],
  copyright = "© 2025 ManyLMS. All rights reserved.",
  bottomLinks = [
    { title: "Terms and Conditions", url: "#", id: 19, is_external: true },
    { title: "Privacy Policy", url: "#", id: 20, is_external: true },
  ],
}: FooterProps) => {
  return (
    <footer className="py-32">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          <div className="col-span-2 mb-8 lg:mb-0">
            <div className="flex items-center gap-2 lg:justify-start">
            {logo && 
              <Link to="/" className="flex items-center">
                <StrapiImage
                  {...logo}
                  width={200}
                  height={100}
                />
              </Link>
            }
            </div>
            <p className="mt-4 font-bold">{tagline}</p>
          </div>
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="mb-4 font-bold">{section.title}</h3>
              <ul className="text-muted-foreground space-y-4">
                {section.links.map((link, linkIdx) => (
                  <li
                    key={linkIdx}
                    className="hover:text-primary font-medium"
                  >
                    <Link
                      to={link.url}
                      target={link.is_external ? "_blank" : undefined}
                      rel={link.is_external ? "noopener noreferrer" : undefined}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-24 flex flex-col justify-between gap-4 border-t pt-8 text-sm font-medium md:flex-row md:items-center">
          <p>{copyright}</p>
          <ul className="flex gap-4">
            {bottomLinks.map((link, linkIdx) => (
              <li key={linkIdx} className="hover:text-primary underline">
                <Link
                  to={link.url}
                  target={link.is_external ? "_blank" : undefined}
                  rel={link.is_external ? "noopener noreferrer" : undefined}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
