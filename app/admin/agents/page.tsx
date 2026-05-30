'use client';
import { useEffect, useState } from 'react';

type AgentClient = {
  client_id: string;
  business_name: string;
  active: boolean;
  monthly_message_limit: number;
  message_count_month: number;
  message_count_reset_at: string | null;
};

type ServiceRow = { name: string; description: string; price: string; duration: string };
type FaqRow    = { question: string; answer: string };

const EMPTY_FORM = {
  client_id: '', business_name: '', business_type: '', primary_color: '#0066CC',
  agent_name: '', dashboard_password: '', monthly_message_limit: '500',
  welcome_message: '', custom_instructions: '',
  contact_email: '', indicatif: '+1', contact_phone: '', booking_url: '', timezone: 'America/Toronto',
};

const INDICATIFS = [
  { v: '+33',  l: '🇫🇷 +33 France' },       { v: '+32',  l: '🇧🇪 +32 Belgique' },
  { v: '+41',  l: '🇨🇭 +41 Suisse' },        { v: '+352', l: '🇱🇺 +352 Luxembourg' },
  { v: '+1',   l: '🇨🇦 +1 Canada' },         { v: '+1us', l: '🇺🇸 +1 États-Unis' },
  { v: '+212', l: '🇲🇦 +212 Maroc' },        { v: '+213', l: '🇩🇿 +213 Algérie' },
  { v: '+216', l: '🇹🇳 +216 Tunisie' },      { v: '+221', l: '🇸🇳 +221 Sénégal' },
  { v: '+225', l: '🇨🇮 +225 Côte d\'Ivoire' },{ v: '+237', l: '🇨🇲 +237 Cameroun' },
  { v: '+242', l: '🇨🇬 +242 Congo' },        { v: '+243', l: '🇨🇩 +243 RD Congo' },
  { v: '+241', l: '🇬🇦 +241 Gabon' },        { v: '+229', l: '🇧🇯 +229 Bénin' },
  { v: '+226', l: '🇧🇫 +226 Burkina Faso' }, { v: '+223', l: '🇲🇱 +223 Mali' },
  { v: '+227', l: '🇳🇪 +227 Niger' },        { v: '+228', l: '🇹🇬 +228 Togo' },
  { v: '+224', l: '🇬🇳 +224 Guinée' },       { v: '+230', l: '🇲🇺 +230 Maurice' },
  { v: '+261', l: '🇲🇬 +261 Madagascar' },   { v: '+971', l: '🇦🇪 +971 Dubaï' },
  { v: '+966', l: '🇸🇦 +966 Arabie Saoudite' },{ v: '+974', l: '🇶🇦 +974 Qatar' },
  { v: '+44',  l: '🇬🇧 +44 Royaume-Uni' },   { v: '+49',  l: '🇩🇪 +49 Allemagne' },
];

const TIMEZONES = [
  { g: 'Afrique', opts: [
    { v: 'Africa/Abidjan',      l: '🇨🇮 Abidjan (GMT+0)' },
    { v: 'Africa/Dakar',        l: '🇸🇳 Dakar (GMT+0)' },
    { v: 'Africa/Lagos',        l: '🇳🇬 Lagos (GMT+1)' },
    { v: 'Africa/Douala',       l: '🇨🇲 Douala (GMT+1)' },
    { v: 'Africa/Libreville',   l: '🇬🇦 Libreville (GMT+1)' },
    { v: 'Africa/Casablanca',   l: '🇲🇦 Casablanca (GMT+1)' },
    { v: 'Africa/Tunis',        l: '🇹🇳 Tunis (GMT+1)' },
    { v: 'Africa/Algiers',      l: '🇩🇿 Alger (GMT+1)' },
    { v: 'Africa/Nairobi',      l: '🇰🇪 Nairobi (GMT+3)' },
  ]},
  { g: 'Europe', opts: [
    { v: 'Europe/Paris',    l: '🇫🇷 Paris (GMT+1/+2)' },
    { v: 'Europe/Brussels', l: '🇧🇪 Bruxelles (GMT+1/+2)' },
    { v: 'Europe/Zurich',   l: '🇨🇭 Zurich (GMT+1/+2)' },
    { v: 'Europe/London',   l: '🇬🇧 Londres (GMT+0/+1)' },
  ]},
  { g: 'Moyen-Orient', opts: [
    { v: 'Asia/Dubai',   l: '🇦🇪 Dubaï (GMT+4)' },
    { v: 'Asia/Riyadh',  l: '🇸🇦 Riyad (GMT+3)' },
    { v: 'Asia/Qatar',   l: '🇶🇦 Qatar (GMT+3)' },
  ]},
  { g: 'Amériques', opts: [
    { v: 'America/New_York',   l: '🇺🇸 New York (GMT-5/-4)' },
    { v: 'America/Toronto',    l: '🇨🇦 Toronto (GMT-5/-4)' },
    { v: 'America/Montreal',   l: '🇨🇦 Montréal (GMT-5/-4)' },
    { v: 'America/Chicago',    l: '🇺🇸 Chicago (GMT-6/-5)' },
    { v: 'America/Los_Angeles',l: '🇺🇸 Los Angeles (GMT-8/-7)' },
  ]},
  { g: 'Asie-Pacifique', opts: [
    { v: 'Asia/Tokyo',     l: '🇯🇵 Tokyo (GMT+9)' },
    { v: 'Asia/Singapore', l: '🇸🇬 Singapour (GMT+8)' },
    { v: 'Australia/Sydney',l: '🇦🇺 Sydney (GMT+10/+11)' },
  ]},
];

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30);
}

export default function AgentsPage() {
  const [clients, setClients]       = useState<AgentClient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [services, setServices]     = useState<ServiceRow[]>([{ name: '', description: '', price: '', duration: '' }]);
  const [faq, setFaq]               = useState<FaqRow[]>([{ question: '', answer: '' }]);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [created, setCreated]       = useState<string | null>(null);

  useEffect(() => { fetchClients(); }, []);

  async function toggleActive(client_id: string, active: boolean) {
    await fetch('/api/admin-agent?path=admin/toggle-active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id, active }),
    });
    setClients(prev => prev.map(c => c.client_id === client_id ? { ...c, active } : c));
  }

  async function fetchClients() {
    setLoading(true); setFetchError(null);
    try {
      const res  = await fetch('/api/admin-agent?path=admin/clients-usage');
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : data.clients || []);
    } catch (e) { setFetchError((e as Error).message); }
    setLoading(false);
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, business_name: name, client_id: slugify(name) }));
  }

  function setField(key: keyof typeof EMPTY_FORM, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  // Services
  function updateService(i: number, k: keyof ServiceRow, v: string) {
    setServices(prev => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  }
  function addService()    { setServices(p => [...p, { name: '', description: '', price: '', duration: '' }]); }
  function removeService(i: number) { setServices(p => p.filter((_, idx) => idx !== i)); }

  // FAQ
  function updateFaq(i: number, k: keyof FaqRow, v: string) {
    setFaq(prev => prev.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  }
  function addFaq()    { setFaq(p => [...p, { question: '', answer: '' }]); }
  function removeFaq(i: number) { setFaq(p => p.filter((_, idx) => idx !== i)); }

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true); setFormError(null);
    const { client_id, business_name, contact_email, dashboard_password } = form;
    if (!client_id || !business_name || !contact_email || !dashboard_password) {
      setFormError('Les champs obligatoires (*) doivent être remplis.'); setSaving(false); return;
    }

    const phone = form.indicatif !== '+1us' ? `${form.indicatif}${form.contact_phone}` : `+1${form.contact_phone}`;

    const res = await fetch('/api/admin-agent?path=admin/create-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id, business_name,
        business_type:        form.business_type,
        primary_color:        form.primary_color,
        agent_name:           form.agent_name,
        dashboard_password,
        monthly_message_limit: parseInt(form.monthly_message_limit) || 500,
        welcome_message:      form.welcome_message,
        custom_instructions:  form.custom_instructions,
        contact_email,
        contact_phone:        form.contact_phone ? phone : '',
        booking_url:          form.booking_url,
        timezone:             form.timezone,
        services: services.filter(s => s.name),
        faq:      faq.filter(f => f.question && f.answer),
      }),
    });

    const data = await res.json();
    if (!res.ok) { setFormError(data.error || 'Erreur lors de la création.'); setSaving(false); return; }

    setCreated(`https://agent.digitalsucces.tech/dashboard/${form.client_id}`);
    setForm(EMPTY_FORM);
    setServices([{ name: '', description: '', price: '', duration: '' }]);
    setFaq([{ question: '', answer: '' }]);
    fetchClients();
    setSaving(false);
  }

  function closeModal() {
    setShowModal(false); setFormError(null); setCreated(null);
    setForm(EMPTY_FORM);
    setServices([{ name: '', description: '', price: '', duration: '' }]);
    setFaq([{ question: '', answer: '' }]);
  }

  const actifs   = clients.filter(c => c.active !== false).length;
  const inactifs = clients.length - actifs;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Agents IA</h1>
          <p className="admin-subtitle">{actifs} actif{actifs > 1 ? 's' : ''} · {inactifs} inactif{inactifs > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={fetchClients} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.82rem' }}>+ Nouveau client</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : fetchError ? (
        <p style={{ color: 'var(--accent)', textAlign: 'center', padding: 48 }}>{fetchError}</p>
      ) : clients.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucun client configuré.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="lead-table">
            <thead>
              <tr><th>Client</th><th>Statut</th><th>Utilisation ce mois</th><th>Reset le</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const used     = client.message_count_month || 0;
                const limit    = client.monthly_message_limit || 0;
                const pct      = limit ? Math.round((used / limit) * 100) : 0;
                const barColor = pct >= 100 ? 'var(--accent)' : pct >= 80 ? 'var(--gold)' : 'var(--secondary)';
                const isActive = client.active !== false;
                return (
                  <tr key={client.client_id}>
                    <td style={{ fontWeight: 600 }}>{client.business_name}</td>
                    <td><span className={`status-badge ${isActive ? 'status-converted' : 'status-lost'}`}>{isActive ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div style={{ minWidth: 180 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                            <strong>{used}</strong>
                            <span style={{ color: 'var(--text-muted)' }}> / {limit || '—'} msgs</span>
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: barColor }}>
                            {pct >= 100 ? '⚠ ' : pct >= 80 ? '! ' : ''}{pct}%
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--dark-4)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {client.message_count_reset_at ? new Date(client.message_count_reset_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <a href={`https://agent.digitalsucces.tech/dashboard/${client.client_id}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Dashboard ↗</a>
                        <button onClick={() => toggleActive(client.client_id, !isActive)}
                          style={{ fontSize: '0.72rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0,
                            color: isActive ? 'var(--accent)' : '#22C55E' }}>
                          {isActive ? '⏸ Suspendre' : '▶ Réactiver'}
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

      {/* MODAL FORMULAIRE COMPLET */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, overflowY: 'auto', padding: '24px 16px' }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 720, margin: '0 auto' }}>

            {/* Header modal */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                {created ? 'Client créé ✓' : 'Nouveau client — Agent IA'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {created ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ color: '#22C55E', fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Client créé avec succès !</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                  Un email d'onboarding a été envoyé automatiquement. Dashboard client :
                </p>
                <div style={{ background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: 24, wordBreak: 'break-all' }}>
                  {created}
                </div>
                <button className="btn btn-primary" onClick={closeModal}>Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleCreate}>

                {/* 1 — Entreprise */}
                <FormSection title="1. Informations de l'entreprise">
                  <div style={grid2}>
                    <Field label="Nom de l'entreprise *" value={form.business_name} onChange={v => handleNameChange(v)} placeholder="ex: Salon Marie" />
                    <Field label="Client ID (slug) *" value={form.client_id} onChange={v => setField('client_id', v)} placeholder="ex: salon-marie" />
                    <Field label="Type de business" value={form.business_type} onChange={v => setField('business_type', v)} placeholder="ex: salon de coiffure" />
                    <div>
                      <label style={labelStyle}>Couleur principale</label>
                      <input type="color" value={form.primary_color}
                        onChange={e => setField('primary_color', e.target.value)}
                        style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--dark-3)', cursor: 'pointer', padding: 4 }} />
                    </div>
                  </div>
                </FormSection>

                {/* 2 — Agent IA */}
                <FormSection title="2. Agent IA">
                  <div style={grid2}>
                    <Field label="Nom de l'agent" value={form.agent_name} onChange={v => setField('agent_name', v)} placeholder="ex: Sophie" />
                    <Field label="Mot de passe dashboard *" value={form.dashboard_password} onChange={v => setField('dashboard_password', v)} placeholder="ex: Client2026!" />
                    <Field label="Limite messages/mois" value={form.monthly_message_limit} onChange={v => setField('monthly_message_limit', v)} placeholder="500" type="number" />
                  </div>
                  <Field label="Message d'accueil" value={form.welcome_message} onChange={v => setField('welcome_message', v)}
                    placeholder="ex: Bonjour ! Je suis Sophie, comment puis-je vous aider ?" textarea />
                  <Field label="Instructions personnalisées" value={form.custom_instructions} onChange={v => setField('custom_instructions', v)}
                    placeholder="ex: Réponds toujours en tutoyant. Ne mentionne jamais les prix. Priorité : prise de RDV. Ton chaleureux." textarea rows={4} />
                </FormSection>

                {/* 3 — Coordonnées */}
                <FormSection title="3. Coordonnées du client">
                  <div style={grid2}>
                    <Field label="Email de contact *" value={form.contact_email} onChange={v => setField('contact_email', v)} placeholder="contact@client.com" type="email" />
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select style={{ ...inputStyle, width: 170, flexShrink: 0 }} value={form.indicatif} onChange={e => setField('indicatif', e.target.value)}>
                          {INDICATIFS.map(i => <option key={i.v} value={i.v}>{i.l}</option>)}
                        </select>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="6 xx xx xx xx" value={form.contact_phone}
                          onChange={e => setField('contact_phone', e.target.value)} />
                      </div>
                    </div>
                    <Field label="URL de réservation" value={form.booking_url} onChange={v => setField('booking_url', v)} placeholder="https://calendly.com/..." />
                    <div>
                      <label style={labelStyle}>Fuseau horaire</label>
                      <select style={inputStyle} value={form.timezone} onChange={e => setField('timezone', e.target.value)}>
                        <option value="UTC">🌍 UTC</option>
                        {TIMEZONES.map(g => (
                          <optgroup key={g.g} label={g.g}>
                            {g.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                </FormSection>

                {/* 4 — Services */}
                <FormSection title="4. Services proposés">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {services.map((svc, i) => (
                      <div key={i} style={{ background: 'var(--dark-3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                          <input style={inputStyle} placeholder="Nom du service *" value={svc.name} onChange={e => updateService(i, 'name', e.target.value)} />
                          <input style={inputStyle} placeholder="Description" value={svc.description} onChange={e => updateService(i, 'description', e.target.value)} />
                          <input style={inputStyle} placeholder="Prix (ex: 50)" value={svc.price} onChange={e => updateService(i, 'price', e.target.value)} />
                          <input style={inputStyle} placeholder="Durée en min (ex: 30)" value={svc.duration} onChange={e => updateService(i, 'duration', e.target.value)} />
                        </div>
                        {services.length > 1 && (
                          <button type="button" onClick={() => removeService(i)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}>
                            Supprimer ce service
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addService}
                      style={{ background: 'none', border: '1px dashed var(--card-border)', borderRadius: 8, padding: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>
                      + Ajouter un service
                    </button>
                  </div>
                </FormSection>

                {/* 5 — FAQ */}
                <FormSection title="5. FAQ — Questions fréquentes">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {faq.map((f, i) => (
                      <div key={i} style={{ background: 'var(--dark-3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--card-border)' }}>
                        <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Question *" value={f.question} onChange={e => updateFaq(i, 'question', e.target.value)} />
                        <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} placeholder="Réponse *" value={f.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} />
                        {faq.length > 1 && (
                          <button type="button" onClick={() => removeFaq(i)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.78rem', padding: '4px 0 0' }}>
                            Supprimer
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addFaq}
                      style={{ background: 'none', border: '1px dashed var(--card-border)', borderRadius: 8, padding: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>
                      + Ajouter une question
                    </button>
                  </div>
                </FormSection>

                {/* Footer */}
                <div style={{ padding: '20px 28px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: 10, flexDirection: 'column' }}>
                  {formError && <p style={{ color: 'var(--accent)', fontSize: '0.82rem', textAlign: 'center' }}>{formError}</p>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-outline" onClick={closeModal} style={{ flex: 1 }}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2 }}>
                      {saving ? 'Création en cours...' : 'Créer le client & envoyer l\'email'}
                    </button>
                  </div>
                </div>

              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--card-border)' }}>
      <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, rows, type }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; rows?: number; type?: string;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea style={{ ...inputStyle, minHeight: rows ? rows * 28 : 64, resize: 'vertical' }}
          placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input style={inputStyle} type={type || 'text'} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

const grid2: React.CSSProperties    = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 };
const labelStyle: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
