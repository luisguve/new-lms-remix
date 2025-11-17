import { Link, useNavigate } from "react-router";
import type { Header, Image, LinkItem } from "@utils/types";
import { StrapiImage } from "./StrapiImage";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";

interface Props {
  logo: Image;
  links: LinkItem[];
}

export default function Header({ logo, links }: Props) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          {logo && (
            <Link to="/" className="flex items-center">
              <StrapiImage
                {...logo}
                className="w-auto"
                width={200}
                height={100}
              />
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {links?.map((link) => (
              <NavigationMenuItem key={link.id}>
                <NavigationMenuLink
                  href={link.url}
                  target={link.is_external ? "_blank" : undefined}
                  rel={link.is_external ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!link.is_external) {
                      e.preventDefault();
                      navigate(link.url);
                    }
                  }}
                >
                  {link.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
