import { AlertTriangle } from "lucide-react";

/**
 * Shown when a request failed, as distinct from succeeding with nothing in it.
 *
 * Those two states looked identical for a long time: a rejected API key made
 * the site say "no projects yet" while 26 of them sat in the database. Saying
 * which one happened is the difference between a five-minute fix and a hunt.
 */
const DataError = ({ what = "this content" }: { what?: string }) => (
  <div className="mx-auto max-w-md rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
    <AlertTriangle className="mx-auto h-5 w-5 text-destructive" />
    <p className="mt-3 text-sm font-medium text-destructive">Couldn't load {what}</p>
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
      The database refused the request. This is usually the site's API key being wrong, expired or
      missing in the hosting environment rather than anything being deleted.
    </p>
  </div>
);

export default DataError;
