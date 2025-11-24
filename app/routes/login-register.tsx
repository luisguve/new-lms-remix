import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/login-register";
import { useUser } from "~/contexts/user-context";
import LoginForm from "~/components/forms/login-form";
import RegisterForm from "~/components/forms/register-form";
import { Loader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login Register - New React Router App" },
    { name: "description", content: "Login or register to access your account" },
  ];
}

export default function LoginRegister({}: Route.ComponentProps) {
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/profile");
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) {
    return (
      <div className="fixed bg-background/50 top-0 z-50 w-screen h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-15 md:pb-20 lg:pb-[100px] pt-8">
      <div className="grid items-start lg:grid-cols-2 gap-7.5 lg:gap-15">
        <LoginForm />
        <RegisterForm />
      </div>
    </div>
  );
}

