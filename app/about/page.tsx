import { Award, Building2, Sparkles, Users } from "lucide-react";
import PageIntro from "../components/PageIntro";

const values = [
  {
    title: "Trust First",
    description:
      "Every listing is presented with transparent data and clear context.",
    icon: Award,
  },
  {
    title: "People + Tech",
    description:
      "We combine real estate expertise with thoughtful product design.",
    icon: Users,
  },
  {
    title: "Local Knowledge",
    description:
      "Neighborhood-level insights help buyers and renters make better choices.",
    icon: Building2,
  },
  {
    title: "Continuous Innovation",
    description:
      "AI-enhanced discovery and recommendations keep improving your experience.",
    icon: Sparkles,
  },
];

function AboutPage() {
  return (
    <div>
      <PageIntro
        eyebrow="About us"
        title="Built for a simpler, smarter property journey"
        description="Makaan is focused on making real estate discovery modern, intuitive, and accessible across devices."
      />

      <section className="section-padding">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-5 gap-6">
          <article className="lg:col-span-2 card-soft rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-4">Our mission</h2>
            <p className="text-muted leading-relaxed">
              We help people discover the right home with less friction and more
              confidence. Whether you are buying, renting, or selling, our
              platform gives you clear details, responsive experiences, and
              meaningful insights.
            </p>
          </article>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="card-soft rounded-2xl p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
