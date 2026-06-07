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
  user_id: string | null;
  team_owner_id: string | null;
  bg_color: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  text_color: string | null;
  font_heading: string | null;
  logo_url: string | null;
  logo_position: string | null;
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
const EMPTY_THEME = { bg_color: '#0D0D1A', primary_color: '#00CFFF', secondary_color: '#D4A843', text_color: '#FFFFFF', font_heading: 'Inter', logo_url: '', logo_position: 'center' };
const FONTS = ['Inter','Poppins','Montserrat','Playfair Display SC','Playfair Display','Cormorant Garamond','Raleway','Lato','Roboto','Lora','EB Garamond','Belleza'];

export default function CartesPage() {
  const [allProfiles, setAllProfiles] = useState<CarteProfile[]>([]);
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CarteProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [membersDrawer, setMembersDrawer] = useState<CarteProfile | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<{ id: string; top: number; right: number } | null>(null);

  // Comptes mères uniquement dans le tableau
  const cartes = allProfiles.filter(p => !p.team_owner_id);
  // Membres du drawer
  const drawerMembers = membersDrawer
    ? allProfiles.filter(p => p.team_owner_id === membersDrawer.user_id)
    : [];

  useEffect(() => { fetchCartes(); }, []);
  useEffect(() => {
    if (!openActionMenu) return;
    const close = () => setOpenActionMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openActionMenu]);

  async function fetchCartes() {
    setLoading(true);
    const { data } = await supabase
      .from('carte_profiles')
      .select('id, slug, name, title, company, plan, active, created_at, extra_chat_messages, user_id, team_owner_id, bg_color, primary_color, secondary_color, text_color, font_heading, logo_url, logo_position')
      .order('created_at', { ascending: false });
    const profiles = data || [];
    setAllProfiles(profiles);

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
    setAllProfiles(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
  }

  async function changePlan(id: string, newPlan: string) {
    await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: id, new_plan: newPlan }),
    });
    setAllProfiles(prev => prev.map(c => c.id === id ? { ...c, plan: newPlan } : c));
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
    setAllProfiles(prev => prev.map(c => c.id === id ? { ...c, extra_chat_messages: 0 } : c));
    setUsageCounts(prev => ({ ...prev, [id]: 0 }));
    setRenewingId(null);
  }

  async function addExtraMessages(id: string, current: number) {
    setAddingMsgs(id);
    const newTotal = current + 200;
    await supabase.from('carte_profiles').update({ extra_chat_messages: newTotal }).eq('id', id);
    setAllProfiles(prev => prev.map(c => c.id === id ? { ...c, extra_chat_messages: newTotal } : c));
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

    // Insert via API route (service role — bypass RLS)
    const createRes = await fetch('/api/admin/create-carte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug:            form.slug,
        name:            form.name,
        email:           form.email,
        title:           form.title,
        company:         form.company,
        plan:            form.plan,
        bg_color:        theme.bg_color,
        primary_color:   theme.primary_color,
        secondary_color: theme.secondary_color,
        text_color:      theme.text_color,
        font_heading:    theme.font_heading,
        logo_url:        theme.logo_url || null,
        logo_position:   theme.logo_position,
      }),
    });

    if (!createRes.ok) {
      const createErr = await createRes.json();
      setError(createErr.error || 'Erreur création du profil.');
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

  async function deleteClient() {
    if (!deleteConfirm) return;
    const targetId   = deleteConfirm.id;
    const targetName = deleteConfirm.name;
    console.log('[delete] Lancement suppression:', targetName, targetId);
    setDeleting(true);
    let res: Response;
    try {
      res = await fetch('/api/admin/delete-carte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: targetId,
          slug:       deleteConfirm.slug,
          user_id:    deleteConfirm.user_id,
        }),
      });
    } catch (e) {
      setDeleting(false);
      alert('Erreur réseau : ' + e);
      return;
    }
    setDeleting(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert('Erreur suppression (' + res.status + ') : ' + (data.error || 'inconnu'));
      return;
    }
    if (data.stillExists) {
      alert('⚠️ ' + targetName + ' n\'a pas été supprimé (Supabase). Vérifiez les RLS policies.');
      return;
    }
    setDeleteConfirm(null);
    fetchCartes();
  }

  async function uploadLogo(file: File) {
    if (!themeModal) return;
    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const path = `${themeModal.slug}/logo.${ext}`;
    const { data, error } = await supabase.storage.from('carte-images').upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('carte-images').getPublicUrl(path);
      setTheme(t => ({ ...t, logo_url: publicUrl }));
    }
    setUploadingLogo(false);
  }

  async function saveTheme() {
    if (!themeModal) return;
    setSavingTheme(true);
    const res = await fetch('/api/admin/update-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id:      themeModal.id,
        bg_color:        theme.bg_color,
        primary_color:   theme.primary_color,
        secondary_color: theme.secondary_color,
        text_color:      theme.text_color,
        font_heading:    theme.font_heading,
        logo_url:        theme.logo_url || null,
        logo_position:   theme.logo_position,
      }),
    });
    setSavingTheme(false);
    if (res.ok) setThemeModal(null);
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
              <tr><th>Nom</th><th>Poste / Entreprise</th><th>Slug</th><th>Plan</th><th>Utilisation ce mois</th><th>Membres</th><th>Créée le</th><th>Statut</th><th>Actions</th></tr>
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
                    <td>
                      {(() => {
                        const count = allProfiles.filter(p => p.team_owner_id === carte.user_id).length;
                        return count > 0 ? (
                          <button onClick={() => setMembersDrawer(carte)} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            {count} membre{count > 1 ? 's' : ''}
                          </button>
                        ) : <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>—</span>;
                      })()}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(carte.created_at).toLocaleDateString('fr-FR')}</td>
                    <td><span className={`status-badge ${carte.active ? 'status-converted' : 'status-lost'}`}>{carte.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={e => { e.stopPropagation(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setOpenActionMenu(prev => prev?.id === carte.id ? null : { id: carte.id, top: r.bottom + 4, right: window.innerWidth - r.right }); }}
                          style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', letterSpacing: 1 }}
                          title="Actions"
                        >⋮</button>
                        {openActionMenu?.id === carte.id && (
                          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: openActionMenu.top, right: openActionMenu.right, background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '6px 0', minWidth: 180, zIndex: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}>
                            <a href={`https://digitalsucces.tech/c/${carte.slug}`} target="_blank" rel="noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                              <span>↗</span> Voir la carte
                            </a>
                            <button onClick={() => { toggleActive(carte.id, carte.active); setOpenActionMenu(null); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: carte.active ? '#F59E0B' : '#22C55E', textAlign: 'left' }}>
                              <span>{carte.active ? '⏸' : '▶'}</span> {carte.active ? 'Désactiver' : 'Activer'}
                            </button>
                            <button onClick={() => { setThemeModal({ id: carte.id, slug: carte.slug }); setTheme({ bg_color: carte.bg_color || EMPTY_THEME.bg_color, primary_color: carte.primary_color || EMPTY_THEME.primary_color, secondary_color: carte.secondary_color || EMPTY_THEME.secondary_color, text_color: carte.text_color || EMPTY_THEME.text_color, font_heading: carte.font_heading || EMPTY_THEME.font_heading, logo_url: carte.logo_url || '', logo_position: carte.logo_position || 'center' }); setOpenActionMenu(null); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', textAlign: 'left' }}>
                              <span>🎨</span> Thème
                            </button>
                            {['pro','business','business_team'].includes(plan) && (
                              <>
                                <div style={{ height: 1, background: 'var(--card-border)', margin: '4px 0' }} />
                                <button onClick={() => { addExtraMessages(carte.id, carte.extra_chat_messages ?? 0); setOpenActionMenu(null); }}
                                  disabled={addingMsgs === carte.id}
                                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: '#00CFFF', textAlign: 'left' }}>
                                  <span>✚</span> {addingMsgs === carte.id ? '...' : `+200 msgs (${carte.extra_chat_messages ?? 0})`}
                                </button>
                                <button onClick={() => { renewClient(carte.id); setOpenActionMenu(null); }}
                                  disabled={renewingId === carte.id}
                                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', textAlign: 'left' }}>
                                  <span>↺</span> {renewingId === carte.id ? '...' : 'Renouveler'}
                                </button>
                              </>
                            )}
                            <div style={{ height: 1, background: 'var(--card-border)', margin: '4px 0' }} />
                            <button onClick={() => { setDeleteConfirm(carte); setOpenActionMenu(null); }}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', textAlign: 'left' }}>
                              <span>🗑</span> Supprimer
                            </button>
                          </div>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px', overflowY: 'auto' }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: created ? 480 : 860, marginTop: 'auto', marginBottom: 'auto' }}>
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

                      {/* Logo */}
                      <div style={{ marginTop: 10 }}>
                        <label style={labelStyle}>Logo du client</label>
                        {theme.logo_url ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dark-3)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--card-border)', marginBottom: 6 }}>
                            <img src={theme.logo_url} alt="Logo" style={{ height: 28, maxWidth: 90, objectFit: 'contain' }} />
                            <button type="button" onClick={() => setTheme(t => ({ ...t, logo_url: '' }))}
                              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Supprimer
                            </button>
                          </div>
                        ) : null}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '9px 12px' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {uploadingLogo ? 'Upload...' : theme.logo_url ? 'Changer le logo' : 'Uploader le logo (PNG, SVG, JPG)'}
                          </span>
                          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingLogo}
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (!file || !form.slug) return;
                              setUploadingLogo(true);
                              const ext = file.name.split('.').pop();
                              const path = `${form.slug}/logo.${ext}`;
                              const { data, error: upErr } = await supabase.storage.from('carte-images').upload(path, file, { upsert: true });
                              if (!upErr && data) {
                                const { data: { publicUrl } } = supabase.storage.from('carte-images').getPublicUrl(path);
                                setTheme(t => ({ ...t, logo_url: publicUrl }));
                              }
                              setUploadingLogo(false);
                            }} />
                        </label>
                        {!form.slug && <p style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: 4 }}>Remplissez le nom pour activer l&apos;upload</p>}
                      </div>

                      {/* Position logo */}
                      <div style={{ marginTop: 10 }}>
                        <label style={labelStyle}>Position du logo</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(['left', 'center', 'right'] as const).map(pos => (
                            <button type="button" key={pos} onClick={() => setTheme(t => ({ ...t, logo_position: pos }))}
                              style={{ flex: 1, padding: '7px', borderRadius: 8, border: `2px solid ${theme.logo_position === pos ? 'var(--primary)' : 'var(--card-border)'}`, background: theme.logo_position === pos ? 'rgba(0,207,255,0.08)' : 'var(--dark-3)', color: theme.logo_position === pos ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              {pos === 'left' ? '◀ Gauche' : pos === 'center' ? '● Centre' : 'Droite ▶'}
                            </button>
                          ))}
                        </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Aperçu temps réel
                      </div>
                      <button onClick={() => setFullscreenPreview(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(0,207,255,0.08)', border: '1px solid rgba(0,207,255,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                        </svg>
                        Plein écran
                      </button>
                    </div>
                    <MiniCardPreview
                      form={{ name: form.name, title: form.title, company: form.company, phone: '', email: form.email, website: '', location: '', rdv_url: '', instagram: '', tiktok: '', facebook: '', linkedin: '', youtube: '', twitter: '', snapchat: '', telegram: '' }}
                      profile={{ photo_url: '', cover_url: '', cover_video_url: '', slug: form.slug, logo_url: theme.logo_url }}
                      theme={theme}
                      showLink={false}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Confirmation Suppression ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid #EF4444', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" width="20" height="20">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <div>
                <h3 style={{ color: '#EF4444', fontSize: '1rem', fontWeight: 800, margin: 0 }}>Supprimer définitivement</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>{deleteConfirm.name} · {deleteConfirm.slug}</p>
              </div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Cette action est <strong style={{ color: '#EF4444' }}>irréversible</strong>. Elle supprimera :<br/>
              • Le profil et toutes les données<br/>
              • Le compte dashboard du client<br/>
              • Les photos, logo et documents<br/>
              • Les logs de conversation IA
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} style={{ flex: 1 }}>
                Annuler
              </button>
              <button onClick={deleteClient} disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay aperçu plein écran ── */}
      {fullscreenPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setFullscreenPreview(false)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 390, maxHeight: '90vh', overflowY: 'auto', borderRadius: 20 }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setFullscreenPreview(false)}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
            <MiniCardPreview
              form={{ name: form.name, title: form.title, company: form.company, phone: '00000000', email: form.email, website: 'example.com', location: 'Votre ville', rdv_url: '', instagram: '', tiktok: '', facebook: '', linkedin: '', youtube: '', twitter: '', snapchat: '', telegram: '' }}
              profile={{ photo_url: '', cover_url: '', cover_video_url: '', slug: form.slug, logo_url: theme.logo_url }}
              theme={theme}
              showLink={false}
            />
          </div>
        </div>
      )}

      {/* ── Modal Thème ── */}
      {themeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 24, overflowY: 'auto' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, marginTop: 'auto', marginBottom: 'auto' }}>
            <h3 style={{ color: 'var(--text)', marginBottom: 20, fontSize: '1rem' }}>🎨 Thème — {themeModal.slug}</h3>

            {/* Couleurs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {([
                { key: 'bg_color', label: 'Fond' },
                { key: 'primary_color', label: 'Couleur principale' },
                { key: 'secondary_color', label: 'Couleur secondaire' },
                { key: 'text_color', label: 'Texte' },
              ] as { key: keyof typeof theme; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="color" value={theme[key] as string} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))}
                      style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid var(--card-border)', cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
                    <input style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', padding: '8px 10px' }}
                      value={theme[key] as string} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>

            {/* Police */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Police (Google Font)</label>
              <select style={inputStyle} value={theme.font_heading} onChange={e => setTheme(t => ({ ...t, font_heading: e.target.value }))}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Logo client */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Logo du client</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                {theme.logo_url ? (
                  <div style={{ background: theme.bg_color, borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--card-border)', flex: 1 }}>
                    <img src={theme.logo_url} alt="Logo" style={{ height: 32, maxWidth: 100, objectFit: 'contain' }} />
                    <button onClick={() => setTheme(t => ({ ...t, logo_url: '' }))}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>Aucun logo — logo G+Digital affiché</span>
                )}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 14px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {uploadingLogo ? 'Upload en cours...' : 'Cliquer pour uploader le logo (PNG, SVG, JPG)'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingLogo}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
              </label>
            </div>

            {/* Position du logo */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Position du logo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['left', 'center', 'right'] as const).map(pos => (
                  <button key={pos} onClick={() => setTheme(t => ({ ...t, logo_position: pos }))}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${theme.logo_position === pos ? 'var(--primary)' : 'var(--card-border)'}`, background: theme.logo_position === pos ? 'rgba(0,207,255,0.08)' : 'var(--dark-3)', color: theme.logo_position === pos ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
                    {pos === 'left' ? '◀ Gauche' : pos === 'center' ? '● Centre' : 'Droite ▶'}
                  </button>
                ))}
              </div>
            </div>

            {/* Aperçu couleurs */}
            <div style={{ background: 'var(--dark-3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ color: theme.primary_color, fontWeight: 700 }}>Principale</span> &nbsp;|&nbsp;
              <span style={{ color: theme.secondary_color, fontWeight: 700 }}>Secondaire</span> &nbsp;|&nbsp;
              <span style={{ background: theme.bg_color, color: theme.text_color, padding: '2px 8px', borderRadius: 4 }}>Texte sur fond</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setThemeModal(null)} style={{ flex: 1 }}>Annuler</button>
              <button className="btn btn-primary" onClick={saveTheme} disabled={savingTheme || uploadingLogo} style={{ flex: 1 }}>
                {savingTheme ? 'Sauvegarde...' : 'Appliquer le thème'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER — Membres d'équipe */}
      {membersDrawer && (
        <>
          {/* Overlay */}
          <div onClick={() => setMembersDrawer(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }} />
          {/* Panneau */}
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520, background: 'var(--dark-2)', borderLeft: '1px solid var(--card-border)', zIndex: 301, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* En-tête */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMembersDrawer(null)} style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Membres — {membersDrawer.company || membersDrawer.name}</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{drawerMembers.length} membre{drawerMembers.length > 1 ? 's' : ''} d&apos;équipe</p>
              </div>
            </div>

            {/* Liste membres */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {drawerMembers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>Aucun membre pour ce compte.</p>
              ) : drawerMembers.map(membre => {
                return (
                  <div key={membre.id} style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{membre.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                          {membre.title || '—'}{membre.company ? ` · ${membre.company}` : ''}
                        </p>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--secondary)', background: 'rgba(62,207,207,0.08)', padding: '3px 8px', borderRadius: 6 }}>{membre.slug}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`status-badge ${membre.active ? 'status-converted' : 'status-lost'}`}>{membre.active ? 'Active' : 'Inactive'}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{new Date(membre.created_at).toLocaleDateString('fr-FR')}</span>
                      <a href={`https://digitalsucces.tech/c/${membre.slug}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginLeft: 'auto' }}>Voir ↗</a>
                      <button onClick={() => toggleActive(membre.id, membre.active)}
                        style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: membre.active ? 'var(--accent)' : 'var(--secondary)', padding: 0 }}>
                        {membre.active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => { setThemeModal({ id: membre.id, slug: membre.slug }); setTheme({ bg_color: membre.bg_color || EMPTY_THEME.bg_color, primary_color: membre.primary_color || EMPTY_THEME.primary_color, secondary_color: membre.secondary_color || EMPTY_THEME.secondary_color, text_color: membre.text_color || EMPTY_THEME.text_color, font_heading: membre.font_heading || EMPTY_THEME.font_heading, logo_url: membre.logo_url || '', logo_position: membre.logo_position || 'center' }); }}
                        style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0 }}>
                        🎨 Thème
                      </button>
                      <button onClick={() => setDeleteConfirm(membre)}
                        style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: '#EF4444', padding: 0 }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' };
