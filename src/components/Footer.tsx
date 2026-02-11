import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="font-display font-bold text-xl gradient-text">
          CP<span className="text-primary">.</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Caleb Peters. Crafting the future of video.
        </p>
        <div className="flex items-center gap-6">
          <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Get in Touch
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
