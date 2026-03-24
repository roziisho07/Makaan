import { Mail, MapPin, Phone } from "lucide-react";
import PageIntro from "../components/PageIntro";

function ContactPage() {
  return (
    <div>
      <PageIntro
        eyebrow="Contact"
        title="Talk with our property team"
        description="Have a question about buying, renting, or selling? Send us a message and we will get back quickly."
      />

      <section className="section-padding">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-5 gap-6">
          <article className="lg:col-span-2 card-soft rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-4">Get in touch</h2>
            <ul className="space-y-4 text-muted">
              <li className="inline-flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500" /> +1 (800) 555-0144
              </li>
              <li className="inline-flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500" /> hello@makaan.com
              </li>
              <li className="inline-flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary-500" /> 21 Riverfront
                Ave, Austin, TX
              </li>
            </ul>
          </article>

          <form className="lg:col-span-3 card-soft rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm">
                <span className="font-medium">First name</span>
                <input
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Alex"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Last name</span>
                <input
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Johnson"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm block">
              <span className="font-medium">Email</span>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="you@example.com"
              />
            </label>

            <label className="space-y-2 text-sm block">
              <span className="font-medium">Message</span>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="Tell us what you are looking for..."
              />
            </label>

            <button
              type="button"
              className="px-5 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
