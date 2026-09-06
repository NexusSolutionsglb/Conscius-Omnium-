/**
 * Extracts a YouTube video id from any of the URL shapes the material used
 * (`youtu.be/<id>`, `youtube.com/watch?v=<id>`) embedded inside a free-text
 * string like "Watch the process: https://youtu.be/xxxx".
 */
function extractYouTubeId(text: string): string | null {
  const short = text.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];
  const long = text.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (long) return long[1];
  // Bare /embed/<id> and /shorts/<id> links, and a pasted id on its own.
  const embed = text.match(/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{6,})/);
  if (embed) return embed[1];
  const bare = text.trim().match(/^[a-zA-Z0-9_-]{11}$/);
  return bare ? bare[0] : null;
}

/** Embedded "watch the process" player — real client-supplied video only. */
export function ProcessVideo({ process, title }: { process: string; title: string }) {
  const id = extractYouTubeId(process);
  if (!id) return null;

  return (
    <div className="aspect-video w-full overflow-hidden bg-obsidian">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={`${title} — the process, on YouTube`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="h-full w-full"
      />
    </div>
  );
}
