import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/profile";
import { useUser } from "~/contexts/user-context";
import { Course } from "~/components/cards/Course";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - New React Router App" },
    { name: "description", content: "User profile page" },
  ];
}

export default function Profile({}: Route.ComponentProps) {
  const { isLoggedIn, username, email, courses, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Profile</h1>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold">Username:</span> {username}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {email}
          </p>
        </div>
        <div className="mt-6">
          <Button
            variant="destructive"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-semibold mb-6">
          Courses you have access to
        </h2>
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map(({ course }) => (
              <Course key={course.slug} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-lg">
            No courses available. Start exploring our courses!
          </p>
        )}
      </div>
    </div>
  );
}

