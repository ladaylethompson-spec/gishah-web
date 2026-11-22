import { supabaseAdmin } from "./supabase";

export async function listMinisters() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("ministers")
    .select("id, slug, name, role, location, initials")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMinisterBySlug(slug) {
  const db = supabaseAdmin();
  const { data: minister, error } = await db
    .from("ministers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!minister) return null;

  const { data: itinerary, error: itinErr } = await db
    .from("itinerary_stops")
    .select("*")
    .eq("minister_id", minister.id)
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true });

  if (itinErr) throw itinErr;

  const { data: updates, error: updatesErr } = await db
    .from("updates")
    .select("*")
    .eq("minister_id", minister.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (updatesErr) throw updatesErr;

  return { ...minister, itinerary: itinerary || [], updates: updates || [] };
}

export async function createMinister({ slug, name, role, location, bio, initials }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("ministers")
    .insert({ slug, name, role, location, bio, initials })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addItineraryStop({ ministerId, city, venue, eventDate, lat, lon }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("itinerary_stops")
    .insert({ minister_id: ministerId, city, venue, event_date: eventDate, lat, lon })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addUpdate({ ministerId, title, body }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("updates")
    .insert({ minister_id: ministerId, title, body })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addSubscriber({ ministerId, email, radiusMiles, lat, lon, locationLabel }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("subscribers")
    .upsert(
      {
        minister_id: ministerId,
        email,
        radius_miles: radiusMiles,
        lat,
        lon,
        location_label: locationLabel,
      },
      { onConflict: "minister_id,email" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function subscribersForMinister(ministerId) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("subscribers")
    .select("*")
    .eq("minister_id", ministerId)
    .eq("unsubscribed", false);

  if (error) throw error;
  return data || [];
}

export async function unsubscribeByToken(token) {
  const db = supabaseAdmin();
  const { error } = await db
    .from("subscribers")
    .update({ unsubscribed: true })
    .eq("unsub_token", token);

  if (error) throw error;
}
