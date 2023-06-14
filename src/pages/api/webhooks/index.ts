// import Stripe from "stripe";
// import { NextApiRequest, NextApiResponse } from "next";
// import getRawBody from "raw-body";
// import Cors from 'micro-cors';
// import { buffer } from "micro";
// import prisma from "../../../prisma/prisma";

// const cors = Cors({
//   allowMethods: ['POST', 'HEAD'],
// });

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // async function buffer(readable:any) {
// //   const chunks = [];
// //   for await (const chunk of readable) {
// //     chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
// //   }
// //   return Buffer.concat(chunks);
// // }
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2022-11-15",
// });

// const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

// const handler = async (
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<void> => {

//   if (req.method === "POST") {
//     const body = await buffer(req);
//     const sig = req.headers["stripe-signature"]!;
//     let event: Stripe.Event

//     try {
//       event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
//     } catch (err) {
//       // On error, log and return the error message
//       console.log(`❌ Error message: ${err}`);
//       res.status(400).send(`Webhook Error: ${err}`);
//       return;
//     }

//     // Successfully constructed event
//     console.log("✅ Success:", event.id);

//     // Cast event data to Stripe object
//     if (event.type === "payment_intent.succeeded") {
//       const stripeObject: Stripe.PaymentIntent = event.data
//         .object as Stripe.PaymentIntent;
//       console.log(`💰 PaymentIntent status: ${stripeObject.status}`);
//     } else if (event.type === "charge.succeeded") {
//       const charge = event.data.object as Stripe.Charge;
//       console.log(`💵 Charge id: ${charge.id}`);
//     } else {
//       console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
//     }

//     // switch (event.type) {
//     //   cccc
//       // case "customer.subscription.deleted":
//       //   await prisma.user.update({
//       //     // Find the customer in our database with the Stripe customer ID linked to this purchase
//       //     where: {
//       //       stripeCustomerId: subscription.customer as string,
//       //     },
//       //     // Update that customer so their status is now active
//       //     data: {
//       //       isActive: false,
//       //     },
//       //   });
//       //   break;
//     //   default:
//     //     console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
//     // }

//     // Return a response to acknowledge receipt of the event
//     res.json({ received: true });
//   } else {
//     res.setHeader("Allow", "POST");
//     res.status(405).end("Method Not Allowed");
//   }
// };

// // const buffer = (req: NextApiRequest) => {
// //   return new Promise<Buffer>((resolve, reject) => {
// //     const chunks: Buffer[] = [];

// //     req.on("data", (chunk: Buffer) => {
// //       chunks.push(chunk);
// //     });

// //     req.on("end", () => {
// //       resolve(Buffer.concat(chunks));
// //     });

// //     req.on("error", reject);
// //   });
// // };

// export default cors(handler as any);
// // export default handler;

import { NextApiRequest, NextApiResponse } from 'next'

import Cors from 'micro-cors'
import Stripe from 'stripe'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-11-15',
})

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
}

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      // On error, log and return the error message.
      if (err! instanceof Error) console.log(err)
      console.log(`❌ Error message: ${errorMessage}`)
      res.status(400).send(`Webhook Error: ${errorMessage}`)
      return
    }

    // Successfully constructed event.
    console.log('✅ Success:', event.id)

    // Cast event data to Stripe object.
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`💰 PaymentIntent status: ${paymentIntent.status}`)
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(
        `❌ Payment failed: ${paymentIntent.last_payment_error?.message}`
      )
    } else if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge
      console.log(`💵 Charge id: ${charge.id}`)
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event.
    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default cors(webhookHandler as any)