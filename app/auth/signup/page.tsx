import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <section className="section-padding">
      <div className="container-custom flex justify-center">
        <SignUp path="/auth/signup" routing="path" signInUrl="/auth/signin" />
      </div>
    </section>
  );
}
