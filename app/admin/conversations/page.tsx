'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Conversation = {
  id: string;
  client_id: string;
  channel: string;
  messages: { role: string; content: string }[];
  created_at: string;
  updated_at: string;
};

type AgentClient = { client_id: string; business_name: string };

const CHANNEL_LABELS: Record<string, string> = {
  chat: 'Chat', whatsapp: 'WhatsApp', messenger: 'Messenger', voice: 'Voix', instagram: 'Instagram',
};
const CHANNEL_COLORS: Record<string, string> = {
  chat: 'var(--primary)', whatsapp: '#22C55E', messenger: '#2563EB',
  voice: 'var(--gold)', instagram: '#E1306C',
};

const PAGE_SIZE = 50;

export default function ConversationsPage() {
  const [convs, setConvs]         = useState<Conversation[]>([]);
  const [clients, setClients]     = useState<AgentClient[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterClient, setFilterClient] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [page, setPage]           = useState(0);
  const [total, setTotal]         = useState(0);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchConvs(0, filterClient, filterChannel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClient, filterChannel]);

  async function fetchConvs(p: number, client = filterClient, channel = filterChannel) {
    setLoading(true);
    setPage(p);
    setExpanded(null);
    const from = p * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;
    let query = supabase
      .from('conversations')
      .select('id, client_id, channel, messages, created_at, updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);
    if (client !== 'all')  query = query.eq('client_id', client);
    if (channel !== 'all') query = query.eq('channel', channel);
    const { data, count } = await query;
    setConvs(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function fetchClients() {
    const res  = await fetch('/api/admin-agent?path=admin/clients-list');
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
  }

  const filtered = convs;

  const channels = [...new Set(convs.map(c => c.channel))];
  const clientName = (id: string) => clients.find(c => c.client_id === id)?.business_name || id;

  function firstMsg(conv: Conversation) {
    const msgs = Array.isArray(conv.messages) ? conv.messages : [];
    const first = msgs.find(m => m.role === 'user');
    return first?.content?.slice(0, 80) || '—';
  }

  function msgCount(conv: Conversation) {
    return Array.isArray(conv.messages) ? conv.messages.length : 0;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Conversations</h1>
          <p className="admin-subtitle">
            {total} au total · page {page + 1}/{Math.ceil(total / PAGE_SIZE) || 1}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => fetchConvs(page, filterClient, filterChannel)} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <select style={selectStyle} value={filterClient} onChange={e => setFilterClient(e.target.value)}>
          <option value="all">Tous les clients</option>
          {clients.map(c => <option key={c.client_id} value={c.client_id}>{c.business_name}</option>)}
        </select>
        <select style={selectStyle} value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
          <option value="all">Tous les canaux</option>
          {Object.entries(CHANNEL_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucune conversation.</p>
      ) : (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(conv => (
            <div key={conv.id} style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {/* Ligne résumé */}
              <div
                onClick={() => setExpanded(expanded === conv.id ? null : conv.id)}
                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
              >
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                  background: `${CHANNEL_COLORS[conv.channel] || 'var(--primary)'}20`,
                  color: CHANNEL_COLORS[conv.channel] || 'var(--primary)',
                  flexShrink: 0,
                }}>
                  {CHANNEL_LABELS[conv.channel] || conv.channel}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--secondary)', flexShrink: 0 }}>
                  {clientName(conv.client_id)}
                </span>
                <span style={{ flex: 1, fontSize: '0.83rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {firstMsg(conv)}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', flexShrink: 0 }}>
                  {msgCount(conv)} msg · {new Date(conv.updated_at || conv.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem', flexShrink: 0 }}>
                  {expanded === conv.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Messages dépliés */}
              {expanded === conv.id && (
                <div style={{ borderTop: '1px solid var(--card-border)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                  {(Array.isArray(conv.messages) ? conv.messages : []).map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50, flexShrink: 0, marginTop: 2,
                        background: msg.role === 'user' ? 'rgba(108,99,255,0.12)' : 'rgba(62,207,207,0.12)',
                        color: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)',
                      }}>
                        {msg.role === 'user' ? 'Visiteur' : 'Agent'}
                      </span>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <button
              onClick={() => fetchConvs(page - 1, filterClient, filterChannel)}
              disabled={page === 0 || loading}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'transparent', color: page === 0 ? 'var(--text-faint)' : 'var(--text)', cursor: page === 0 ? 'default' : 'pointer', fontSize: '0.85rem' }}
            >
              ← Précédent
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} / {total}
            </span>
            <button
              onClick={() => fetchConvs(page + 1, filterClient, filterChannel)}
              disabled={(page + 1) * PAGE_SIZE >= total || loading}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'transparent', color: (page + 1) * PAGE_SIZE >= total ? 'var(--text-faint)' : 'var(--text)', cursor: (page + 1) * PAGE_SIZE >= total ? 'default' : 'pointer', fontSize: '0.85rem' }}
            >
              Suivant →
            </button>
          </div>
        )}
        </>
      )}
    </>
  );
}

const selectStyle: React.CSSProperties = {
  background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 8,
  padding: '8px 14px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer',
};
