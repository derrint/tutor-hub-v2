import { formatFullDate } from "@/utils";
import { getTranslations } from "next-intl/server";

/**
 * Personal greeting instead of a stock illustration, so the dashboard stays
 * specific to TutorHub rather than reading as a generic admin template.
 */
export default async function GreetingBanner({
  classesToday,
}: {
  classesToday: number;
}) {
  const t = await getTranslations("tutorHub.dashboard");

  return (
    <div className="rounded-2xl bg-brand-500 px-5 py-5 text-white md:px-6">
      <p className="text-theme-xl font-semibold">{t("greeting")}</p>
      <p className="mt-1 text-theme-sm text-white/80">
        {classesToday > 0
          ? t("classesWaiting", { count: classesToday })
          : t("noClassesToday")}{" "}
        · {formatFullDate(new Date())}
      </p>
    </div>
  );
}
