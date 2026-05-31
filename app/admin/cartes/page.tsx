'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MiniCardPreview from '@/app/dashboard/MiniCardPreview';

type CarteProfile = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  company: string | null;
  plan: string | null;
  active: boolean;
  created_at: string;
  extra_chat_messages: number;
};

const PLANS = ['starter', 'pro', 'business', 'business_team'];
const MONTHLY_LIMITS: Record<string, number> = { pro: 200, business: 500, business_team: 500 };

function billingCycleStart(createdAt: string): Date {
  const anchorDay = new Date(createdAt).getDate();
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const anniversary = new Date(year, month, Math.min(anchorDay, daysInCurrentMonth));
  anniversary.setHours(0, 0, 0, 0);
  if (anniversary > now) {
    month -= 1;
    if (month < 0) { month = 11; year -= 1; }
    const daysInPrevMonth = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(anchorDay, daysInPrevMonth));
  }
  return anniversary;
}
const PLAN_COLORS: Record<string, string> = {
  starter: 'rgba(108,99,255,0.15)', pro: 'rgba(62,207,207,0.15)', business: 'rgba(212,168,67,0.15)', business_team: 'rgba(34,197,94,0.15)',
};
const PLAN_TEXT: Record<string, string> = {
  starter: 'var(--primary)', pro: 'var(--secondary)', business: 'var(--gold)', business_team: '#22C55E',
};

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

const EMPTY_FORM = { name: '', slug: '', email: '', password: '', title: '', company: '', plan: 'starter' };
const EMPTY_THEME = { bg_color: '#0D0D1A', primary_color: '#00CFFF', secondary_color: '#D4A843', text_color: '#FFFFFF', font_heading: 'Inter' };
const FONTS = ['Inter','Poppins','Montserrat','Playfair Display SC','Playfair Display','Cormorant Garamond','Raleway','Lato','Roboto','Lora','EB Garamond','Belleza'];

export default function CartesPage() {
  const [cartes, setCartes]     = useState<CarteProfile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [created, setCreated]   = useState<string | null>(null);
  const [addingMsgs, setAddingMsgs] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [themeModal, setThemeModal] = useState<{ id: string; slug: string } | null>(null);
  const [theme, setTheme]       = useState(EMPTY_THEME);
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => { fetchCartes(); }, []);

  async function fetchCartes() {
    setLoading(true);
    const { data } = await supabase
      .from('carte_profiles')
      .select('id, slug, name, title, company, plan, active, created_at, extra_chat_messages')
      .order('created_at', { ascending: false });
    const profiles = data || [];
    setCartes(profiles);

    if (profiles.length > 0) {
      // Fetch all logs since the earliest billing cycle start among all profiles
      const earliestCycle = profiles.reduce((min: Date, p: CarteProfile) => {
        const d = billingCycleStart(p.created_at);
        return d < min ? d : min;
      }, billingCycleStart(profiles[0].created_at));

      const ids = profiles.map((p: CarteProfile) => p.id);
      const { data: logs } = await supabase
        .from('carte_chat_logs')
        .select('profile_id, created_at')
        .in('profile_id', ids)
        .gte('created_at', earliestCycle.toISOString());

      const counts: Record<string, number> = {};
      (logs || []).forEach((log: { profile_id: string; created_at: string }) => {
        const profile = profiles.find((p: CarteProfile) => p.id === log.profile_id);
        if (!profile) return;
        const cycleStart = billingCycleStart(profile.created_at);
        if (new Date(log.created_at) >= cycleStart) {
          counts[log.profile_id] = (counts[log.profile_id] ?? 0) + 1;
        }
      });
      setUsageCounts(counts);
    }

    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('carte_profiles').update({ active: !current }).eq('id', id);
    setCartes(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
  }

  async function changePlan(id: string, newPlan: string) {
    await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: id, new_plan: newPlan }),
    });
    setCartes(prev => prev.map(c => c.id === id ? { ...c, plan: newPlan } : c));
    await fetch('/api/admin/notify-plan-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: id, new_plan: newPlan }),
    });
  }

  async function renewClient(id: string) {
    if (!confirm('Confirmer le renouvellement ? Les messages supplémentaires seront remis à 0.')) return;
    setRenewingId(id);
    await supabase.from('carte_profiles').update({ extra_chat_messages: 0 }).eq('id', id);
    setCartes(prev => prev.map(c => c.id === id ? { ...c, extra_chat_messages: 0 } : c));
    setUsageCounts(prev => ({ ...prev, [id]: 0 }));
    setRenewingId(null);
  }

  async function addExtraMessages(id: string, current: number) {
    setAddingMsgs(id);
    const newTotal = current + 200;
    await supabase.from('carte_profiles').update({ extra_chat_messages: newTotal }).eq('id', id);
    setCartes(prev => prev.map(c => c.id === id ? { ...c, extra_chat_messages: newTotal } : c));
    setAddingMsgs(null);
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name: name, slug: slugify(name) }));
  }

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    if (!form.name || !form.slug || !form.email || !form.password) {
      setError('Tous les champs obligatoires (*) doivent être remplis.');
      setSaving(false); return;
    }

    const { error: err } = await supabase.from('carte_profiles').insert({
      slug:            form.slug,
      name:            form.name,
      email:           form.email || null,
      title:           form.title || null,
      company:         form.company || null,
      plan:            form.plan,
      active:          true,
      bg_color:        theme.bg_color,
      primary_color:   theme.primary_color,
      secondary_color: theme.secondary_color,
      text_color:      theme.text_color,
      font_heading:    theme.font_heading,
    });

    if (err) {
      setError(err.message.includes('unique') ? 'Ce slug est déjà utilisé.' : err.message);
      setSaving(false);
      return;
    }

    // Créer le compte Supabase Auth + lier au profil
    const authRes = await fetch('/api/create-carte-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, slug: form.slug }),
    });
    if (!authRes.ok) {
      const authErr = await authRes.json();
      // Rollback : supprimer le profil créé sans compte Auth
      await supabase.from('carte_profiles').delete().eq('slug', form.slug);
      setError(authErr.error || 'Erreur création du compte.');
      setSaving(false); return;
    }

    // Envoyer l'email de bienvenue avec identifiants
    await fetch('/api/admin-agent?path=admin/send-carte-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: form.name,
        clientEmail: form.email,
        clientPassword: form.password,
        slug: form.slug,
      }),
    });

    setCreated(`https://digitalsucces.tech/c/${form.slug}`);
    setForm(EMPTY_FORM);
    fetchCartes();
    setSaving(false);
  }

  function closeModal() { setShowModal(false); setError(null); setCreated(null); setForm(EMPTY_FORM); }

  async function saveTheme() {
    if (!themeModal) return;
    setSavingTheme(true);
    await supabase.from('carte_profiles').update({
      bg_color: theme.bg_color,
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      text_color: theme.text_color,
      font_heading: theme.font_heading,
    }).eq('id', themeModal.id);
    setSavingTheme(false);
    setThemeModal(null);
  }

  const actives  = cartes.filter(c => c.active).length;
  const inactives = cartes.length - actives;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Cartes NFC</h1>
          <p className="admin-subtitle">{actives} active{actives > 1 ? 's' : ''} · {inactives} inactive{inactives > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={fetchCartes} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.82rem' }}>+ Nouveau client</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : cartes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucune carte créée.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="lead-table">
            <thead>
              <tr><th>Nom</th><th>Poste / Entreprise</th><th>Slug</th><th>Plan</th><th>Utilisation ce mois</th><th>Créée le</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {cartes.map(carte => {
                const plan = (carte.plan || 'starter').toLowerCase();
                return (
                  <tr key={carte.id}>
                    <td style={{ fontWeight: 600 }}>{carte.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {carte.title || '—'}{carte.company ? ` · ${carte.company}` : ''}
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--secondary)' }}>{carte.slug}</span></td>
                    <td>
                      <select
                        value={plan}
                        onChange={e => changePlan(carte.id, e.target.value)}
                        style={{
                          background: PLAN_COLORS[plan] || 'var(--card-bg)',
                          color: PLAN_TEXT[plan] || 'var(--text-muted)',
                          border: '1px solid var(--card-border)',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p === 'business_team' ? 'Business Équipe' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </td>
                    <td>
                      {['pro','business','business_team'].includes(plan) ? (() => {
                        const limit = (MONTHLY_LIMITS[plan] ?? 0) + (carte.extra_chat_messages ?? 0);
                        const used = usageCounts[carte.id] ?? 0;
                        const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
                        const barColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#22C55E';
                        return (
                          <div style={{ minWidth: 130 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{used} / {limit} msgs</span>
                              <span style={{ color: barColor, fontWeight: 700 }}>{pct}%</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                            </div>
                          </div>
                        );
                      })() : <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(carte.created_at).toLocaleDateString('fr-FR')}</td>
                    <td><span className={`status-badge ${carte.active ? 'status-converted' : 'status-lost'}`}>{carte.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <a href={`https://digitalsucces.tech/c/${carte.slug}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Voir ↗</a>
                        <button onClick={() => toggleActive(carte.id, carte.active)}
                          style={{ fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: carte.active ? 'var(--accent)' : 'var(--secondary)', padding: 0 }}>
                          {carte.active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={() => { setThemeModal({ id: carte.id, slug: carte.slug }); setTheme(EMPTY_THEME); }}
                          style={{ fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0 }}>
                          🎨 Thème
                        </button>
                        {['pro','business','business_team'].includes(plan) && (
                          <>
                            <button
                              onClick={() => addExtraMessages(carte.id, carte.extra_chat_messages ?? 0)}
                              disabled={addingMsgs === carte.id}
                              title={`Messages supplémentaires : ${carte.extra_chat_messages ?? 0}`}
                              style={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: 'rgba(0,207,255,0.1)', border: '1px solid rgba(0,207,255,0.3)', color: '#00CFFF', borderRadius: 6, padding: '3px 8px' }}
                            >
                              {addingMsgs === carte.id ? '...' : `+200 msgs (${carte.extra_chat_messages ?? 0})`}
                            </button>
                            <button
                              onClick={() => renewClient(carte.id)}
                              disabled={renewingId === carte.id}
                              title="Renouveler l'abonnement — remet les extras à 0"
                              style={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', borderRadius: 6, padding: '3px 8px' }}
                            >
                              {renewingId === carte.id ? '...' : '↺ Renouveler'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CRÉATION */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: created ? 480 : 860 }}>
            {created ? (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: '#22C55E' }}>Carte créée ✓</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                  Un email de bienvenue a été envoyé au client avec son lien dashboard et les instructions.
                </p>
                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '14px 16px', marginBottom: 16, fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Page publique :</div>
                  <a href={created ?? ''} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{created}</a>
                </div>
                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Dashboard client :</div>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>digitalsucces.tech/dashboard</span>
                </div>
                <button className="btn btn-primary" onClick={closeModal} style={{ width: '100%' }}>Fermer</button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 24 }}>Nouveau client — Carte NFC</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

                  {/* ── Colonne gauche : formulaire ── */}
                  <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Nom complet *</label>
                      <input style={inputStyle} placeholder="Jean Dupont" value={form.name}
                        onChange={e => handleNameChange(e.target.value)} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Email *</label>
                        <input style={inputStyle} type="email" placeholder="client@email.com" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                      </div>
                      <div>
                        <label style={labelStyle}>Mot de passe temp. *</label>
                        <input style={inputStyle} type="text" placeholder="Client2026!" value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Slug (URL de la carte) *</label>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden' }}>
                        <span style={{ padding: '10px 12px', fontSize: '0.78rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>…/c/</span>
                        <input style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }}
                          placeholder="jean-dupont" value={form.slug}
                          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Poste</label>
                        <input style={inputStyle} placeholder="CEO" value={form.title}
                          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Entreprise</label>
                        <input style={inputStyle} placeholder="Acme Corp" value={form.company}
                          onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Plan</label>
                      <select style={inputStyle} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                        {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </div>

                    {/* ── Thème ── */}
                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>🎨 Thème de la carte</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {([
                          { key: 'bg_color' as const,        label: 'Fond' },
                          { key: 'primary_color' as const,   label: 'Couleur principale' },
                          { key: 'secondary_color' as const, label: 'Couleur secondaire' },
                          { key: 'text_color' as const,      label: 'Texte' },
                        ]).map(({ key, label }) => (
                          <div key={key}>
                            <label style={labelStyle}>{label}</label>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="color" value={theme[key]} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))}
                                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--card-border)', cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
                              <input style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', padding: '8px 10px' }}
                                value={theme[key]} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <label style={labelStyle}>Police</label>
                        <select style={inputStyle} value={theme.font_heading} onChange={e => setTheme(t => ({ ...t, font_heading: e.target.value }))}>
                          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>

                    {error && <p style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button type="button" className="btn btn-outline" onClick={closeModal} style={{ flex: 1 }}>Annuler</button>
                      <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                        {saving ? 'Création...' : 'Créer la carte'}
                      </button>
                    </div>
                  </form>

                  {/* ── Colonne droite : aperçu ── */}
                  <div style={{ position: 'sticky', top: 24 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, textAlign: 'center' }}>
                      Aperçu temps réel
                    </div>
                    <MiniCardPreview
                      form={{ name: form.name, title: form.title, company: form.company, phone: '', email: form.email, website: '', location: '' }}
                      profile={{ photo_url: '', cover_url: '', cover_video_url: '', slug: form.slug }}
                      theme={theme}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Thème ── */}
      {themeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
            <h3 style={{ color: 'var(--text)', marginBottom: 20, fontSize: '1rem' }}>🎨 Thème — {themeModal.slug}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {([
                { key: 'bg_color', label: 'Fond (Background)' },
                { key: 'primary_color', label: 'Couleur principale' },
                { key: 'secondary_color', label: 'Couleur secondaire' },
                { key: 'text_color', label: 'Texte' },
              ] as { key: keyof typeof theme; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={theme[key]} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))}
                      style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--card-border)', cursor: 'pointer', padding: 2, background: 'none' }} />
                    <input style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}
                      value={theme[key]} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))} placeholder="#000000" />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Police (Google Font)</label>
              <select style={inputStyle} value={theme.font_heading} onChange={e => setTheme(t => ({ ...t, font_heading: e.target.value }))}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ background: 'var(--dark-3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Aperçu : <span style={{ color: theme.primary_color, fontWeight: 700 }}>Couleur principale</span> &nbsp;|&nbsp;
              <span style={{ color: theme.secondary_color, fontWeight: 700 }}>Secondaire</span> &nbsp;|&nbsp;
              <span style={{ background: theme.bg_color, color: theme.text_color, padding: '2px 8px', borderRadius: 4 }}>Texte sur fond</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setThemeModal(null)} style={{ flex: 1 }}>Annuler</button>
              <button className="btn btn-primary" onClick={saveTheme} disabled={savingTheme} style={{ flex: 1 }}>
                {savingTheme ? 'Sauvegarde...' : 'Appliquer le thème'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' };
