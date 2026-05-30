'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type UnifiedLead = {
  id: string;
  source: 'site' | 'agent';
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  budget: string | null;
  message: string | null;
  lang: string | null;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  client_id: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<UnifiedLead['status'], string> = {
  new: 'Nouveau', contacted: 'Contacté', converted: 'Converti', lost: 'Perdu',
};

function normalizeAgentStatus(s: string): UnifiedLead['status'] {
  if (s === 'relance_sent' || s === 'contacted') return 'contacted';
  if (s === 'converted') return 'converted';
  if (s === 'lost') return 'lost';
  return 'new';
}

export default function LeadsPage() {
  const [leads, setLeads]         = useState<UnifiedLead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<UnifiedLead['status'] | 'all'>('all');
  const [sourceFilter, setSource] = useState<'all' | 'site' | 'agent'>('all');

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true);
    const [siteRes, agentRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('agent_leads').select('*').order('created_at', { ascending: false }),
    ]);

    const siteLeads: UnifiedLead[] = (siteRes.data || []).map(l => ({
      id: l.id, source: 'site',
      name: l.name, email: l.email, phone: null,
      subject: l.subject, budget: l.budget, message: l.message, lang: l.lang,
      status: l.status, client_id: null, created_at: l.created_at,
    }));

    const agentLeads: UnifiedLead[] = (agentRes.data || []).map(l => ({
      id: l.id, source: 'agent',
      name: l.email || l.phone || `Lead #${String(l.id).slice(0, 6)}`,
      email: l.email || null, phone: l.phone || null,
      subject: l.channel || null, budget: null,
      message: l.interest || null, lang: null,
      status: normalizeAgentStatus(l.status || 'new'),
      client_id: l.client_id || null, created_at: l.created_at,
    }));

    const all = [...siteLeads, ...agentLeads].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setLeads(all);
    setLoading(false);
  }

  async function updateStatus(lead: UnifiedLead, status: UnifiedLead['status']) {
    if (lead.source === 'site') {
      await supabase.from('leads').update({ status }).eq('id', lead.id);
    } else {
      const agentStatus = status === 'contacted' ? 'relance_sent' : status;
      await supabase.from('agent_leads').update({ status: agentStatus }).eq('id', lead.id);
    }
    setLeads(prev => prev.map(l =>
      l.id === lead.id && l.source === lead.source ? { ...l, status } : l
    ));
  }

  const filtered = leads.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
    return true;
  });

  const counts = {
    all:       leads.length,
    new:       leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost:      leads.filter(l => l.status === 'lost').length,
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Leads</h1>
          <p className="admin-subtitle">
            {leads.length} leads au total ·{' '}
            {leads.filter(l => l.source === 'site').length} site web ·{' '}
            {leads.filter(l => l.source === 'agent').length} Agent IA
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchLeads} style={{ fontSize: '0.82rem' }}>
          ↻ Actualiser
        </button>
      </div>

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['all', 'new', 'contacted', 'converted', 'lost'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={chipStyle(filter === s)}>
            {s === 'all' ? 'Tous' : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Filtres source */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {([['all', 'Toutes sources'], ['site', 'Site web'], ['agent', 'Agent IA']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setSource(v)} style={chipStyle(sourceFilter === v, true)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucun lead.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="lead-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Nom / Contact</th>
                <th>Email</th>
                <th>Sujet / Canal</th>
                <th>Budget</th>
                <th>Message</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={`${lead.source}-${lead.id}`}>
                  {/* Source badge */}
                  <td>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 50,
                      background: lead.source === 'agent' ? 'rgba(167,139,250,0.15)' : 'rgba(62,207,207,0.12)',
                      color: lead.source === 'agent' ? '#A78BFA' : 'var(--secondary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {lead.source === 'agent'
                        ? `Agent IA${lead.client_id ? ` · ${lead.client_id}` : ''}`
                        : 'Site web'}
                    </span>
                  </td>

                  {/* Nom */}
                  <td style={{ fontWeight: 600 }}>
                    {lead.name}
                    {lead.phone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {lead.phone}
                      </div>
                    )}
                  </td>

                  {/* Email */}
                  <td>
                    {lead.email
                      ? <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary)' }}>{lead.email}</a>
                      : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                  </td>

                  {/* Sujet / Canal */}
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {lead.subject || '—'}
                  </td>

                  {/* Budget */}
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {lead.budget || '—'}
                  </td>

                  {/* Message */}
                  <td style={{
                    color: 'var(--text-muted)', fontSize: '0.82rem',
                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {lead.message || '—'}
                  </td>

                  {/* Date */}
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                  </td>

                  {/* Statut */}
                  <td>
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead, e.target.value as UnifiedLead['status'])}
                      className={`status-badge status-${lead.status}`}
                      style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                    >
                      {(['new', 'contacted', 'converted', 'lost'] as const).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>

                  {/* Action */}
                  <td>
                    {lead.email && (
                      <Link href={`/admin/devis?name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email)}`}>
                        <button style={{ fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: 'none', border: '1px solid var(--card-border)', borderRadius: 6, padding: '4px 10px', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          + Devis
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function chipStyle(active: boolean, small = false): React.CSSProperties {
  return {
    padding: small ? '5px 12px' : '7px 16px',
    borderRadius: 50, border: '1px solid', cursor: 'pointer',
    borderColor: active ? 'var(--primary)' : 'var(--card-border)',
    background:  active ? 'rgba(108,99,255,0.1)' : 'transparent',
    color:       active ? 'var(--primary)' : 'var(--text-muted)',
    fontSize: '0.82rem', fontWeight: 600,
  };
}
