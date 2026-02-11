import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl gradient-text">
          CP<span className="text-primary">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "About", href: "#about" },
            { label: "Work", href: "#portfolio" },
            { label: "Testimonials", href: "#testimonials" },
            { label: "Contact", href: "#contact" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/portfolio"
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] transition-all"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
