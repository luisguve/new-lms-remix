import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { formatSeconds } from "~/lib/duration";
import { Clock, Users, BookOpen, Globe, Calendar, User } from "lucide-react";

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

export default function CourseInfo({
  slug,
  price,
  instructor,
  duration,
  lectures,
  students,
  language,
  publishedAt,
  showButton = false,
}: CourseInfoProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
        <div className="px-6 pb-6">
          <Button className="w-full">Buy this course</Button>
        </div>
      )}
    </Card>
  );
}

