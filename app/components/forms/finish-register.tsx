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
  checkoutSession: string;
};

interface AuthResponse {
  jwt: string;
  user: {
    username: string;
    email: string;
  };
}

export default function FinishRegister({ email, checkoutSession }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverState, setServerState] = useState(() => {
    if (!STRAPI) {
      return "Server address is unset";
    }
    return "";
  });
  const { setLogin, isLoggedIn, username } = useUser();
  const [formData, setFormData] = useState({
    reg_email: email,
    reg_fullname: "",
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

    if (!formData.reg_fullname) {
      newErrors.reg_fullname = "Full name is required";
    }

    if (!formData.reg_password) {
      newErrors.reg_password = "Password is required";
    } else if (formData.reg_password.length < 6) {
      newErrors.reg_password = "Password must be at least 6 characters";
    }

    if (formData.reg_password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      
      await axios.put(`${STRAPI}/api/maestro/orders/finish-register`, {
        checkout_session: checkoutSession,
        password: formData.reg_password,
        email: formData.reg_email,
        username: formData.reg_fullname,
      });

      const response = await axios.post<AuthResponse>(
        `${STRAPI}/api/auth/local`,
        {
          password: formData.reg_password,
          identifier: formData.reg_email,
        }
      );

      const responseData = response.data;
      const { jwt, user } = responseData;
      setLogin({
        username: user.username,
        email: user.email,
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
          <h1 className="text-xl mb-2">
            Welcome to the platform, {username}!
          </h1>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h1 className="text-xl">Finish setting up your account</h1>
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
              value={formData.reg_email}
              className="w-full px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
              readOnly
            />
            {errors.reg_email && (
              <p className="mt-1 text-sm text-destructive">{errors.reg_email}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="reg_fullname" className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              id="reg_fullname"
              type="text"
              value={formData.reg_fullname}
              onChange={(e) =>
                setFormData({ ...formData, reg_fullname: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your full name"
            />
            {errors.reg_fullname && (
              <p className="mt-1 text-sm text-destructive">
                {errors.reg_fullname}
              </p>
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
              placeholder="Enter your password"
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
              placeholder="Confirm your password"
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

