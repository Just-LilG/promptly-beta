"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight } from "@/icons";
import { Card } from "@/components/card";
import { tracks } from "@/lib/tracks";
import { getOnboardingProfile } from "@/lib/onboarding";
import { TrackIcon } from "@/components/track-icon";

export function SuggestedTrackCard() {
  const [suggestedSlug] = useState(() => {
    if (typeof window === "undefined") return tracks[0].slug;
    return getOnboardingProfile()?.primaryInterest ?? tracks[0].slug;
  });

  if (!suggestedSlug) return null;
  const track = tracks.find((t) => t.slug === suggestedSlug);
  if (!track) return null;

  return (
    <Link href={`/tracks/${track.slug}`} className="block">
      <Card className="p-3.5 flex items-center gap-3.5 active:scale-[0.99] md:active:scale-100 transition-transform pc-lift">
        <TrackIcon track={track} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-accent font-medium">Picked for you</p>
          <p className="text-[14px] font-medium">{track.name}</p>
          <p className="text-[12.5px] text-muted mt-0.5 truncate">{track.blurb}</p>
        </div>
        <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
      </Card>
    </Link>
  );
}
