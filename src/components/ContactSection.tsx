import { motion } from "framer-motion";
import { Send, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
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
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } else {
      toast({ title: "Message sent successfully!" });
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Contact</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3">
            Let's <span className="gradient-text">Create</span> Together
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Have a project in mind? Let's talk about how AI can elevate your video content.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@calebpeters.com" },
              { icon: MapPin, label: "Location", value: "Lagos, Nigeria" },
              { icon: Clock, label: "Availability", value: "Mon - Sat, 9AM - 6PM" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  <div className="text-foreground font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="md:col-span-2 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                maxLength={100}
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                maxLength={255}
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              maxLength={200}
            />
            <textarea
              placeholder="Your Message *"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] transition-all duration-300 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
