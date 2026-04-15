import { notFound } from "next/navigation";
import { LessonClient } from "@/components/lesson-client";
import { categoriesById, type CategoryId } from "@/lib/vocab";

type LessonPageProps = PageProps<"/lesson/[categoryId]">;

export default async function LessonPage(props: LessonPageProps) {
  const { categoryId } = await props.params;
  const category = categoriesById[categoryId as CategoryId];

  if (!category) {
    notFound();
  }

  return <LessonClient category={category} />;
}
