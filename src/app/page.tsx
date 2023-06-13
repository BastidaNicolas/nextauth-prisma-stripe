import LoginBtn from "./components/login-btn";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="mb-5 font-bold text-xl">
        Next.js 13.4 (/app), Prisma, Next-Auth with Stripe Subscriptions
      </div>
      <div className="border-4 w-full max-w-xs min-h-[25rem] flex justify-center items-center" >
        <LoginBtn />
      </div>
    </main>
  );
}
