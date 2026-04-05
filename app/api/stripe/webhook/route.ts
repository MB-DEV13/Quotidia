import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { premiumConfirmEmailHtml, subscriptionCancelledEmailHtml } from "@/lib/email-templates";
import Stripe from "stripe";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://myquotidia.app";

export const dynamic = "force-dynamic";

function getSubscriptionEndDate(subscription: Stripe.Subscription): Date {
  // Si annulation programmée, utiliser cancel_at
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  // Sinon : billing_cycle_anchor + 1 intervalle = prochaine échéance
  const item = subscription.items.data[0];
  const interval = item?.price?.recurring?.interval ?? "month";
  const intervalCount = item?.price?.recurring?.interval_count ?? 1;
  const anchor = new Date(subscription.billing_cycle_anchor * 1000);

  const next = new Date(anchor);
  if (interval === "year") next.setFullYear(next.getFullYear() + intervalCount);
  else if (interval === "week") next.setDate(next.getDate() + 7 * intervalCount);
  else next.setMonth(next.getMonth() + intervalCount);

  // Si la date calculée est déjà passée, ajouter un cycle supplémentaire
  if (next <= new Date()) {
    if (interval === "year") next.setFullYear(next.getFullYear() + intervalCount);
    else if (interval === "week") next.setDate(next.getDate() + 7 * intervalCount);
    else next.setMonth(next.getMonth() + intervalCount);
  }

  return next;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[WEBHOOK] STRIPE_WEBHOOK_SECRET manquant — webhook désactivé");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[WEBHOOK] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription") break;

        const userId = checkoutSession.metadata?.userId;
        if (!userId) break;

        const subscriptionId = checkoutSession.subscription as string | null;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = getSubscriptionEndDate(subscription);

        const updatedUser = await db.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price?.id ?? null,
            stripeCurrentPeriodEnd: periodEnd,
          },
          select: { email: true, name: true },
        });

        // Email de confirmation Premium
        const isYearly = subscription.items.data[0]?.price?.recurring?.interval === "year";
        getResend().emails.send({
          from: FROM_EMAIL,
          to: updatedUser.email,
          subject: "✨ Tu es Premium — merci !",
          html: premiumConfirmEmailHtml(updatedUser.name, periodEnd, APP_URL),
        }).catch((err) => console.error("[WEBHOOK_PREMIUM_EMAIL]", err));

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // Stripe v20: subscription info is in parent
        const parent = invoice.parent;
        let subscriptionId: string | null = null;

        if (parent?.type === "subscription_details" && parent.subscription_details?.subscription) {
          subscriptionId =
            typeof parent.subscription_details.subscription === "string"
              ? parent.subscription_details.subscription
              : parent.subscription_details.subscription.id;
        }

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        ) as Stripe.Customer;

        if (customer.deleted) break;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customer.id },
        });

        if (!user) break;

        const periodEnd = getSubscriptionEndDate(subscription);

        await db.user.update({
          where: { id: user.id },
          data: {
            isPremium: true,
            stripeCurrentPeriodEnd: periodEnd,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const periodEnd = getSubscriptionEndDate(subscription);
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        ) as Stripe.Customer;

        if (customer.deleted) break;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customer.id },
          select: { id: true, email: true, name: true },
        });

        if (!user) break;

        await db.user.update({
          where: { id: user.id },
          data: {
            isPremium: false,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        // Email d'annulation
        getResend().emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Ton abonnement Premium se termine",
          html: subscriptionCancelledEmailHtml(user.name, periodEnd, APP_URL),
        }).catch((err) => console.error("[WEBHOOK_CANCEL_EMAIL]", err));

        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[WEBHOOK] Erreur traitement:", error);
    return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
