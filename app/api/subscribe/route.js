import { NextResponse } from "next/server";
import { geocodeLocation } from "../../../lib/geocode";
import { addSubscriber } from "../../../lib/data";
import { sendEmail, confirmationEmailHtml } from "../../../lib/email";
import { supabaseAdmin } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const { ministerId, email, location, radiusMiles } = await req.json();

    if (!ministerId || !email || !location || !radiusMiles) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const geocoded = await geocodeLocation(location);
    if (!geocoded) {
      return NextResponse.json(
        { error: "Couldn't find that location. Try a nearby city and state instead." },
        { status: 400 }
      );
    }

    const subscriber = await addSubscriber({
      ministerId,
      email,
      radiusMiles: Number(radiusMiles),
      lat: geocoded.lat,
      lon: geocoded.lon,
      locationLabel: location,
    });

    const db = supabaseAdmin();
    const { data: minister } = await db
      .from("ministers")
      .select("name")
      .eq("id", ministerId)
      .single();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${subscriber.unsub_token}`;

    try {
      await sendEmail({
        to: email,
        subject: `You're subscribed to ${minister?.name || "this ministry"}`,
        html: confirmationEmailHtml({
          ministerName: minister?.name || "this ministry",
          radiusMiles,
          unsubscribeUrl,
        }),
      });
    } catch (emailErr) {
      // The subscription itself succeeded even if the confirmation email
      // failed to send (e.g. email provider not configured yet) — don't
      // fail the whole request over that.
      console.error("Confirmation email failed:", emailErr.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
