import { formatDate } from "../lib/content";

export function PoemDates({
  writtenAt,
  publishedAt,
  compact = false,
}: {
  writtenAt: string | null | undefined;
  publishedAt: string | null | undefined;
  compact?: boolean;
}) {
  const written = formatDate(writtenAt ?? null);
  const published = formatDate(publishedAt ?? null);
  if (!written && !published) return null;

  return (
    <span className={`poem-dates${compact ? " compact" : ""}`}>
      {written ? <time dateTime={writtenAt ?? undefined}>Written {written}</time> : null}
      {published ? <time dateTime={publishedAt ?? undefined}>Published {published}</time> : null}
    </span>
  );
}
