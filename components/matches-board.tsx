"use client";

import { useMemo, useState } from "react";

import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";
import { getGroupLabel, normalizeGroupCode } from "@/lib/utils/tournament";
import type { HydratedMatch } from "@/types";

interface MatchesBoardProps {
  matches: HydratedMatch[];
}

export function MatchesBoard({ matches }: MatchesBoardProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const filters = useMemo(
    () => [
      "All",
      ...new Set(matches.map((match) => (match.group ? getGroupLabel(match.group) : match.roundLabel))),
    ],
    [matches],
  );

  const filteredMatches = useMemo(() => {
    if (!selectedGroup || selectedGroup === "All") {
      return matches;
    }

    return matches.filter((match) => {
      if (!match.group) {
        return match.roundLabel === selectedGroup;
      }

      return normalizeGroupCode(match.group) === normalizeGroupCode(selectedGroup);
    });
  }, [matches, selectedGroup]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <Button key={filter} variant={selectedGroup === filter || (!selectedGroup && filter === "All") ? "primary" : "secondary"} onClick={() => setSelectedGroup(filter === "All" ? null : filter)}>
            {filter}
          </Button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {filteredMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
