'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ─── Types ──────────────────────────────────────────────── */
type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  client_email: string;
  amount: number;
  currency: string;
  status: 'sent' | 'paid' | 'unpaid' | 'cancelled';
  subscription_type: string | null;
  subscription_end: string | null;
  due_date: string | null;
  service_type: string | null;
  created_at: string;
};

type AgentClient   = { client_id: string; business_name: string; contact_email: string };
type CarteClient   = { id: string; full_name: string; email: string; plan: string };
type ClientType    = 'agent' | 'carte' | 'ponctuel';

/* ─── Catalogue services ──────────────────────────────────── */
type BillingType  = 'one_time' | 'monthly' | 'annual';
type CatalogItem  = { label: string; amount: number | null; billing: BillingType; note?: string };
const CATALOG: { category: string; items: CatalogItem[] }[] = [
  {
    category: 'Création de site web',
    items: [
      { label: 'Site web Basique',       amount: 250,  billing: 'one_time' },
      { label: 'Site web Pro',           amount: 600,  billing: 'one_time' },
      { label: 'Site web Premium',       amount: 1200, billing: 'one_time' },
      { label: 'Refonte & amélioration', amount: null, billing: 'one_time', note: 'Devis personnalisé' },
    ],
  },
  {
    category: 'Maintenance',
    items: [
      { label: 'Maintenance mensuelle', amount: 170, billing: 'monthly', note: '/mois' },
    ],
  },
  {
    category: 'Agent IA',
    items: [
      { label: 'Agent IA — Starter',  amount: 99,  billing: 'monthly', note: '/mois' },
      { label: 'Agent IA — Business', amount: 199, billing: 'monthly', note: '/mois' },
      { label: 'Agent IA — Premium',  amount: 299, billing: 'monthly', note: '/mois' },
    ],
  },
  {
    category: 'Carte de Visite NFC',
    items: [
      { label: 'Carte NFC — Starter',        amount: 9,  billing: 'monthly', note: '/mois' },
      { label: 'Carte NFC — Pro',             amount: 19, billing: 'monthly', note: '/mois' },
      { label: 'Carte NFC — Business',        amount: 39, billing: 'monthly', note: '/mois' },
      { label: 'Carte NFC physique Standard', amount: 15, billing: 'one_time', note: 'Unique' },
      { label: 'Carte NFC physique Premium',  amount: 25, billing: 'one_time', note: 'Unique' },
    ],
  },
];

/* Lookup billing type depuis le label */
function getBilling(label: string): BillingType {
  for (const cat of CATALOG)
    for (const item of cat.items)
      if (item.label === label) return item.billing;
  return 'one_time';
}

/* ─── Multi-devises ─────────────────────────────────────── */
const CURRENCIES: { code: string; label: string; rate: number }[] = [
  { code: 'USD', label: 'USD — Dollar américain',      rate: 1      },
  { code: 'EUR', label: 'EUR — Euro',                  rate: 0.93   },
  { code: 'XOF', label: 'XOF — Franc CFA (UEMOA)',    rate: 655    },
  { code: 'XAF', label: 'XAF — Franc CFA (CEMAC)',    rate: 655    },
  { code: 'MAD', label: 'MAD — Dirham marocain',      rate: 10.5   },
  { code: 'NGN', label: 'NGN — Naira nigérian',       rate: 1580   },
  { code: 'GHS', label: 'GHS — Cédi ghanéen',        rate: 15.5   },
  { code: 'KES', label: 'KES — Shilling kenyan',      rate: 130    },
  { code: 'ZAR', label: 'ZAR — Rand sud-africain',   rate: 18.5   },
  { code: 'AED', label: 'AED — Dirham émirien',      rate: 3.67   },
];

function convertAmount(usd: number, rate: number): string {
  return Math.round(usd * rate).toLocaleString('fr-FR');
}

/* ─── Constantes UI ─────────────────────────────────────── */
const STATUS_LABELS: Record<string, string> = {
  sent: 'Envoyée', paid: 'Payée', unpaid: 'Impayée', cancelled: 'Annulée',
};
const STATUS_CLASS: Record<string, string> = {
  sent: 'status-contacted', paid: 'status-converted', unpaid: 'status-new', cancelled: 'status-lost',
};
const SERVICE_TYPE_LABELS: Record<string, string> = {
  site_web: 'Site web', agent_ia: 'Agent IA', carte_nfc: 'Carte NFC', autre: 'Autre',
};

const EMPTY_FORM = {
  clientType: 'agent' as ClientType,
  client_id:    '',
  client_name:  '',
  client_email: '',
  service_types: [] as string[],
  currency:           'USD',
  subscription_type:  'monthly',
  subscription_start: '',
  subscription_end:   '',
  due_date:           '',
  items: [{ description: '', amount: '', billing: 'one_time' as 'one_time' | 'monthly' | 'annual' }],
};

/* ═══════════════════════════════════════════════════════════ */
export default function FacturationPage() {
  return <Suspense fallback={null}><FacturationPageInner /></Suspense>;
}

function FacturationPageInner() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [agentClients, setAgentClients] = useState<AgentClient[]>([]);
  const [carteClients, setCarteClients] = useState<CarteClient[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<string>('all');
  const [filterService, setFilterService] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated]     = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchEmail, setSearchEmail]   = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; name: string; email: string; source: string; client_id: string }[]>([]);
  const [showResults, setShowResults]   = useState(false);
  const [fromQuote, setFromQuote] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchAgentClients();
    fetchCarteClients();
    const quoteNum = searchParams.get('from_quote');
    if (quoteNum) {
      prefillFromQuote(quoteNum);
    } else {
      const name  = searchParams.get('name');
      const email = searchParams.get('email');
      if (name || email) {
        setForm(f => ({ ...f, client_name: name || '', client_email: email || '' }));
        setSearchEmail(email || '');
        setShowModal(true);
      }
    }
  }, []);

  async function prefillFromQuote(quoteNumber: string) {
    const { data: q } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_number', quoteNumber)
      .single();
    if (!q) return;
    const items = (() => {
      try { return JSON.parse(q.items); } catch { return []; }
    })();
    setFromQuote(quoteNumber);
    setForm(() => ({
      ...EMPTY_FORM,
      client_name:   q.client_name  || '',
      client_email:  q.client_email || '',
      service_types: q.service_types ? q.service_types.split(',') : [],
      items: items.length
        ? items.map((i: { description: string; amount: number; billing?: string }) => ({
            description: i.description,
            amount:      String(i.amount || ''),
            billing:     (i.billing || 'one_time') as BillingType,
          }))
        : EMPTY_FORM.items,
    }));
    setSearchEmail(q.client_email || '');
    setShowModal(true);
  }

  async function fetchInvoices() {
    setLoading(true);
    const res  = await fetch('/api/admin-agent?path=admin/invoices');
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function fetchAgentClients() {
    const res  = await fetch('/api/admin-agent?path=admin/clients-list');
    const data = await res.json();
    setAgentClients(Array.isArray(data) ? data : []);
  }

  async function fetchCarteClients() {
    const { data } = await supabase
      .from('carte_profiles')
      .select('id, full_name, email, plan')
      .order('full_name');
    setCarteClients(data || []);
  }

  /* ─── Marquer payée ─────────────────────────────────────── */
  async function markPaid(invoice_number: string) {
    await fetch('/api/admin-agent?path=admin/invoice-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_number }),
    });
    setInvoices(prev =>
      prev.map(i => i.invoice_number === invoice_number ? { ...i, status: 'paid' } : i)
    );
  }

  /* ─── Relance impayée ───────────────────────────────────── */
  const [reminding, setReminding] = useState<string | null>(null);
  const [remindOk,  setRemindOk]  = useState<string | null>(null);

  async function sendReminder(invoice_number: string) {
    setReminding(invoice_number);
    await fetch('/api/admin-agent?path=admin/invoice-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_number }),
    });
    setReminding(null);
    setRemindOk(invoice_number);
    setTimeout(() => setRemindOk(null), 3000);
  }

  /* ─── Renvoyer PDF ──────────────────────────────────────── */
  const [resending, setResending] = useState<string | null>(null);
  const [resendOk,  setResendOk]  = useState<string | null>(null);

  async function resendInvoice(invoice_number: string) {
    setResending(invoice_number);
    await fetch('/api/admin-agent?path=admin/resend-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_number }),
    });
    setResending(null);
    setResendOk(invoice_number);
    setTimeout(() => setResendOk(null), 3000);
  }

  /* ─── Recherche unifiée par email ──────────────────────── */
  function handleEmailSearch(q: string) {
    setSearchEmail(q);
    if (q.length < 2) { setSearchResults([]); setShowResults(false); return; }
    const term = q.toLowerCase();
    const results: typeof searchResults = [];
    agentClients.forEach(c => {
      if (c.contact_email?.toLowerCase().includes(term) || c.business_name?.toLowerCase().includes(term)) {
        results.push({ label: c.business_name, name: c.business_name, email: c.contact_email, source: 'Agent IA', client_id: c.client_id });
      }
    });
    carteClients.forEach(c => {
      const existing = results.find(r => r.email?.toLowerCase() === c.email?.toLowerCase());
      if (c.email?.toLowerCase().includes(term) || c.full_name?.toLowerCase().includes(term)) {
        if (existing) {
          existing.source = existing.source + ' + Carte NFC';
        } else {
          results.push({ label: c.full_name, name: c.full_name, email: c.email, source: 'Carte NFC', client_id: c.id });
        }
      }
    });
    setSearchResults(results);
    setShowResults(true);
  }

  function selectClient(r: { name: string; email: string; client_id: string }) {
    setForm(f => ({ ...f, client_id: r.client_id, client_name: r.name, client_email: r.email }));
    setSearchEmail(r.email);
    setShowResults(false);
  }

  function resetClient() {
    setSearchEmail('');
    setSearchResults([]);
    setShowResults(false);
    setForm(f => ({ ...f, client_id: '', client_name: '', client_email: '' }));
  }

  /* ─── Items ─────────────────────────────────────────────── */
  function updateItem(index: number, field: 'description' | 'amount', value: string) {
    setForm(f => {
      const items = [...f.items];
      if (field === 'description') {
        items[index] = { ...items[index], description: value, billing: getBilling(value) };
      } else {
        items[index] = { ...items[index], amount: value };
      }
      return { ...f, items };
    });
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { description: '', amount: '', billing: 'one_time' as BillingType }] }));
  }

  function updateItemBilling(index: number, billing: BillingType) {
    setForm(f => {
      const items = [...f.items];
      items[index] = { ...items[index], billing };
      return { ...f, items };
    });
  }

  function removeItem(i: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  function addCatalogItem(label: string, amount: number | null, billing: BillingType) {
    const newItem = { description: label, amount: amount != null ? String(amount) : '', billing };
    setForm(f => ({
      ...f,
      items: f.items.length === 1 && !f.items[0].description && !f.items[0].amount
        ? [newItem]
        : [...f.items, newItem],
      service_types: (() => {
        const detected = label.includes('Agent IA') ? 'agent_ia'
          : label.includes('Carte NFC') ? 'carte_nfc'
          : label.includes('Maintenance') ? 'site_web'
          : (label.includes('Site') || label.includes('Refonte')) ? 'site_web'
          : null;
        if (detected && !f.service_types.includes(detected))
          return [...f.service_types, detected];
        return f.service_types;
      })(),
    }));
    setShowCatalog(false);
  }

  /* ─── Créer facture ─────────────────────────────────────── */
  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true); setFormError(null);
    if (!form.client_email || !form.client_name) {
      setFormError('Nom et email du client obligatoires.'); setSaving(false); return;
    }
    const validItems = form.items.filter(i => i.description && i.amount);
    if (validItems.length === 0) {
      setFormError('Au moins une ligne de facturation obligatoire.'); setSaving(false); return;
    }
    const recurringMonthly = validItems.filter(i => i.billing === 'monthly').reduce((s, i) => s + parseFloat(i.amount), 0);
    const recurringAnnual  = validItems.filter(i => i.billing === 'annual').reduce((s, i) => s + parseFloat(i.amount), 0);

    const body: Record<string, unknown> = {
      client_id:         form.client_id || form.client_email,
      client_name:       form.client_name,
      client_email:      form.client_email,
      service_type:      form.service_types.length > 0 ? form.service_types.join(',') : 'autre',
      currency:          form.currency,
      subscription_type: form.subscription_type,
      recurring_amount:  recurringMonthly > 0 ? recurringMonthly : undefined,
      annual_amount:     recurringAnnual  > 0 ? recurringAnnual  : undefined,
      items:             validItems.map(i => ({
        description: i.description,
        amount:      parseFloat(i.amount),
        billing:     i.billing,
      })),
    };
    if (form.subscription_start) body.subscription_start = form.subscription_start;
    if (form.subscription_end)   body.subscription_end   = form.subscription_end;
    if (form.due_date)           body.due_date           = form.due_date;

    const res  = await fetch('/api/admin-agent?path=admin/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || 'Erreur lors de la création.'); setSaving(false); return; }

    if (fromQuote) {
      await fetch('/api/admin-agent?path=admin/quote-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_number: fromQuote, status: 'converted', invoice_number: data.invoiceNumber }),
      });
      setFromQuote(null);
    }

    setCreated(data.invoiceNumber);
    setForm(EMPTY_FORM);
    fetchInvoices();
    setSaving(false);
  }

  function closeModal() {
    setShowModal(false); setFormError(null); setCreated(null);
    setForm(EMPTY_FORM); setShowCatalog(false); setFromQuote(null);
  }

  /* ─── Statistiques ──────────────────────────────────────── */
  const filtered   = invoices.filter(i => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (filterService !== 'all' && !(i.service_type || '').split(',').includes(filterService)) return false;
    return true;
  });
  const totalPaid  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const totalDue   = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + (i.amount || 0), 0);
  const counts     = { all: invoices.length, sent: 0, paid: 0, unpaid: 0, cancelled: 0 };
  invoices.forEach(i => { if (i.status in counts) counts[i.status as keyof typeof counts]++; });
  const formTotal    = form.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const formMonthly  = form.items.filter(i => i.billing === 'monthly').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const formAnnual   = form.items.filter(i => i.billing === 'annual').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const formOneTime  = form.items.filter(i => i.billing === 'one_time').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const services   = [...new Set(invoices.flatMap(i => (i.service_type || '').split(',').filter(Boolean)))];

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Facturation</h1>
          <p className="admin-subtitle">{invoices.length} facture{invoices.length > 1 ? 's' : ''} au total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={fetchInvoices} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.82rem' }}>+ Nouvelle facture</button>
        </div>
      </div>

      {/* ── Résumé stats ── */}
      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: '#22C55E' }}>◐</div>
          <div className="admin-stat-value" style={{ color: '#22C55E' }}>${totalPaid.toLocaleString()}</div>
          <div className="admin-stat-label">Encaissé</div>
          <div className="admin-stat-sub">{counts.paid} facture{counts.paid > 1 ? 's' : ''} payée{counts.paid > 1 ? 's' : ''}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: 'var(--gold, #D4A843)' }}>◐</div>
          <div className="admin-stat-value" style={{ color: 'var(--gold, #D4A843)' }}>${totalDue.toLocaleString()}</div>
          <div className="admin-stat-label">En attente</div>
          <div className="admin-stat-sub">{counts.sent + counts.unpaid} facture{counts.sent + counts.unpaid > 1 ? 's' : ''}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: 'var(--primary)' }}>◐</div>
          <div className="admin-stat-value" style={{ color: 'var(--primary)' }}>${(totalPaid + totalDue).toLocaleString()}</div>
          <div className="admin-stat-label">Volume total</div>
          <div className="admin-stat-sub">{invoices.length} facture{invoices.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['all', 'sent', 'paid', 'unpaid', 'cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px', borderRadius: 50, border: '1px solid',
            borderColor: filter === s ? 'var(--primary)' : 'var(--card-border)',
            background:  filter === s ? 'rgba(108,99,255,0.1)' : 'transparent',
            color:       filter === s ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}>
            {s === 'all' ? 'Toutes' : STATUS_LABELS[s]} ({counts[s as keyof typeof counts] ?? invoices.length})
          </button>
        ))}
      </div>
      {services.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterService('all')} style={chipStyle(filterService === 'all')}>Tous services</button>
          {services.map(s => (
            <button key={s} onClick={() => setFilterService(s)} style={chipStyle(filterService === s)}>
              {SERVICE_TYPE_LABELS[s] || s}
            </button>
          ))}
        </div>
      )}

      {/* ── Tableau ── */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucune facture.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="lead-table">
            <thead>
              <tr><th>N°</th><th>Client</th><th>Service</th><th>Montant</th><th>Abonnement</th><th>Échéance</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id || inv.invoice_number}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.invoice_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inv.client_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.client_email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(inv.service_type || 'autre').split(',').map(s => (
                        <span key={s} style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50,
                          background: 'rgba(108,99,255,0.12)', color: 'var(--primary)',
                        }}>
                          {SERVICE_TYPE_LABELS[s] || s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: inv.status === 'paid' ? '#22C55E' : 'var(--text)' }}>
                    ${inv.amount?.toLocaleString()} {(inv.currency || 'USD').toUpperCase()}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {inv.subscription_type === 'annual' ? 'Annuel' : inv.subscription_type === 'monthly' ? 'Mensuel' : '—'}
                    {inv.subscription_end && <div>jusqu'au {new Date(inv.subscription_end).toLocaleDateString('fr-FR')}</div>}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[inv.status] || 'status-new'}`}>
                      {STATUS_LABELS[inv.status] || inv.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {(inv.status === 'sent' || inv.status === 'unpaid') && (
                        <button onClick={() => markPaid(inv.invoice_number)}
                          style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: '#22C55E', padding: 0, textAlign: 'left' }}>
                          ✓ Marquer payée
                        </button>
                      )}
                      {inv.status === 'unpaid' && (
                        <button onClick={() => sendReminder(inv.invoice_number)} disabled={reminding === inv.invoice_number}
                          style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left',
                            color: remindOk === inv.invoice_number ? '#22C55E' : 'var(--gold, #D4A843)' }}>
                          {reminding === inv.invoice_number ? '...' : remindOk === inv.invoice_number ? '✓ Relance envoyée' : '↻ Relancer le client'}
                        </button>
                      )}
                      <button onClick={() => resendInvoice(inv.invoice_number)} disabled={resending === inv.invoice_number}
                        style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left',
                          color: resendOk === inv.invoice_number ? '#22C55E' : 'var(--text-muted)' }}>
                        {resending === inv.invoice_number ? '...' : resendOk === inv.invoice_number ? '✓ PDF envoyé' : '↗ Renvoyer PDF'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════ MODAL CRÉER FACTURE ════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 580, margin: '24px auto' }}>

            {created ? (
              /* ── Succès ── */
              <>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: '#22C55E' }}>Facture {created} créée</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                    La facture PDF a été générée et envoyée par email au client.
                  </p>
                  <button className="btn btn-primary" onClick={closeModal} style={{ minWidth: 160 }}>Fermer</button>
                </div>
              </>
            ) : (
              /* ── Formulaire ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Nouvelle facture</h2>
                  {fromQuote && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                      ↳ Depuis {fromQuote}
                    </span>
                  )}
                </div>

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── Recherche client unifiée ── */}
                  <div>
                    <label style={labelStyle}>Client *</label>

                    {/* Client sélectionné */}
                    {form.client_email ? (
                      <div style={{ background: 'var(--dark-3)', border: '1.5px solid var(--primary)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{form.client_name || '—'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: 2 }}>
                            {form.client_email} · <span style={{ color: 'var(--text-faint)' }}>Facture envoyée à cet email</span>
                          </div>
                        </div>
                        <button type="button" onClick={resetClient}
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>✕</button>
                      </div>
                    ) : (
                      /* Champ de recherche */
                      <div style={{ position: 'relative' }}>
                        <input
                          style={{ ...inputStyle, paddingRight: 40 }}
                          placeholder="Rechercher par nom ou email..."
                          value={searchEmail}
                          onChange={e => handleEmailSearch(e.target.value)}
                          onFocus={() => searchResults.length > 0 && setShowResults(true)}
                          autoComplete="off"
                        />
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '0.9rem', pointerEvents: 'none' }}>
                          ⌕
                        </span>

                        {/* Résultats */}
                        {showResults && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                            {searchResults.length === 0 ? (
                              <div style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Aucun client trouvé —{' '}
                                <button type="button" onClick={() => { setShowResults(false); setForm(f => ({ ...f, client_email: searchEmail })); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                                  Saisir manuellement
                                </button>
                              </div>
                            ) : (
                              <>
                                {searchResults.map((r, i) => (
                                  <button key={i} type="button" onClick={() => selectClient(r)}
                                    style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{r.name}</div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.email}</div>
                                    </div>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: 'rgba(108,99,255,0.15)', color: 'var(--primary)', flexShrink: 0 }}>
                                      {r.source}
                                    </span>
                                  </button>
                                ))}
                                <button type="button"
                                  onClick={() => { setShowResults(false); setForm(f => ({ ...f, client_email: searchEmail, client_name: searchEmail })); }}
                                  style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  + Utiliser "{searchEmail}" comme nouveau client
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Nom + Email éditables si sélectionné ── */}
                  {form.client_email && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Nom sur la facture</label>
                        <input style={inputStyle} placeholder="Nom affiché" value={form.client_name}
                          onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} required />
                      </div>
                      <div>
                        <label style={labelStyle}>Email <span style={{ color: 'var(--primary)' }}>← envoi facture</span></label>
                        <input style={{ ...inputStyle, borderColor: 'var(--primary)' }} type="email" value={form.client_email}
                          onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} required />
                      </div>
                    </div>
                  )}

                  {/* ── Types de service (multi-sélection) ── */}
                  <div>
                    <label style={labelStyle}>Services facturés</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {([
                        { v: 'site_web',  l: 'Site web'        },
                        { v: 'agent_ia',  l: 'Agent IA'        },
                        { v: 'carte_nfc', l: 'Carte NFC'       },
                        { v: 'autre',     l: 'Autre / Devis'   },
                      ]).map(({ v, l }) => {
                        const active = form.service_types.includes(v);
                        return (
                          <button key={v} type="button"
                            onClick={() => setForm(f => ({
                              ...f,
                              service_types: active
                                ? f.service_types.filter(s => s !== v)
                                : [...f.service_types, v],
                            }))}
                            style={{
                              padding: '7px 16px', borderRadius: 50, border: '1.5px solid', cursor: 'pointer',
                              borderColor: active ? 'var(--primary)' : 'var(--card-border)',
                              background:  active ? 'rgba(108,99,255,0.15)' : 'var(--dark-3)',
                              color:       active ? 'var(--primary)' : 'var(--text-muted)',
                              fontWeight:  active ? 700 : 400,
                              fontSize: '0.83rem',
                            }}>
                            {active ? '✓ ' : ''}{l}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Devise ── */}
                  <div>
                    <label style={labelStyle}>Devise du client</label>
                    <select style={inputStyle} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    {form.currency !== 'USD' && formTotal > 0 && (() => {
                      const cur = CURRENCIES.find(c => c.code === form.currency)!;
                      return (
                        <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Équivalent approx. : <strong style={{ color: 'var(--secondary)' }}>{convertAmount(formTotal, cur.rate)} {form.currency}</strong>
                          <span style={{ color: 'var(--text-faint)', marginLeft: 6 }}>(taux de référence · 1 USD = {cur.rate} {form.currency})</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* ── Abonnement ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Type facturation</label>
                      <select style={inputStyle} value={form.subscription_type} onChange={e => setForm(f => ({ ...f, subscription_type: e.target.value }))}>
                        <option value="one_time">Paiement unique</option>
                        <option value="monthly">Abonnement mensuel</option>
                        <option value="annual">Abonnement annuel</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Échéance paiement</label>
                      <input style={inputStyle} type="date" value={form.due_date}
                        onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                    </div>
                  </div>

                  {form.subscription_type !== 'one_time' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Début période</label>
                        <input style={inputStyle} type="date" value={form.subscription_start}
                          onChange={e => setForm(f => ({ ...f, subscription_start: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>Fin période</label>
                        <input style={inputStyle} type="date" value={form.subscription_end}
                          onChange={e => setForm(f => ({ ...f, subscription_end: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  {/* ── Lignes de facturation ── */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Lignes de facturation *</label>
                      <button type="button" onClick={() => setShowCatalog(v => !v)}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {showCatalog ? '▲ Masquer catalogue' : '▼ Choisir depuis le catalogue'}
                      </button>
                    </div>

                    {/* Catalogue */}
                    {showCatalog && (
                      <div style={{ background: 'var(--dark-3)', borderRadius: 10, padding: 14, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {CATALOG.map(cat => (
                          <div key={cat.category}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                              {cat.category}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {cat.items.map(item => (
                                <button key={item.label} type="button"
                                  onClick={() => addCatalogItem(item.label, item.amount, item.billing)}
                                  style={{
                                    padding: '5px 12px', borderRadius: 50, border: '1px solid var(--card-border)',
                                    background: 'var(--dark-2)', color: 'var(--text)', cursor: 'pointer',
                                    fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6,
                                  }}>
                                  {item.label}
                                  {item.amount != null
                                    ? <span style={{ color: 'var(--primary)', fontWeight: 700 }}>${item.amount}{item.note || ''}</span>
                                    : <span style={{ color: 'var(--text-faint)' }}>{item.note}</span>
                                  }
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items saisis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {form.items.map((item, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 110px 28px', gap: 6, alignItems: 'center' }}>
                          <input style={inputStyle} placeholder="Description du service" value={item.description}
                            onChange={e => updateItem(i, 'description', e.target.value)} />
                          <input style={{ ...inputStyle, textAlign: 'right' }} placeholder="0.00" type="number" step="0.01" min="0" value={item.amount}
                            onChange={e => updateItem(i, 'amount', e.target.value)} />
                          <select
                            style={{ ...inputStyle, padding: '10px 6px', fontSize: '0.75rem', cursor: 'pointer',
                              color: item.billing === 'monthly' ? 'var(--secondary)' : item.billing === 'annual' ? 'var(--gold, #D4A843)' : 'var(--text-muted)' }}
                            value={item.billing}
                            onChange={e => updateItemBilling(i, e.target.value as BillingType)}>
                            <option value="one_time">Unique</option>
                            <option value="monthly">Mensuel</option>
                            <option value="annual">Annuel</option>
                          </select>
                          {form.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(i)}
                              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addItem}
                        style={{ background: 'none', border: '1px dashed var(--card-border)', borderRadius: 8, padding: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                        + Ajouter une ligne
                      </button>
                    </div>
                  </div>

                  {/* Totaux */}
                  {formTotal > 0 && (
                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Détail si mix de types */}
                      {(formOneTime > 0 && (formMonthly > 0 || formAnnual > 0)) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8, borderBottom: '1px dashed var(--card-border)' }}>
                          {formOneTime > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>Paiements uniques</span>
                              <span>${formOneTime.toFixed(2)}</span>
                            </div>
                          )}
                          {formMonthly > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>Abonnements mensuels (×1)</span>
                              <span>${formMonthly.toFixed(2)}</span>
                            </div>
                          )}
                          {formAnnual > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>Abonnements annuels (×1)</span>
                              <span>${formAnnual.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Total */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Total cette facture</span>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>${formTotal.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 400 }}>USD</span></span>
                      </div>

                      {/* Récurrent mensuel */}
                      {formMonthly > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(62,207,207,0.07)', border: '1px solid rgba(62,207,207,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>↻ À renouveler le mois prochain</span>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--secondary)' }}>${formMonthly.toFixed(2)}/mois</span>
                        </div>
                      )}

                      {/* Récurrent annuel */}
                      {formAnnual > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--gold, #D4A843)' }}>↻ À renouveler dans 1 an</span>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold, #D4A843)' }}>${formAnnual.toFixed(2)}/an</span>
                        </div>
                      )}
                    </div>
                  )}

                  {formError && <p style={{ color: 'var(--accent)', fontSize: '0.82rem', margin: 0 }}>{formError}</p>}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" className="btn btn-outline" onClick={closeModal} style={{ flex: 1 }}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2 }}>
                      {saving ? 'Création en cours...' : 'Créer & envoyer par email'}
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

/* ─── Helpers styles ─────────────────────────────────────── */
function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '5px 14px', borderRadius: 50, border: '1px solid',
    borderColor: active ? 'var(--secondary)' : 'var(--card-border)',
    background:  active ? 'rgba(62,207,207,0.1)' : 'transparent',
    color:       active ? 'var(--secondary)' : 'var(--text-muted)',
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--dark-3)', border: '1px solid var(--card-border)',
  borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
};
