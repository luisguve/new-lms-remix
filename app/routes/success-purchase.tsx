import type { Route } from "./+types/success-purchase";
import { Link } from "react-router";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { formatSeconds } from "~/lib/duration";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import FinishRegister from "~/components/forms/finish-register";
import FinishLogin from "~/components/forms/finish-login";

interface IOrder {
  id: string;
  documentId: string;
  amount: number;
  payment_method: string;
  confirmed: boolean;
  checkout_session: string;
  createdAt: string;
  courses?: Array<{
    documentId: string;
    title: string;
    slug: string;
    duration?: number;
    category?: string;
    thumbnail?: {
      url: string;
    };
  }>;
  is_new_account?: boolean;
  user_email?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Order Confirmation - New React Router App" },
    { name: "description", content: "Thank you for your purchase!" },
  ];
}

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return { order: null, error: "No session ID provided" };
  }

  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
  if (!STRAPI_URL) {
    return { order: null, error: "Server address is not configured" };
  }

  try {
    // Try to get auth token from request headers if available
    // For now, we'll use the confirm endpoint without user
    const response = await fetch(`${STRAPI_URL}/api/maestro/orders/confirm`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_session: sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        order: null,
        error: errorData?.error?.message || `HTTP error! status: ${response.status}`,
      };
    }

    const order: IOrder = await response.json();
    return { order, error: null };
  } catch (error) {
    return {
      order: null,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export default function SuccessPurchase({ loaderData }: Route.ComponentProps) {
  const { order, error } = loaderData;

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Error</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link
                to="/courses"
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Browse Courses
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                We&apos;re confirming your purchase!
              </h2>
              <p className="text-muted-foreground">
                This may take a moment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {order.is_new_account ? (
        <FinishRegister
          email={order.user_email || ""}
          checkoutSession={order.checkout_session}
        />
      ) : (
        order.user_email && <FinishLogin email={order.user_email} />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold">Order Confirmation</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order #</p>
              <p className="font-medium">{order.id}</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Thank you for your purchase!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">{formattedDate}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Payment Method:</span>{" "}
                  <span className="font-medium capitalize">
                    {order.payment_method.replace("_", " ")}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium">
                    {order.confirmed ? (
                      <span className="text-green-600">Confirmed</span>
                    ) : (
                      <span className="text-yellow-600">Processing</span>
                    )}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Total Amount
              </p>
              <p className="text-3xl font-bold">${order.amount.toFixed(2)}</p>
            </div>
          </div>

          {order.courses && order.courses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Courses Purchased</h2>
              <div className="space-y-4">
                {order.courses.map((course) => (
                  <div
                    key={course.documentId}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    {course.thumbnail?.url && (
                      <img
                        src={course.thumbnail.url}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-1">
                        {course.title}
                      </h3>
                      {course.category && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {course.category}
                        </p>
                      )}
                      {course.duration && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatSeconds(course.duration)}
                        </p>
                      )}
                      <Link
                        to={`/courses/${course.slug}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Access Course →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              to="/courses"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View All Courses
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

