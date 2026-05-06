import { ShieldAlert } from "lucide-react";
import { HUMAN_REVIEW_NOTICE } from "@/lib/modules";

export function HumanReviewNotice() {
  return (
    <section className="rounded-lg border border-gi-gold/35 bg-gradient-to-r from-white to-gi-gold/10 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-gi-gold/35 bg-gi-gold/15 text-gi-navy">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gi-ink">Revisão humana obrigatória</h2>
          <p className="mt-2 text-sm leading-6 text-gi-muted">{HUMAN_REVIEW_NOTICE}</p>
        </div>
      </div>
    </section>
  );
}
