import Link from "next/link";
import { CaretRight } from "@/icons";
import { Card } from "@/components/card";
import { tracks } from "@/lib/tracks";
import { TrackIcon } from "@/components/track-icon";

export default function TracksPage() {
  const [featured, ...rest] = tracks;

  return (
    <div className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight">Domain tracks</h1>
      <p className="text-muted text-[14px] mt-1.5 max-w-xl">
        Pick what you actually use AI for. Each track coaches the prompting habits that matter there.
      </p>

      <Link href={`/tracks/${featured.slug}`} className="block mt-6">
        <Card className="p-5 md:p-7 active:scale-[0.99] md:active:scale-100 transition-transform pc-lift">
          <p className="text-[12.5px] font-medium text-accent">Start here</p>
          <div className="flex items-start gap-3 mt-2">
            <TrackIcon track={featured} size="sm" />
            <div className="min-w-0">
              <p className="text-[16px] md:text-[20px] font-semibold tracking-tight">{featured.name}</p>
              <p className="text-[13.5px] text-muted mt-1 leading-snug">{featured.blurb}</p>
              <p className="text-[12.5px] text-muted-soft mt-2">{featured.lessons} scenarios</p>
            </div>
          </div>
        </Card>
      </Link>

      <div className="mt-8">
        <h2 className="text-[15px] font-semibold mb-1 md:mb-3">More domains</h2>
        <div className="flex flex-col divide-y divide-border md:grid md:grid-cols-2 md:gap-3 md:divide-y-0">
          {rest.map((track) => {
            return (
              <Link key={track.slug} href={`/tracks/${track.slug}`} className="block">
                <div className="flex items-center gap-3 py-3.5 active:opacity-70 md:py-4 md:px-4 md:rounded-[var(--radius-lg)] md:border md:border-border md:bg-surface pc-lift">
                  <TrackIcon track={track} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium">{track.name}</p>
                    <p className="text-[12.5px] text-muted truncate">{track.blurb}</p>
                  </div>
                  <span className="text-[12px] text-muted-soft shrink-0">{track.lessons}</span>
                  <CaretRight className="w-3.5 h-3.5 text-muted-soft shrink-0 pc-cta-arrow" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
