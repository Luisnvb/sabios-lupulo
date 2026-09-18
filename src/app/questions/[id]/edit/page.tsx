import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionById } from "@/lib/dal/questions";
import { QuestionForm } from "@/components/question-form";
import { DeleteQuestionButton } from "@/components/delete-question-button";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    notFound();
  }

  const question = await getQuestionById(id);
  if (!question) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <p>
        <Link href="/questions" className="text-sm font-medium text-amber-700 hover:underline">
          « Volver al listado
        </Link>
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">Editar pregunta</h1>
      <QuestionForm
        formMode="edit"
        questionId={question.id}
        initialValues={{
          category: question.category,
          difficulty: question.difficulty,
          text: question.text,
          imageUrl: question.imageUrl,
          options: question.options
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        }}
      />
      <div className="border-t border-stone-200 pt-6">
        <h2 className="mb-2 text-sm font-semibold text-stone-800">Zona de peligro</h2>
        <DeleteQuestionButton
          questionId={question.id}
          questionText={question.text}
          redirectTo="/questions"
        />
      </div>
    </main>
  );
}
