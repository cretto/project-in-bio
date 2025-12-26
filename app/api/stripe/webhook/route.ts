import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";
import { NextResponse, type NextRequest } from "next/server";
import type { Stripe } from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    const secret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!signature || !secret) {
      throw new Error("Missing signature or secret");
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "checkout.session.completed":
        if (event.data.object.payment_status === "paid") {
          const userId = event.data.object.client_reference_id;
          if (userId) {
            await db.collection("users").doc(userId).update({
              isSubscribed: true,
            });
          }
        }

        // Verificar se foi boleto
        if (
          event.data.object.payment_status === "unpaid" &&
          event.data.object.payment_intent
        ) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            event.data.object.payment_intent.toString()
          );
          const hostedVoucherUrl =
            paymentIntent.next_action?.boleto_display_details
              ?.hosted_voucher_url;

          if (hostedVoucherUrl) {
            const userEmail = event.data.object.customer_details?.email;
            console.log(
              "Enviar email para:",
              userEmail,
              "com o boleto:",
              hostedVoucherUrl
            );
          }
        }

        break;
      case "checkout.session.async_payment_succeeded":
        if (event.data.object.payment_status === "paid") {
          const userId = event.data.object.client_reference_id;
          if (userId) {
            await db.collection("users").doc(userId).update({
              isSubscribed: true,
            });
          }
        }

        break;
      case "customer.subscription.deleted":
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        if (customerId) {
          const customer = (await stripe.customers.retrieve(
            customerId
          )) as Stripe.Customer;

          if (customer && customer.metadata.userId) {
            const { userId } = customer.metadata;
            await db.collection("users").doc(userId).update({
              isSubscribed: false,
            });
          }
        }

        break;
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return new NextResponse("Webhook Error", { status: 500 });
  }
}
