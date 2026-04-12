"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ProfilePage() {
  const [facility, setFacility] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadFacility() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: link } = await supabase
        .from("facility_users")
        .select("facility_id")
        .eq("user_id", user.id)
        .single();

      if (!link) { setLoading(false); return; }

      const { data: f } = await supabase
        .from("facilities")
        .select("*")
        .eq("id", link.facility_id)
        .single();

      if (f) {
        setFacility(f);
        setDescription((f.description as string) || "");
        setPhone((f.phone as string) || "");
        setWebsite((f.website as string) || "");
        setEmail((f.email as string) || "");
      }
      setLoading(false);
    }
    loadFacility();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!facility) return;

    setSaving(true);
    setSaved(false);

    await supabase
      .from("facilities")
      .update({ description, phone, website, email })
      .eq("id", facility.id as string);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return <p className="text-cs-muted">Loading profile...</p>;
  }

  if (!facility) {
    return (
      <div>
        <h1 className="font-display text-2xl text-cs-blue-dark">Profile</h1>
        <p className="mt-2 text-cs-muted">
          No facility linked to your account yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-cs-blue-dark">
          Edit Profile
        </h1>
        <p className="mt-1 text-sm text-cs-muted">
          Update your facility&apos;s public listing information.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-5">
        <div className="rounded-card border border-cs-border bg-white p-5">
          <h2 className="mb-4 font-semibold text-cs-blue-dark">
            Facility name
          </h2>
          <p className="text-sm text-cs-body">
            {facility.name as string}
          </p>
          <p className="mt-1 text-xs text-cs-muted">
            Contact hello@comfyseniors.com to change your facility name.
          </p>
        </div>

        <div className="rounded-card border border-cs-border bg-white p-5">
          <h2 className="mb-4 font-semibold text-cs-blue-dark">
            Contact information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-cs-muted">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-btn border border-cs-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cs-blue/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cs-muted">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-btn border border-cs-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cs-blue/10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cs-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-btn border border-cs-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cs-blue/10"
              />
            </div>
          </div>
        </div>

        <div className="rounded-card border border-cs-border bg-white p-5">
          <h2 className="mb-4 font-semibold text-cs-blue-dark">Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-btn border border-cs-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cs-blue/10"
            placeholder="Describe your facility, services, and what makes you unique..."
          />
          <p className="mt-1 text-xs text-cs-muted">
            This appears on your public listing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-btn bg-cs-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved && (
            <span className="text-sm font-medium text-cs-green-ok">
              Changes saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
