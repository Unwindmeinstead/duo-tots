import { notFound } from "next/navigation";
import { PracticeClient } from "@/components/practice-client";
import { categories, categoriesById, type CategoryId } from "@/lib/vocab";

type PracticePageProps = PageProps<"/practice">;

export default async function PracticePage(props: PracticePageProps) {
  const params = await props.searchParams;
  const requestedCategory = params.category;
  const fallback = categories[0].id;
  const categoryId =
    typeof requestedCategory === "string" ? requestedCategory : fallback;

  const category = categoriesById[categoryId as CategoryId];
  if (!category) {
    notFound();
  }

  return <PracticeClient category={category} />;
}
