"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createMinister,
  addItineraryStop,
  addUpdate,
  subscribersForMinister,
} from "../../lib/data";
import { geocodeLocation } from "../../lib/geocode";
import { haversineMiles } from "../../lib/distance";
import { sendEmail, notificationEmailHtml } from "../../lib/email";
import { supabaseAdmin } from "../../lib/supabase";

function requireAdmin() {
  const isAdmin = cookies().get("gishah_admin")?.value === "1";
  if (!isAdmin) redirect("/admin");
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function loginAction(formData) {
  const password = formData.get("password");
  if (password && password === process.env.ADMIN_PASSWORD) {
    cookies().set("gishah_admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  redirect("/admin");
}

export async function logoutAction() {
  cookies().delete("gishah_admin");
  redirect("/admin");
}

export async function createMinisterAction(formData) {
  requireAdmin();

  const name = formData.get("name");
  const role = formData.get("role");
  const location = formData.get("location");
  const bio = formData.get("bio");
  const initials =
    formData.get("initials") ||
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const slug = slugify(name);
  const minister = await createMinister({ slug, name, role, location, bio, initials });
  redirect(`/admin/m/${minister.slug}`);
}

export async function addStopAction(formData) {
  requireAdmin();

  const ministerId = formData.get("ministerId");
  const ministerSlug = formData.get("ministerSlug");
  const city = formData.get("city");
  const venue = formData.get("venue");
  const eventDate = formData.get("eventDate");

  const geocoded = await geocodeLocation(city);
  if (!geocoded) {
    redirect(`/admin/m/${ministerSlug}?error=geocode`);
  }

  await addItineraryStop({
    ministerId,
    city,
    venue,
    eventDate,
    lat: geocoded.lat,
    lon: geocoded.lon,
  });

  // Notify every subscriber whose radius covers this new stop.
  const subs = await subscribersForMinister(ministerId);
  const db = supabaseAdmin();
  const { data: minister } = await db
    .from("ministers")
    .select("name")
    .eq("id", ministerId)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  for (const sub of subs) {
    if (sub.lat == null || sub.lon == null) continue;
    const dist = haversineMiles(sub.lat, sub.lon, geocoded.lat, geocoded.lon);
    if (dist <= sub.radius_miles) {
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${sub.unsub_token}`;
      try {
        await sendEmail({
          to: sub.email,
          subject: `${minister?.name || "A minister you follow"} is coming near you`,
          html: notificationEmailHtml({
            ministerName: minister?.name || "",
            city,
            venue,
            eventDate,
            distanceMiles: dist,
            unsubscribeUrl,
          }),
        });
      } catch (e) {
        console.error("Notification email failed for", sub.email, e.message);
      }
    }
  }

  redirect(`/admin/m/${ministerSlug}`);
}

export async function addUpdateAction(formData) {
  requireAdmin();

  const ministerId = formData.get("ministerId");
  const ministerSlug = formData.get("ministerSlug");
  const title = formData.get("title");
  const body = formData.get("body");

  await addUpdate({ ministerId, title, body });
  redirect(`/admin/m/${ministerSlug}`);
}
