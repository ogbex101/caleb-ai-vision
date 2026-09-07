import { motion } from "framer-motion";
import { Clapperboard, Clock, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Styled as a "call sheet": a dark slate panel of production details next
 * to the form, rather than the icon-list + form grid used elsewhere.
 */
const DanielContact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || "Daniel Studio inquiry",
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } else {
      toast({ title: "Brief received", description: "Daniel Studio will follow up shortly." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-gold/40">
        <div className="grid md:grid-cols-[1fr_1.3fr]">
          <div className="relative bg-card p-10 md:p-12">
            <div className="gold-divider absolute inset-x-0 top-0 h-px md:hidden" />
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
              <Clapperboard className="h-4 w-4" /> Production sheet
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">Start the brief.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Send the concept, references and timeline. A director from the studio replies within one business day.
            </p>
            <div className="mt-10 space-y-6">
              {[
                { icon: Mail, label: "Email", value: "studio@danielstudio.ai" },
                { icon: MapPin, label: "Based in", value: "Lagos, Nigeria (remote worldwide)" },
                { icon: Clock, label: "Response time", value: "Within 1 business day" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-4">
                  <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</div>
                    <div className="font-medium text-foreground">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-4 bg-background p-10 md:p-12"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-gold/60 focus:outline-none"
                maxLength={100}
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-gold/60 focus:outline-none"
                maxLength={255}
              />
            </div>
            <input
              type="text"
              placeholder="Project / Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-gold/60 focus:outline-none"
              maxLength={200}
            />
            <textarea
              placeholder="Tell us about the concept *"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-gold/60 focus:outline-none"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-8 py-4 font-display font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              {loading ? "Sending..." : "Send the Brief"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default DanielContact;
