'use client'
import { useSession, signIn, signOut } from "next-auth/react"

const baseBtnStyle = 'bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1'

export default function LoginBtn() {

  const { data: session } = useSession()

  if (session?.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button className={baseBtnStyle} onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button className={baseBtnStyle} onClick={() => signIn()}>Sign in</button>
    </>
  )
}