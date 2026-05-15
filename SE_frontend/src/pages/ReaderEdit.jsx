import { Link, useParams } from "react-router-dom";
import { books } from "../data/mockData";
import { ArrowLeft, Check, Image as ImageIcon, Upload, X } from "lucide-react";
import { useState } from "react";

const sampleText = [
  "They said the garden had been abandoned for fifty years, but the roses still bloomed.",
  "Maya pushed through the iron gate, its hinges protesting with a metallic shriek.",
  "Inside, time moved differently—or perhaps it didn't move at all.",
];

export default function ReaderEdit() {
  const { bookId } = useParams();
  const book = books.find((item) => item.id === bookId) || books[2];

  const [open, setOpen] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-slate-900">
      {/* Header */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to={`/books/${book.id}`}
            className="w-8 h-8 rounded-full hover:bg-slate-100 grid place-items-center"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <h1 className="text-sm font-semibold leading-4">{book.title}</h1>
            <p className="text-[11px] text-slate-500">{book.author}</p>
          </div>
        </div>
      </header>

      {/* Edit book preview */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white border border-slate-200 rounded-md shadow-sm min-h-[430px] px-16 py-12 relative">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-serif text-2xl font-bold">{book.title}</h2>
            <p className="text-xs text-slate-500 mt-2">by {book.author}</p>
            <div className="h-px bg-slate-200 my-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-8 text-[14px] leading-7">
            {sampleText.map((line, index) => (
              <p
                key={index}
                className={
                  index === 1
                    ? "hover:bg-blue-50 rounded px-1 cursor-text"
                    : ""
                }
              >
                {line}
              </p>
            ))}
          </div>
        </article>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => setOpen(true)}
            className="bg-white rounded-full shadow-lg border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <Upload size={15} /> 업로드
          </button>
        </div>
      </section>

      {/* Uploaded toast */}
      {uploaded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-full px-10 py-3 text-sm text-slate-500 z-50 inline-flex items-center gap-2">
          <Check size={16} className="text-emerald-500" />
          업로드가 완료되었습니다.
        </div>
      )}

      {/* Upload modal */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] grid place-items-center z-50">
          <div className="w-[360px] bg-[#f1f1f1] rounded-2xl shadow-2xl overflow-hidden border border-white/70">
            <div className="h-8 flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-4">
              <label className="grid grid-cols-[82px_1fr] items-start gap-2 text-xs font-semibold text-slate-800">
                <span>책 범위 영역</span>

                <textarea
                  className="h-20 border border-slate-300 bg-white rounded-sm p-2 outline-none resize-none"
                  defaultValue="Maya pushed through the iron gate..."
                />
              </label>

              <label className="grid grid-cols-[82px_1fr] items-start gap-2 text-xs font-semibold text-slate-800">
                <span># 해시태그</span>

                <textarea
                  className="h-24 border border-slate-300 bg-white rounded-sm p-2 outline-none resize-none"
                  defaultValue="#mystery #garden #quiet"
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-xs rounded-lg bg-white border border-slate-200"
                >
                  취소
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    setUploaded(true);
                    window.setTimeout(() => setUploaded(false), 1800);
                  }}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-900 text-white inline-flex items-center gap-1.5"
                >
                  <ImageIcon size={13} /> 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}