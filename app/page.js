import Link from "next/link";
import { listMinisters } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let ministers = [];
  let loadError = null;

  try {
    ministers = await listMinisters();
  } catch (err) {
    loadError = err.message;
  }

  return (
    <div className="shell">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
        <div className="wordmark">Gishah</div>
        <span className="badge">Beta</span>
      </div>

      <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.015em", marginBottom: 10 }}>
        A home for your ministry online
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 520, marginBottom: 32 }}>
        Browse ministers below. Subscribe to one and set a notification radius to hear about
        newsletters and itinerary stops near you.
      </p>

      {loadError && (
        <div className="card" style={{ marginBottom: 24, color: "var(--muted)" }}>
          Couldn&rsquo;t load ministers right now ({loadError}). If you just set this up, make sure
          the database schema has been run and the environment variables are set.
        </div>
      )}

      {!loadError && ministers.length === 0 && (
        <div className="card" style={{ color: "var(--muted)" }}>
          No minister profiles yet.{" "}
          <Link href="/admin">Set up the first one from the admin page.</Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ministers.map((m) => (
          <Link
            key={m.id}
            href={`/m/${m.slug}`}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--fg)" }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "var(--accent-contrast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {m.initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15.5 }}>{m.name}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {m.role} &middot; {m.location}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
