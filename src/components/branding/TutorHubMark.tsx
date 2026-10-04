import { cn } from "@/utils";
import { Shapes } from "lucide-react";

type TutorHubMarkProps = {
  className?: string;
  strokeWidth?: number;
};

/** TutorHub logomark — Lucide `Shapes` icon. */
export default function TutorHubMark({
  className,
  strokeWidth = 2,
}: TutorHubMarkProps) {
  return (
    <Shapes
      className={cn("shrink-0", className)}
      strokeWidth={strokeWidth}
      aria-hidden
    />
  );
}
