"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import getStripe from "../utils/getStripe";

const baseBtnStyle =
  "bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1";

export default function LoginBtn() {
  const { data: session } = useSession();

  const handleCreateCheckoutSession = async () => {
    const res = await fetch(`/api/stripe/checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const checkoutSession = await res.json().then((value) => {return value.session});

    const stripe = await getStripe();
    const { error } = await stripe!.redirectToCheckout({
      sessionId: checkoutSession.id,
    });

    console.warn(error.message);
  };

  if (session?.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button className={baseBtnStyle} onClick={() => signOut()}>
          Sign out
        </button>
        <button
          className={baseBtnStyle}
          onClick={() => handleCreateCheckoutSession()}
        >
          Creat Checkout Session
        </button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button className={baseBtnStyle} onClick={() => signIn()}>
        Sign in
      </button>
    </>
  );
}
