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

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverState, setServerState] = useState(() => {
    if (!STRAPI) {
      return "Server address is unset";
    }
    return "";
  });
  const { setLogin, presetEmail } = useUser();
  const [formData, setFormData] = useState({
    email: presetEmail || "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
        `${STRAPI}/api/auth/local`,
        {
          password: formData.password,
          identifier: formData.email,
        }
      );

      const responseData = response.data;
      const { jwt, user } = responseData;
      setLogin({
        username: user.username,
        email: user.email,
        token: jwt,
      });
      
      // Navigate to profile after successful login
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
        <h3 className="text-2xl font-semibold">Login</h3>
      </CardHeader>
      <CardContent>
        {serverState && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {serverState}
          </div>
        )}
        <form onSubmit={onSubmit} noValidate>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="example@gmail.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Password"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

