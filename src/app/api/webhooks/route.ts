import { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";
import prisma from "../../../../prisma/prisma";
import getRawBody from "raw-body";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2022-11-15",
});

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe requires the raw body to construct the event.
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const cors = Cors({
//   allowMethods: ["POST", "HEAD"],
// });

const webhookHandler = async (req: NextRequest) => {
//   if (req.method === "POST") {
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      // On error, log and return the error message.
      if (err! instanceof Error) console.log(err);
      console.log(`❌ Error message: ${errorMessage}`);
      
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: ${errorMessage}`,
          },
        },
        { status: 400 }
      );
    }

    // Successfully constructed event.
    console.log("✅ Success:", event.id);

    switch (event.type) {
      case "customer.subscription.created":
        const subscriptio = event.data.object as Stripe.Subscription;
        await prisma.user.update({
          // Find the customer in our database with the Stripe customer ID linked to this purchase
          where: {
            stripeCustomerId: subscriptio.customer as string,
          },
          // Update that customer so their status is now active
          data: {
            isActive: true,
          },
        });
        break;
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.update({
          // Find the customer in our database with the Stripe customer ID linked to this purchase
          where: {
            stripeCustomerId: subscription.customer as string,
          },
          // Update that customer so their status is now active
          data: {
            isActive: false,
          },
        });
        break;
      default:
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event.
    return NextResponse.json({ received: true });
//   } else {
//     return NextResponse.json(
//         {
//           error: {
//             message: `Method Not Allowed`,
//           },
//         },
//         { status: 405 },
//       ).headers.set("Allow", "POST");
//     // res.setHeader("Allow", "POST");
//     // res.status(405).end("Method Not Allowed");
//   }
};

// export default cors(webhookHandler as any);
export { webhookHandler as POST };