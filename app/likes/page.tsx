import PageIntro from "../components/PageIntro";
import LikedListings from "../components/LikedListings";

export default function LikesPage() {
  return (
    <div>
      <PageIntro
        eyebrow="Saved"
        title="Your liked properties"
        description="All the listings you have hearted in one place."
      />

      <section className="section-padding">
        <div className="container-custom">
          <LikedListings showTitle={false} />
        </div>
      </section>
    </div>
  );
}
