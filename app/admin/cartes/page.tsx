'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type CarteProfile = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  company: string | null;
  plan: string | null;
  active: boolean;
  created_at: string;
};

const PLANS = ['starter', 'pro', 'business', 'business_team'];
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

export default function CartesPage() {
  const [cartes, setCartes]     = useState<CarteProfile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [created, setCreated]   = useState<string | null>(null);

  useEffect(() => { fetchCartes(); }, []);

  async function fetchCartes() {
    setLoading(true);
    const { data } = await supabase
      .from('carte_profiles')
      .select('id, slug, name, title, company, plan, active, created_at')
      .order('created_at', { ascending: false });
    setCartes(data || []);
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
      slug:    form.slug,
      name:    form.name,
      email:   form.email || null,
      title:   form.title || null,
      company: form.company || null,
      plan:    form.plan,
      active:  true,
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
              <tr><th>Nom</th><th>Poste / Entreprise</th><th>Slug</th><th>Plan</th><th>Créée le</th><th>Statut</th><th>Actions</th></tr>
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
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(carte.created_at).toLocaleDateString('fr-FR')}</td>
                    <td><span className={`status-badge ${carte.active ? 'status-converted' : 'status-lost'}`}>{carte.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`https://digitalsucces.tech/c/${carte.slug}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Voir ↗</a>
                        <button onClick={() => toggleActive(carte.id, carte.active)}
                          style={{ fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: carte.active ? 'var(--accent)' : 'var(--secondary)', padding: 0 }}>
                          {carte.active ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 480 }}>
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
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Nom complet *</label>
                    <input style={inputStyle} placeholder="Jean Dupont" value={form.name}
                      onChange={e => handleNameChange(e.target.value)} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Email du client *</label>
                      <input style={inputStyle} type="email" placeholder="client@email.com" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Mot de passe temp. *</label>
                      <input style={inputStyle} type="text" placeholder="Ex: Client2026!" value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Slug (URL de la carte) *</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden' }}>
                      <span style={{ padding: '10px 12px', fontSize: '0.78rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>digitalsucces.tech/c/</span>
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
                  {error && <p style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{error}</p>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" className="btn btn-outline" onClick={closeModal} style={{ flex: 1 }}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                      {saving ? 'Création...' : 'Créer la carte'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' };
