import LoginBtn from './components/login-btn'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className='mb-5'>
      Next-Auth with Stripe Subscriptions
      </div>
      <LoginBtn/>
    </main>
  )
}
