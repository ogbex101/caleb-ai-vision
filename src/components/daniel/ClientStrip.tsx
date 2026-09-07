import type { PortfolioItem } from "@/hooks/usePortfolioItems";

interface Props {
  items: PortfolioItem[];
}

/**
 * Wordmark trust strip built from the real client_name values already on
 * each production, rather than fabricated logos. Renders nothing when
 * there isn't enough real data yet, instead of showing placeholder names.
 */
const ClientStrip = ({ items }: Props) => {
  const clients = Array.from(new Set(items.map((i) => i.client_name).filter(Boolean))) as string[];
  if (clients.length < 3) return null;

  return (
    <div className="border-y border-border px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Trusted by</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {clients.map((client) => (
            <span key={client} className="font-display text-lg text-foreground/50 transition-colors hover:text-gold">
              {client}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientStrip;
