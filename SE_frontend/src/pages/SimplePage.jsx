import PageShell from "../components/PageShell";
import TopHeader from "../components/TopHeader";
import { FileText } from "lucide-react";

export default function SimplePage({ title, description }) {
  return (
    <PageShell>
      <main className="p-5 md:p-8 max-w-5xl mx-auto">
        <TopHeader title={title} subtitle={description} />
        <section className="card p-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-5">
            <FileText size={30} />
          </div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-7">{description}</p>
        </section>
      </main>
    </PageShell>
  );
}
