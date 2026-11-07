import { notFound } from "next/navigation";
import { WorldLessonClient } from "@/components/world-lesson-client";
import { getWorldLesson, WORLD_LESSONS } from "@/lib/world-book";

type WorldLessonPageProps = PageProps<"/world/[lessonId]">;

export function generateStaticParams() {
  return WORLD_LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function WorldLessonPage(props: WorldLessonPageProps) {
  const { lessonId } = await props.params;
  const lesson = getWorldLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  const index = WORLD_LESSONS.findIndex((l) => l.id === lesson.id);
  const next = WORLD_LESSONS[index + 1] ?? null;

  return (
    <WorldLessonClient
      lesson={lesson}
      nextLessonId={next ? next.id : null}
      lessonNumber={index + 1}
    />
  );
}
