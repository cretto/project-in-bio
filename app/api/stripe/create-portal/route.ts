import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const user = await db.collection("users").doc(userId).get();
  const customerId = user.data()?.customerId;

  if (!customerId) {
    return NextResponse.json(
      { error: "Customer ID not found for user" },
      { status: 400 }
    );
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get("origin")}/`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating Stripe portal session:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe portal session" },
      { status: 500 }
    );
  }
}
