## Next-Auth, Prisma & Stripe Tutorial. (Next.js /app)
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
1. Run the following command to create a new Next.js app:
    ```
    npx create-next-app@latest
    ```

2. Setup Prisma ([documentation](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-mysql)):
    - Install Prisma as a dev dependency:
        ```
        npm install prisma --save-dev
        ```
    - Initialize Prisma:
        ```
        npx prisma init
        ```
    - Set up and connect to your database.
    - Create your database schema in `schema.prisma`.
    - Push the changes to the database:
        ```
        npx prisma db push
        ```
    - Install the Prisma Client library:
        ```
        npm install @prisma/client
        ```
    - Generate the Prisma Client:
        ```
        npx prisma generate
        ```
    - Initiate a global PrismaClient instance in the `lib/prisma.ts` file. In this case, I placed it within the same Prisma folder, `prisma/prisma.ts`. ([documentation](https://vercel.com/guides/nextjs-prisma-postgres#step-4.-install-and-generate-prisma-client))

3. Setup NextAuth ([documentation](https://next-auth.js.org/getting-started/example)):
    - Install dependencies:
    - `npm install next-auth @auth/prisma-adapter`
    - Create `/api/auth/[...nextauth]/route.ts` API route:
        - [NextAuth.js Route Handlers](https://next-auth.js.org/configuration/initialization#route-handlers-app):
            - Declare the options that go into `NextAuth()` before `handler` in a variable that is exported, so we can use it later. It should look like this:
                ```typescript
                export const authOptions: NextAuthOptions = {} // here go all the options.
                ```
        - Import `prisma` from `prisma.ts` and add the `PrismaAdapter` ([Prisma Adapter](https://authjs.dev/reference/adapter/prisma))
        - Import and add providers (in this case, it's `GoogleProvider`) ([Google Provider](https://next-auth.js.org/providers/google)):
            - You'll need to create an OAuth Client ID to get the Client ID and secret ([Google Cloud Console](https://console.cloud.google.com/apis/credentials)):
                - Application type: set to "Web Application"
                - Authorized JavaScript origins: add `http://localhost:YOUR_PORT` & `http://localhost` (for deployed app, add the appropriate URL)
                - Authorized redirect URIs: add `http://localhost:YOUR_PORT/api/auth/callback/google` (for deployed app, add the URL with the same route: `/api/auth/callback/google`)
    - Wrap `main` in a Provider component that contains `SessionProvider` (this component must be tagged with 'use client').
    - Create a signin button component using `useSession`, `signIn`, `signOut` from "next-auth/react" (this component must be tagged with 'use client').
    - This setup should allow you to sign in and sign out successfully. The user should be saved in the database, and a session will be created when logged in.


4. Setup Stripe
    - Create a Stripe account
        - Copy "STRIPE_SECRET_KEY" and "STRIPE_PUBLISHABLE_KEY"
        - Check the `.env.example` to see how your `.env` should end up
    - Install Stripe and stripe-js
        - Run `npm install stripe --save`
        - Run `npm install @stripe/stripe-js`
    - Modify `schema.prisma`
        - Add the following fields to the `User` model:
            ```prisma
            stripeCustomerId String?   @unique
            isActive         Boolean   @default(false)
            ```
        - Run `npx prisma db push`
        - Run `npx prisma generate`
    - Go to `/api/auth/[...nextauth]/route.ts`
        - After `providers`, add `secret: process.env.NEXTAUTH_SECRET,`
        - Inside `callbacks:{}`, set up a callback function to add necessary values to the session object. This ensures that when a session is checked (`useSession`, `getSession`, `getServerSession`), the required values are available. The callback should look like this:
            ```typescript
            callbacks: {
                async session({ session, user }) {
                    session!.user!.id = user.id;
                    session!.user!.stripeCustomerId = user.stripeCustomerId;
                    session!.user!.isActive = user.isActive;
                    return session;
                },
            },
            ```
        - If you are using TypeScript, create a `types.d.ts` file at the same level as the `src/` folder with the following content:
            ```typescript
            import { DefaultUser } from 'next-auth';

            declare module 'next-auth' {
                interface Session {
                    user?: DefaultUser & { id: string; stripeCustomerId: string; isActive: boolean };
                }
                interface User extends DefaultUser {
                    stripeCustomerId: string;
                    isActive: boolean;
                }
            }
            ```
        - Add `events:{}` to automatically create an account in the Stripe dashboard when a user logs in for the first time. Later, the `stripeCustomerId` will be added to that user's account in our database. It should look like this:
            ```typescript
            events: {
                createUser: async ({ user }) => {
                    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                        apiVersion: "2022-11-15",
                    });

                    await stripe.customers.create({
                        email: user.email!,
                        name: user.name!,
                    })
                    .then(async (customer) => {
                        return prisma.user.update({
                            where: { id: user.id },
                            data: {
                                stripeCustomerId: customer.id,
                            },
                        });
                    });
                },
            },
            ```
    - If you have data in your database, delete it (you can use `npx prisma studio` to view and modify your database).
    - At this point, you should be able to log in and see how a user is created in your database with the added values. In your Stripe dashboard, you should also see that a new customer was created.
    - Now we will work on the checkout:
        - Create `/api/stripe/checkout-session/route.ts` API route:
            - Create a `POST` function and import `NextRequest` and `NextResponse`. Declare a `body` variable and initialize Stripe and `getServerSession`. It should look like this:
                ```typescript
                import { NextRequest, NextResponse } from "next/server";
                import { authOptions } from "../../auth/[...nextauth]/route";
                import { getServerSession } from "next-auth";
                import Stripe from "stripe";
    
                export async function POST(req: NextRequest) {
                    const body = await req.json();
    
                    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                        apiVersion: "2022-11-15",
                    });
    
                    const session = await getServerSession(authOptions);
                }
                ```
            - Before creating a checkout session, let's validate that the session exists. Otherwise, throw an error:
                ```typescript
                if (!session?.user) {
                    return NextResponse.json(
                        {
                            error: {
                                code: "no-access",
                                message: "You are not signed in.",
                            },
                        },
                        { status: 401 }
                    );
                }
                ```
            - Create the Stripe checkout session ([How Checkout Works](https://stripe.com/docs/payments/checkout/how-checkout-works)):
                ```typescript
                const checkoutSession = await stripe.checkout.sessions.create({
                    mode: "subscription",
                    customer: session.user.stripeCustomerId,
                    line_items: [
                        {
                            price: body,
                            quantity: 1,
                        },
                    ],
                    success_url: process.env.NEXT_PUBLIC_WEBSITE_URL + `/success`,
                    cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL + `/error`,
                    subscription_data: {
                        metadata: {
                            payingUserId: session.user.id,
                        },
                    },
                });
                ```
            - Ensure that the checkout session returns a URL; otherwise, throw an error:
                ```typescript
                if (!checkoutSession.url) {
                    return NextResponse.json(
                        {
                            error: {
                                code: "stripe-error",
                                message: "Could not create checkout session",
                            },
                        },
                        { status: 500 }
                    );
                }
                ```
            - If everything goes well, return the checkout session:
                ```typescript
                return NextResponse.json({ session: checkoutSession }, { status: 200 });
                ```
            - LOADING...
    

## Run The Project Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
