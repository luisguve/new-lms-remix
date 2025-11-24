import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { formatSeconds } from "~/lib/duration";
import { Clock, Users, BookOpen, Globe, Calendar, User } from "lucide-react";
import { useUser } from "~/contexts/user-context";
import useCurrentLecture from "~/hooks/use-current-lecture";

type CourseInfoProps = {
  slug: string;
  documentId?: string;
  price: number;
  instructor: string;
  duration: number;
  lectures: number;
  students: number;
  language: string;
  publishedAt: string;
  showButton?: boolean;
};

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

interface StrapiErrorData {
  error?: {
    message?: string;
    status?: number;
  };
}

function getStrapiError(error: unknown): string {
  if (error instanceof Error) {
    // Try to parse as JSON if it's a stringified error
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    } catch {
      // Not JSON, continue
    }

    // Check if it's a fetch error response
    if (error.message) {
      return error.message;
    }
  }

  // For Response objects from fetch
  if (error && typeof error === "object" && "json" in error) {
    // This will be handled in the catch block
    return "";
  }

  return "An error occurred";
}

export default function CourseInfo({
  slug,
  documentId,
  price,
  instructor,
  duration,
  lectures,
  students,
  language,
  publishedAt,
  showButton = false,
}: CourseInfoProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverState, setServerState] = useState("");
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn, email, token } = useUser();
  const {
    currentLecture,
    serverState: lectureError,
    hasAccess,
  } = useCurrentLecture(documentId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBuy = async () => {
    if (!STRAPI_URL) {
      setServerState("Server address is not configured");
      return;
    }

    try {
      setServerState("");
      setIsProcessing(true);

      // Use token and email from useUser hook if available

      // Prepare the request data
      const requestData = {
        courses: [documentId],
        payment_method: "credit_card",
        ...(email && { email }),
      };

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      type OrderResponse = {
        id: string;
        checkout_session?: string;
        data: { url?: string };
      };

      // Make the API request
      const response = await fetch(`${STRAPI_URL}/api/maestro/orders`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData: StrapiErrorData = await response
          .json()
          .catch(() => ({}));
        const errorMessage =
          errorData?.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const dataResponse: OrderResponse = await response.json();

      // Handle the response - redirect to Stripe Checkout
      if (dataResponse.data.url) {
        // If the backend returns the checkout URL directly, use it
        window.location.href = dataResponse.data.url;
      } else if (dataResponse.checkout_session) {
        // If only the session ID is provided, construct the checkout URL
        // Format: https://checkout.stripe.com/c/pay/{sessionId}
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${dataResponse.checkout_session}`;
        window.location.href = checkoutUrl;
      } else if (dataResponse.id) {
        // Fallback: use the order ID as session ID
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${dataResponse.id}`;
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      let errorMsg = "An error occurred";
      const strapiErrorMsg = getStrapiError(error);
      if (strapiErrorMsg) {
        errorMsg = strapiErrorMsg;
      }
      setServerState(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!mounted) return null;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h6 className="text-sm font-medium mb-0">Price</h6>
          <span className="text-right">
            <span className="text-2xl text-primary font-extrabold">
              ${price.toFixed(2)}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoItem
          icon={<User className="size-4" />}
          label="Instructor"
          value={instructor}
        />
        <InfoItem
          icon={<Clock className="size-4" />}
          label="Duration"
          value={formatSeconds(duration)}
        />
        <InfoItem
          icon={<BookOpen className="size-4" />}
          label="Lectures"
          value={lectures}
        />
        <InfoItem
          icon={<Users className="size-4" />}
          label="Enrolled"
          value={`${students} Students`}
        />
        <InfoItem
          icon={<Globe className="size-4" />}
          label="Language"
          value={language}
        />
        <InfoItem
          icon={<Calendar className="size-4" />}
          label="Last updated"
          value={formattedDate}
        />
      </CardContent>
      {showButton && (
        <div className="px-6 pb-6 space-y-2">
          {serverState && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {serverState}
            </div>
          )}
          {lectureError && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {lectureError}
            </div>
          )}
          {(() => {
            if (isLoggedIn) {
              if (hasAccess && currentLecture) {
                return (
                  <Button className="w-full" asChild>
                    <Link to={`/courses/${slug}/${currentLecture.slug}`}>
                      Continue course
                    </Link>
                  </Button>
                );
              }
              return (
                <Button
                  className="w-full"
                  onClick={handleBuy}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Buy this course"}
                </Button>
              );
            }
            return (
              <Button
                className="w-full"
                onClick={handleBuy}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Buy this course"}
              </Button>
            );
          })()}
        </div>
      )}
    </Card>
  );
}
