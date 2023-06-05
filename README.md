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

3. Setup NextAuth ([documentation](https://next-auth.js.org/getting-started/example)):
    - Install NextAuth and the Prisma adapter:
        ```
        npm install next-auth @auth/prisma-adapter
        ```
    - Create the `/api/auth/[...nextauth]/route.ts` API route.
        - Initialization and configuration of the route handlers can be found [here](https://next-auth.js.org/configuration/initialization#route-handlers-app).
        - Initialize a new PrismaClient and add the PrismaAdapter (reference: [PrismaAdapter](https://authjs.dev/reference/adapter/prisma)).
        - Import and add the desired authentication providers (in this case, [GoogleProvider](https://next-auth.js.org/providers/google)).
    - Wrap your main component in a Provider component that contains the SessionProvider.
    - Create a sign-in button client component that use the `useSession`, `signIn`, and `signOut` hooks from `"next-auth/react"`.

4. Loading... (still doing it, lol!)

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
