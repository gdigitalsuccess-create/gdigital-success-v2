'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import MiniCardPreview from './MiniCardPreview';

type Profile = {
  id: string;
  slug: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  description: string;
  photo_url: string;
  cover_url: string;
  linkedin: string;
  twitter: string;
  allow_custom_cover: boolean;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  font_heading: string;
  logo_url: string;
  team_owner_id: string;
};

type Props = { profile: Profile };

const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 };
const sectionStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', marginBottom: 16 };

export default function MemberDashboard({ profile: initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState({
    name: initialProfile.name ?? '',
    title: initialProfile.title ?? '',
    phone: initialProfile.phone ?? '',
    email: initialProfile.email ?? '',
    description: initialProfile.description ?? '',
    linkedin: initialProfile.linkedin ?? '',
    twitter: initialProfile.twitter ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from('carte_profiles')
      .update({
        name: form.name,
        title: form.title,
        phone: form.phone,
        email: form.email,
        description: form.description,
        linkedin: form.linkedin || null,
        twitter: form.twitter || null,
      })
      .eq('id', profile.id);
    setSaving(false);
    if (error) setMsg({ text: 'Erreur : ' + error.message, type: 'error' });
    else setMsg({ text: 'Modifications enregistrées.', type: 'success' });
  }

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop();
    const path = `${profile.slug}/photo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('carte-images').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('carte-images').getPublicUrl(path);
      await supabase.from('carte_profiles').update({ photo_url: data.publicUrl }).eq('id', profile.id);
      setProfile(p => ({ ...p, photo_url: data.publicUrl }));
    }
    setUploadingPhoto(false);
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    const ext = file.name.split('.').pop();
    const path = `${profile.slug}/cover-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('carte-images').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('carte-images').getPublicUrl(path);
      const token = await getToken();
      await fetch('/api/carte/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: profile.id, cover_url: data.publicUrl }),
      });
      setProfile(p => ({ ...p, cover_url: data.publicUrl }));
    }
    setUploadingCover(false);
  }

  async function handlePasswordChange() {
    if (!pwd.current || !pwd.next || !pwd.confirm) { setPwdMsg('Tous les champs sont requis.'); return; }
    if (pwd.next !== pwd.confirm) { setPwdMsg('Les mots de passe ne correspondent pas.'); return; }
    if (pwd.next.length < 6) { setPwdMsg('Minimum 6 caractères.'); return; }
    setSavingPwd(true);
    setPwdMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    setSavingPwd(false);
    if (error) setPwdMsg('Erreur : ' + error.message);
    else { setPwdMsg('Mot de passe mis à jour.'); setPwd({ current: '', next: '', confirm: '' }); }
  }

  const theme = { bg_color: profile.bg_color, primary_color: profile.primary_color, secondary_color: profile.secondary_color, text_color: profile.text_color, font_heading: profile.font_heading };

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D1A', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <img src="/logo-gdigital.png" alt="G+Digital" style={{ height: 28 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`/c/${profile.slug}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9999, background: 'rgba(0,207,255,0.1)', border: '1px solid rgba(0,207,255,0.3)', color: '#00CFFF', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
            Voir ma carte ↗
          </a>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            style={{ padding: '8px 14px', borderRadius: 9999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Colonne gauche — formulaires */}
        <div>
          {msg && (
            <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`, color: msg.type === 'success' ? '#22C55E' : '#F87171', fontSize: '0.85rem' }}>
              {msg.text}
            </div>
          )}

          {/* Photo de profil */}
          <div style={sectionStyle}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 14px' }}>Photo de profil</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                {profile.photo_url
                  ? <img src={profile.photo_url} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" width="28" height="28"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>}
              </div>
              <div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                <button onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                  style={{ padding: '8px 16px', borderRadius: 9999, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.35)', color: '#A78BFA', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  {uploadingPhoto ? 'Upload...' : 'Changer la photo'}
                </button>
              </div>
            </div>
          </div>

          {/* Infos personnelles */}
          <div style={sectionStyle}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 14px' }}>Informations personnelles</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Prénom / Nom</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Poste / Titre</label>
                  <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Téléphone direct</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Email professionnel</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bio / Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Réseaux personnels */}
          <div style={sectionStyle}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 14px' }}>Réseaux personnels</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>LinkedIn</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 8px', fontSize: '0.7rem', color: '#0A66C2', fontWeight: 700 }}>in/</span>
                  <input style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }} placeholder="votre-profil" value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>X (Twitter)</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 8px', fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 700 }}>@</span>
                  <input style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }} placeholder="votre-handle" value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Cover personnalisée — si autorisée */}
          {profile.allow_custom_cover && (
            <div style={sectionStyle}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 6px' }}>Photo de couverture</p>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 14px' }}>Votre manager vous a autorisé à personnaliser votre couverture.</p>
              {profile.cover_url && (
                <img src={profile.cover_url} alt="cover" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,0.08)' }} />
              )}
              <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
              <button onClick={() => coverRef.current?.click()} disabled={uploadingCover}
                style={{ padding: '8px 16px', borderRadius: 9999, background: 'rgba(0,207,255,0.1)', border: '1px solid rgba(0,207,255,0.3)', color: '#00CFFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                {uploadingCover ? 'Upload...' : (profile.cover_url ? 'Changer la couverture' : 'Ajouter une couverture')}
              </button>
            </div>
          )}

          {/* Enregistrer */}
          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#6C63FF,#00CFFF)', border: 'none', color: 'white', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', opacity: saving ? 0.7 : 1, marginBottom: 16 }}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>

          {/* Mot de passe */}
          <div style={sectionStyle}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 14px' }}>Changer le mot de passe</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={labelStyle}>Mot de passe actuel</label>
                <input style={inputStyle} type="password" value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Nouveau mot de passe</label>
                  <input style={inputStyle} type="password" value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Confirmer</label>
                  <input style={inputStyle} type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} />
                </div>
              </div>
              {pwdMsg && <p style={{ fontSize: '0.8rem', color: pwdMsg.includes('jour') ? '#22C55E' : '#F87171', margin: 0 }}>{pwdMsg}</p>}
              <button onClick={handlePasswordChange} disabled={savingPwd}
                style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: savingPwd ? 0.7 : 1 }}>
                {savingPwd ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </div>
          </div>
        </div>

        {/* Colonne droite — aperçu carte */}
        <div style={{ position: 'sticky', top: 20 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Aperçu de votre carte</p>
          <MiniCardPreview
            form={{ name: form.name, title: form.title, company: '', phone: form.phone, email: form.email, website: '', location: '', rdv_url: '', instagram: '', tiktok: '', facebook: '', linkedin: form.linkedin, youtube: '', twitter: form.twitter, snapchat: '', telegram: '' }}
            profile={{ photo_url: profile.photo_url, cover_url: profile.cover_url, cover_video_url: '', slug: profile.slug, logo_url: profile.logo_url }}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
