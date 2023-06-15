"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const baseBtnStyle ="bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      return router.push("/");
    }
  }, [status, session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "authenticated" && session?.user?.isActive) {
    return (
      <section className="">
        {/* Include shared UI here e.g. a header or sidebar */}
        <nav className="flex items-center justify-between w-full p-3 top-0 sticky z-10 border-b-4">
          Signed in as {session?.user?.name} <br />
          <button className={baseBtnStyle} onClick={() => signOut({ callbackUrl: '/' })}>
            Sign out
          </button>
        </nav>

        {children}
      </section>
    );
  }else{
    return router.push("/subscription");
  }
}
