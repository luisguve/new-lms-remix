import { useState, type FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { STRAPI } from "~/lib/strapi";
import axios from "axios";
import { useUser } from "~/contexts/user-context";
import { getStrapiError } from "~/utils/axiosErrors";
import { Loader2 } from "lucide-react";

type Props = {
  email: string;
};

interface AuthResponse {
  jwt: string;
  user: {
    username: string;
    email: string;
  };
}

export default function FinishLogin({ email }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverState, setServerState] = useState(() => {
    if (!STRAPI) {
      return "Server address is unset";
    }
    return "";
  });
  const { setLogin, isLoggedIn, username } = useUser();
  const [formData, setFormData] = useState({
    log_email: email,
    log_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.log_email) {
      newErrors.log_email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.log_email)) {
      newErrors.log_email = "Invalid email address";
    }

    if (!formData.log_password) {
      newErrors.log_password = "Password is required";
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
          password: formData.log_password,
          identifier: formData.log_email,
        }
      );

      const responseData = response.data;
      const { jwt } = responseData;
      setLogin({
        username: responseData.user.username,
        email: responseData.user.email,
        token: jwt,
      });
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

  if (isLoggedIn) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h1 className="text-xl mb-2">Welcome back, {username}!</h1>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h1 className="text-xl">Login to your account</h1>
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
              disabled
              id="email"
              type="email"
              value={formData.log_email}
              className="w-full px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
              readOnly
            />
            {errors.log_email && (
              <p className="mt-1 text-sm text-destructive">{errors.log_email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="log_password"
              className="block text-sm font-medium mb-2"
            >
              Password *
            </label>
            <input
              id="log_password"
              type="password"
              value={formData.log_password}
              onChange={(e) =>
                setFormData({ ...formData, log_password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.log_password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.log_password}
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
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

