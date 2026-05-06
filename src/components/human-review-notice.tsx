import { ShieldAlert } from "lucide-react";
import { HUMAN_REVIEW_NOTICE } from "@/lib/modules";

export function HumanReviewNotice() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-gi-amber" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-gi-ink">Revisao humana obrigatoria</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{HUMAN_REVIEW_NOTICE}</p>
        </div>
      </div>
    </section>
  );
}
