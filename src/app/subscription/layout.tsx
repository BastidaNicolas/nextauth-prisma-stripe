"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardSubscription({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.isActive) {
      return router.push("/dashboard");
    }
    if (status === "unauthenticated") {
      return router.push("/");
    }
  }, [status, session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "authenticated" && !session?.user?.isActive) {
    return (
      <section className="flex min-h-screen items-center">
        {/* Include shared UI here e.g. a header or sidebar */}
        <nav></nav>

        {children}
      </section>
    );
  }
}
