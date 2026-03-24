import Link from "next/link";
import {
  Building2,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const footerLinks = {
  Browse: [
    { label: "All Listings", href: "/listings" },
    { label: "Homes For Sale", href: "/buy" },
    { label: "Rental Homes", href: "/rent" },
    { label: "Sell With Us", href: "/sell" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm mt-12">
      <div className="container-custom py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <Building2 className="w-5 h-5 text-primary-500" />
            <span>Makaan</span>
          </Link>
          <p className="mt-3 text-sm text-muted max-w-md">
            Your modern property destination for buying, renting, and selling
            homes with confidence.
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted">
            <p className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 21 Riverfront Ave, Austin, TX
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> +1 (800) 555-0144
            </p>
            <p className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4" /> hello@makaan.com
            </p>
          </div>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h3 className="font-semibold mb-3">{group}</h3>
            <ul className="space-y-2 text-sm text-muted">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-custom border-t border-slate-200/70 dark:border-slate-700/60 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <p>Copyright {new Date().getFullYear()} Makaan. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link
            href="#"
            aria-label="Instagram"
            className="hover:text-primary-500"
          >
            <Instagram className="w-4 h-4" />
          </Link>
          <Link
            href="#"
            aria-label="LinkedIn"
            className="hover:text-primary-500"
          >
            <Linkedin className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
