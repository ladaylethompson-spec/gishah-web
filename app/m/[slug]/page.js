import Link from "next/link";
import { getMinisterBySlug } from "../../../lib/data";
import SubscribeForm from "./SubscribeForm";

export const dynamic = "force-dynamic";

export default async function MinisterProfile({ params }) {
  let minister = null;
  let loadError = null;

  try {
    minister = await getMinisterBySlug(params.slug);
  } catch (err) {
    loadError = err.message;
  }

  if (loadError) {
    return (
      <div className="shell">
        <Link href="/" className="wordmark">Gishah</Link>
        <div className="card" style={{ marginTop: 24, color: "var(--muted)" }}>
          Couldn&rsquo;t load this profile right now ({loadError}).
        </div>
      </div>
    );
  }

  if (!minister) {
    return (
      <div className="shell">
        <Link href="/" className="wordmark">Gishah</Link>
        <div className="card" style={{ marginTop: 24 }}>Profile not found.</div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <Link href="/" className="wordmark">Gishah</Link>
        <span className="badge">Beta</span>
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 28 }}>
        <div
          style={{
            width: 68, height: 68, borderRadius: "50%", background: "var(--accent)",
            color: "var(--accent-contrast)", display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 22, flexShrink: 0,
          }}
        >
          {minister.initials}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>{minister.name}</h1>
          <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 3 }}>
            {minister.role} &middot; {minister.location}
          </div>
          {minister.bio && (
            <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, maxWidth: 480 }}>{minister.bio}</p>
          )}
        </div>
      </div>

      <SubscribeForm ministerId={minister.id} ministerSlug={minister.slug} />

      <div style={{ marginTop: 36 }}>
        <div className="label" style={{ marginBottom: 12 }}>Itinerary</div>
        {minister.itinerary.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", fontSize: 14 }}>No upcoming stops yet.</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {minister.itinerary.map((stop, i) => (
              <div
                key={stop.id}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                    {new Date(stop.event_date + "T00:00:00").getDate()}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase" }}>
                    {new Date(stop.event_date + "T00:00:00").toLocaleString("en-US", { month: "short" })}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{stop.city}</div>
                  {stop.venue && <div style={{ fontSize: 13, color: "var(--muted)" }}>{stop.venue}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 36 }}>
        <div className="label" style={{ marginBottom: 12 }}>Updates &amp; newsletters</div>
        {minister.updates.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", fontSize: 14 }}>No updates posted yet.</div>
        ) : (
          minister.updates.map((u) => (
            <div key={u.id} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{u.title}</div>
              {u.body && <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>{u.body}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
