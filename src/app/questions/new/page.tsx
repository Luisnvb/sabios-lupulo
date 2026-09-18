import Link from "next/link";
import { QuestionForm } from "@/components/question-form";

export default function NewQuestionPage() {
  return (
    <main className="space-y-6">
      <p>
        <Link href="/questions" className="text-sm font-medium text-amber-700 hover:underline">
          « Volver al listado
        </Link>
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">Nueva pregunta</h1>
      <QuestionForm formMode="create" />
    </main>
  );
}
