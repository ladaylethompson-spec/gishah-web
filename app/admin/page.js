import { cookies } from "next/headers";
import Link from "next/link";
import { listMinisters } from "../../lib/data";
import { loginAction, logoutAction, createMinisterAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = cookies().get("gishah_admin")?.value === "1";

  if (!isAdmin) {
    return (
      <div className="shell" style={{ maxWidth: 400 }}>
        <div className="wordmark" style={{ marginBottom: 28 }}>Gishah admin</div>
        <form action={loginAction} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }} htmlFor="password">Admin password</label>
          <input id="password" name="password" type="password" required />
          <button type="submit" className="btn btn-primary">Log in</button>
        </form>
      </div>
    );
  }

  const ministers = await listMinisters();

  return (
    <div className="shell">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div className="wordmark">Gishah admin</div>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-secondary">Log out</button>
        </form>
      </div>

      <div className="label" style={{ marginBottom: 12 }}>Minister profiles</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {ministers.length === 0 && (
          <div className="card" style={{ color: "var(--muted)" }}>No profiles yet — create the first one below.</div>
        )}
        {ministers.map((m) => (
          <Link key={m.id} href={`/admin/m/${m.slug}`} className="card" style={{ display: "block", color: "var(--fg)" }}>
            <div style={{ fontWeight: 600 }}>{m.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{m.role} &middot; {m.location}</div>
          </Link>
        ))}
      </div>

      <div className="label" style={{ marginBottom: 12 }}>Add a minister profile</div>
      <form action={createMinisterAction} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Full name / title" name="name" required placeholder="Pastor Jordan Reyes" />
        <Field label="Role" name="role" placeholder="Traveling evangelist" />
        <Field label="Location" name="location" placeholder="Charlotte, NC" />
        <Field label="Initials (optional)" name="initials" placeholder="JR" />
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Bio</label>
          <textarea name="bio" rows={3} style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: 14.5, border: "1px solid var(--border)", borderRadius: 8, padding: 10 }} />
        </div>
        <button type="submit" className="btn btn-primary">Create profile</button>
      </form>
    </div>
  );
}

function Field({ label, name, placeholder, required }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }} htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} placeholder={placeholder} required={required} />
    </div>
  );
}
