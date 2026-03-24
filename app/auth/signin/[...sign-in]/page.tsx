import { SignIn } from "@clerk/nextjs";

export default function SignInCatchAllPage() {
  return (
    <section className="section-padding">
      <div className="container-custom flex justify-center">
        <SignIn path="/auth/signin" routing="path" signUpUrl="/auth/signup" />
      </div>
    </section>
  );
}
