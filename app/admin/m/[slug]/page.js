import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMinisterBySlug, subscribersForMinister } from "../../../../lib/data";
import { addStopAction, addUpdateAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminMinisterPage({ params, searchParams }) {
  const isAdmin = cookies().get("gishah_admin")?.value === "1";
  if (!isAdmin) redirect("/admin");

  const minister = await getMinisterBySlug(params.slug);
  if (!minister) {
    return (
      <div className="shell">
        <Link href="/admin" className="wordmark">Gishah admin</Link>
        <div className="card" style={{ marginTop: 24 }}>Profile not found.</div>
      </div>
    );
  }

  const subscribers = await subscribersForMinister(minister.id);

  return (
    <div className="shell">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Link href="/admin" className="wordmark">Gishah admin</Link>
        <Link href={`/m/${minister.slug}`} className="badge" style={{ color: "var(--accent)" }}>
          View live profile &rarr;
        </Link>
      </div>
      <h1 style={{ fontSize: 24, marginTop: 20, marginBottom: 6 }}>{minister.name}</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>
        {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
      </p>

      {searchParams?.error === "geocode" && (
        <div className="card" style={{ marginBottom: 20, background: "oklch(94% 0.05 25)", color: "oklch(40% 0.15 25)" }}>
          Couldn&rsquo;t find that city — try a more specific city/state and try again.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 24 }}>
        <div>
          <div className="label" style={{ marginBottom: 12 }}>Add itinerary stop</div>
          <form action={addStopAction} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="ministerId" value={minister.id} />
            <input type="hidden" name="ministerSlug" value={minister.slug} />
            <FormField label="City & state" name="city" placeholder="Raleigh, NC" required />
            <FormField label="Venue" name="venue" placeholder="Living Word Conference" />
            <FormField label="Date" name="eventDate" type="date" required />
            <button type="submit" className="btn btn-primary">
              Add stop &amp; notify nearby subscribers
            </button>
          </form>

          <div className="label" style={{ margin: "28px 0 12px" }}>Upcoming stops</div>
          <div className="card" style={{ padding: 0 }}>
            {minister.itinerary.length === 0 && (
              <div style={{ padding: 20, color: "var(--muted)", fontSize: 14 }}>None yet.</div>
            )}
            {minister.itinerary.map((stop, i) => (
              <div key={stop.id} style={{ padding: "14px 18px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{stop.city}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{stop.venue} &middot; {stop.event_date}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="label" style={{ marginBottom: 12 }}>Post an update</div>
          <form action={addUpdateAction} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="ministerId" value={minister.id} />
            <input type="hidden" name="ministerSlug" value={minister.slug} />
            <FormField label="Title" name="title" placeholder="Fall itinerary is finalized" required />
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Body</label>
              <textarea name="body" rows={3} style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: 14.5, border: "1px solid var(--border)", borderRadius: 8, padding: 10 }} />
            </div>
            <button type="submit" className="btn btn-primary">Post update</button>
          </form>

          <div className="label" style={{ margin: "28px 0 12px" }}>Recent updates</div>
          <div className="card" style={{ padding: 0 }}>
            {minister.updates.length === 0 && (
              <div style={{ padding: 20, color: "var(--muted)", fontSize: 14 }}>None yet.</div>
            )}
            {minister.updates.map((u, i) => (
              <div key={u.id} style={{ padding: "14px 18px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, placeholder, required, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }} htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}
