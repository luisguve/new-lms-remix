import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { STRAPI } from "~/lib/strapi";
import axios from "axios";
import { useUser } from "~/contexts/user-context";
import { getStrapiError } from "~/utils/axiosErrors";
import { Loader2 } from "lucide-react";

interface AuthResponse {
  jwt: string;
  user: {
    username: string;
    email: string;
  };
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverState, setServerState] = useState(() => {
    if (!STRAPI) {
      return "Server address is unset";
    }
    return "";
  });
  const { setLogin } = useUser();
  const [formData, setFormData] = useState({
    reg_email: "",
    reg_username: "",
    reg_password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reg_email) {
      newErrors.reg_email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.reg_email)) {
      newErrors.reg_email = "Invalid email address";
    }

    if (!formData.reg_username) {
      newErrors.reg_username = "Full name is required";
    }

    if (!formData.reg_password) {
      newErrors.reg_password = "Password is required";
    } else if (formData.reg_password.length < 6) {
      newErrors.reg_password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.reg_password !== formData.confirmPassword) {
      newErrors.confirmPassword = "The passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm() || !STRAPI) {
      return;
    }

    try {
      setIsLoading(true);
      setServerState("");
      
      const response = await axios.post<AuthResponse>(
        `${STRAPI}/api/auth/local/register`,
        {
          password: formData.reg_password,
          email: formData.reg_email,
          username: formData.reg_username,
        }
      );

      const responseData = response.data;
      const { jwt, user } = responseData;
      setLogin({
        username: user.username,
        email: user.email,
        token: jwt,
      });
      
      // Navigate to profile after successful registration
      navigate("/profile");
    } catch (error) {
      let errorMsg = "An error occurred";
      const strapiErrorMsg = getStrapiError(error);
      if (strapiErrorMsg) {
        errorMsg = strapiErrorMsg;
      }
      setServerState(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-[470px]">
      <CardHeader>
        <h3 className="text-2xl font-semibold">Register</h3>
      </CardHeader>
      <CardContent>
        {serverState && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {serverState}
          </div>
        )}
        <form onSubmit={onSubmit} noValidate>
          <div className="mb-6">
            <label htmlFor="reg_username" className="block text-sm font-medium mb-2">
              Full name *
            </label>
            <input
              id="reg_username"
              type="text"
              value={formData.reg_username}
              onChange={(e) =>
                setFormData({ ...formData, reg_username: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Full name"
            />
            {errors.reg_username && (
              <p className="mt-1 text-sm text-destructive">
                {errors.reg_username}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="reg_email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              id="reg_email"
              type="email"
              value={formData.reg_email}
              onChange={(e) =>
                setFormData({ ...formData, reg_email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="email"
              autoComplete="email"
            />
            {errors.reg_email && (
              <p className="mt-1 text-sm text-destructive">{errors.reg_email}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="reg_password" className="block text-sm font-medium mb-2">
              Password *
            </label>
            <input
              id="reg_password"
              type="password"
              value={formData.reg_password}
              onChange={(e) =>
                setFormData({ ...formData, reg_password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Password"
              autoComplete="new-password"
            />
            {errors.reg_password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.reg_password}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

