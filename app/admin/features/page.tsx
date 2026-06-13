'use client';
import { useEffect, useState } from 'react';

const ALL_PLANS = ['starter', 'pro', 'business', 'business_team'];
const PLAN_LABELS: Record<string, string> = {
  starter:       'Starter $12',
  pro:           'Pro $29',
  business:      'Business $59',
  business_team: 'Business Équipe $99',
};
const ICONS = ['✨','💬','💳','🌐','🎙️','📊','🎨','📹','🤖','🔔','⚡','🎯'];

const EMPTY_FORM = { feature_name: '', description: '', icon: '✨', cta_label: '', plans: ALL_PLANS };

interface Feature {
  id: string;
  feature_name: string;
  description: string;
  plans: string[];
  icon: string;
  cta_label: string;
  announced_at: string | null;
  emails_sent: number;
  created_at: string;
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => { fetchFeatures(); }, []);

  async function fetchFeatures() {
    setLoading(true);
    const res  = await fetch('/api/admin/features');
    const data = await res.json();
    setFeatures(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function togglePlan(plan: string) {
    setForm(f => ({
      ...f,
      plans: f.plans.includes(plan) ? f.plans.filter(p => p !== plan) : [...f.plans, plan]
    }));
  }

  async function handleCreate() {
    if (!form.feature_name || !form.description || !form.plans.length) {
      setError('Nom, description et au moins un plan sont requis.');
      return;
    }
    setSaving(true); setError(null);
    const res = await fetch('/api/admin/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature_name: form.feature_name,
        description:  form.description,
        icon:         form.icon,
        cta_label:    form.cta_label || 'Découvrir la nouveauté',
        plans:        form.plans,
      }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); setSaving(false); return; }
    setShowForm(false);
    setForm(EMPTY_FORM);
    fetchFeatures();
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la feature "${name}" ?`)) return;
    await fetch('/api/admin/features', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchFeatures();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--card-border)',
    background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.875rem', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 6, display: 'block',
  };

  const pending    = features.filter(f => !f.announced_at);
  const announced  = features.filter(f =>  f.announced_at);

  return (
    <div style={{ padding: '0 0 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="admin-title">Nouvelles Features</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Ajoutez une feature → les emails partent automatiquement à 10h UTC le lendemain
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: '0.82rem' }}>
          + Nouvelle feature
        </button>
      </div>

      {/* SECTION EN ATTENTE */}
      <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 12 }}>
        En attente d'envoi ({pending.length})
      </h2>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chargement...</p>
      ) : pending.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '20px 24px', color: 'var(--text-faint)', fontSize: '0.85rem', marginBottom: 28 }}>
          Aucune feature en attente — les emails seront envoyés dès qu'une feature est ajoutée.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {pending.map(f => <FeatureCard key={f.id} feature={f} onDelete={handleDelete} />)}
        </div>
      )}

      {/* SECTION ANNONCÉES */}
      {announced.length > 0 && (
        <>
          <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 12 }}>
            Déjà annoncées ({announced.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announced.map(f => <FeatureCard key={f.id} feature={f} onDelete={handleDelete} />)}
          </div>
        </>
      )}

      {/* MODAL CRÉATION */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--text)', margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>
              ✨ Nouvelle feature
            </h3>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nom de la feature *</label>
              <input style={inputStyle} placeholder="Ex: WhatsApp Auto-message"
                value={form.feature_name} onChange={e => setForm(f => ({ ...f, feature_name: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description *</label>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                placeholder="Expliquez ce que fait la feature en 1-2 phrases claires..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Icône</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button"
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.icon === ic ? '#D4A843' : 'var(--card-border)'}`, background: form.icon === ic ? 'rgba(212,168,67,0.15)' : 'var(--dark-3)', cursor: 'pointer', fontSize: 18 }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Texte du bouton CTA</label>
                <input style={inputStyle} placeholder="Découvrir la nouveauté"
                  value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Plans concernés *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ALL_PLANS.map(plan => (
                  <label key={plan} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, border: `2px solid ${form.plans.includes(plan) ? '#D4A843' : 'var(--card-border)'}`, background: form.plans.includes(plan) ? 'rgba(212,168,67,0.08)' : 'var(--dark-3)' }}>
                    <input type="checkbox" checked={form.plans.includes(plan)} onChange={() => togglePlan(plan)}
                      style={{ width: 16, height: 16, accentColor: '#D4A843' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: form.plans.includes(plan) ? 600 : 400 }}>
                      {PLAN_LABELS[plan]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ⏰ Les emails seront envoyés automatiquement <strong style={{ color: 'var(--text)' }}>demain à 10h UTC</strong> aux clients des plans sélectionnés.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => { setShowForm(false); setError(null); setForm(EMPTY_FORM); }} style={{ flex: 1 }}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Enregistrement...' : 'Enregistrer la feature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ feature, onDelete }: { feature: Feature; onDelete: (id: string, name: string) => void }) {
  const announced = !!feature.announced_at;
  const date = announced
    ? new Date(feature.announced_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div style={{ background: 'var(--card-bg)', border: `1px solid ${announced ? 'var(--card-border)' : '#D4A843'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 32, flexShrink: 0, marginTop: 2 }}>{feature.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{feature.feature_name}</span>
          {announced ? (
            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              ✓ Envoyé le {date} · {feature.emails_sent} emails
            </span>
          ) : (
            <span style={{ background: 'rgba(212,168,67,0.2)', color: '#D4A843', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              ⏳ En attente — envoi demain à 10h UTC
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 8px', lineHeight: 1.5 }}>{feature.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {feature.plans.map(p => (
            <span key={p} style={{ background: 'var(--dark-3)', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--card-border)' }}>
              {({ starter: 'Starter', pro: 'Pro', business: 'Business', business_team: 'Équipe' } as Record<string,string>)[p] || p}
            </span>
          ))}
        </div>
      </div>
      {!announced && (
        <button onClick={() => onDelete(feature.id, feature.feature_name)}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
          Supprimer
        </button>
      )}
    </div>
  );
}
