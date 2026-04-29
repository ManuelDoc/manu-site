import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about-us", label: "About Us" },
  { href: "#projects", label: "Projects" },
  { href: "#team", label: "Team" },
  { href: "#contacts", label: "Contacts" },
];

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5 lg:px-16">
      <a className="text-xl font-semibold uppercase text-foreground" href="#top" aria-label="SENTINEL AI home">
        SENTINEL
      </a>

      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <a
            className="text-sm uppercase text-muted-foreground transition-colors hover:text-foreground"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <Button
        asChild
        className="hidden rounded-lg px-6 text-xs uppercase md:inline-flex"
        size="lg"
        variant="navCta"
      >
        <a href="#contacts">Get Quote</a>
      </Button>
    </header>
  );
}
