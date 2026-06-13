'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import styles from './dashboard.module.css';
import {
  User as IconUser, Phone, Calendar, Tag, Share2, Globe, MessageCircle,
  CreditCard, Mic, Users, FileText, Image, Video, Bot, Inbox, Bell,
  Mail, Star, Lock, Link, ChevronRight,
} from 'lucide-react';
import MiniCardPreview from './MiniCardPreview';
import MemberDashboard from './MemberDashboard';
import CropModal from './CropModal';

type Profile = {
  id: string;
  slug: string;
  name: string;
  title: string;
  company: string;
  description: string;
  photo_url: string;
  cover_url: string;
  cover_video_url: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  rdv_url: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  twitter: string;
  snapchat: string;
  telegram: string;
  whatsapp_auto_enabled: boolean;
  whatsapp_auto_message: string;
  wave_url: string;
  orange_money_url: string;
  mtn_url: string;
  cinetpay_url: string;
  airtel_money_url: string;
  moov_money_url: string;
  wise_url: string;
  paypal_url: string;
  voice_message_url: string;
  voice_message_enabled: boolean;
  voice_message_text: string;
  card_language: string;
  plan: string;
  ai_instructions: string;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  font_heading: string;
  logo_url: string;
  team_owner_id: string | null;
  allow_custom_cover: boolean;
};

type Doc = {
  id: string;
  name: string;
  url: string;
  type: string;
  position: number;
};

type PortfolioItem = {
  id: string;
  photo_url: string;
  caption: string;
  position: number;
};

type LeadItem = {
  id: string;
  visitor_name: string;
  visitor_phone: string | null;
  visitor_email: string | null;
  message: string | null;
  created_at: string;
};

const PORTFOLIO_LIMITS: Record<string, number> = {
  starter: 6,
  pro: 12,
  business: 999,
};

type VideoItem = {
  id: string;
  type: string;
  url: string;
  platform?: string;
  caption: string;
  position: number;
};

type CustomLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  position: number;
};

type TeamMember = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
  photo_url: string | null;
  cover_url: string | null;
  linkedin: string | null;
  twitter: string | null;
  allow_custom_cover: boolean;
};

function slugifyMember(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

const MEMBER_COLORS = ['#6C63FF', '#00CFFF', '#D4A843', '#F87171', '#22C55E', '#F59E0B'];
function memberColor(name: string) { return MEMBER_COLORS[name.charCodeAt(0) % MEMBER_COLORS.length]; }

const TEAM_LIMITS: Record<string, number> = { pro: 2, business: 5, business_team: 10 };

const VIDEO_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 2,
  business: 5,
};

const PLATFORM_ICONS: Record<string, string> = {
  youtube:   '#FF0000',
  tiktok:    '#010101',
  facebook:  '#1877F2',
  instagram: 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)',
};

function detectVideoPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('instagram.com')) return 'instagram';
  return 'lien';
}

const EMPTY_FORM = {
  name: '', title: '', company: '', description: '',
  phone: '', email: '', website: '', location: '', rdv_url: '',
  instagram: '', tiktok: '', facebook: '', linkedin: '', youtube: '', twitter: '', snapchat: '', telegram: '',
  whatsapp_auto_enabled: false,
  whatsapp_auto_message: '',
  wave_url: '',
  orange_money_url: '',
  mtn_url: '',
  cinetpay_url: '',
  airtel_money_url: '',
  moov_money_url: '',
  wise_url: '',
  paypal_url: '',
  voice_message_url: '',
  voice_message_enabled: false,
  voice_message_text: '',
  card_language: 'fr',
  ai_instructions: '',
  label_rdv: '', label_documents: '', label_videos: '', portfolio_title: '',
};

const DOC_TYPES = ['pdf', 'brochure', 'catalogue', 'menu'] as const;

const DOC_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  pdf:       { bg: 'rgba(248,113,113,0.12)', color: '#F87171' },
  brochure:  { bg: 'rgba(108,99,255,0.12)',  color: '#A78BFA' },
  catalogue: { bg: 'rgba(0,207,255,0.12)',   color: '#00CFFF' },
  menu:      { bg: 'rgba(212,168,67,0.12)', color: '#D4A843' },
};

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  starter:       { bg: 'rgba(108,99,255,0.15)',  color: '#A78BFA' },
  pro:           { bg: 'rgba(0,207,255,0.15)',   color: '#00CFFF' },
  business:      { bg: 'rgba(212,168,67,0.15)', color: '#D4A843' },
  business_team: { bg: 'rgba(34,197,94,0.15)',  color: '#22C55E' },
};

function generateSignatureHTML(profile: Profile): string {
  const socials: { label: string; url: string; bg: string }[] = [];
  if (profile.instagram) socials.push({ label: 'Instagram', url: `https://instagram.com/${profile.instagram}`, bg: '#E1306C' });
  if (profile.linkedin)  socials.push({ label: 'LinkedIn',  url: `https://linkedin.com/in/${profile.linkedin}`, bg: '#0A66C2' });
  if (profile.facebook)  socials.push({ label: 'Facebook',  url: `https://facebook.com/${profile.facebook}`, bg: '#1877F2' });
  if (profile.tiktok)    socials.push({ label: 'TikTok',    url: `https://tiktok.com/@${profile.tiktok}`, bg: '#010101' });
  if (profile.youtube)   socials.push({ label: 'YouTube',   url: `https://youtube.com/@${profile.youtube}`, bg: '#FF0000' });
  if (profile.twitter)   socials.push({ label: 'X',         url: `https://twitter.com/${profile.twitter}`, bg: '#000000' });
  if (profile.snapchat)  socials.push({ label: 'Snapchat',  url: `https://snapchat.com/add/${profile.snapchat}`, bg: '#FFFC00' });
  if (profile.telegram)  socials.push({ label: 'Telegram',  url: `https://t.me/${profile.telegram}`, bg: '#2AABEE' });

  const photoHtml = profile.photo_url
    ? `<td style="padding-right:20px;vertical-align:top;padding-top:4px"><img src="${profile.photo_url}" width="80" height="80" alt="${profile.name}" style="border-radius:50%;display:block;width:80px;height:80px;object-fit:cover;border:2px solid #D4A843" /></td>`
    : '';

  const titleLine = [profile.title, profile.company].filter(Boolean).join(' · ');
  const socialsHtml = socials.length > 0
    ? `<tr><td style="padding-top:8px">${socials.map(s => `<a href="${s.url}" style="display:inline-block;background:${s.bg};color:#ffffff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;text-decoration:none;margin-right:4px;font-family:Arial,sans-serif">${s.label}</a>`).join('')}</td></tr>`
    : '';

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#333333">
<tr>
  ${photoHtml}
  <td style="vertical-align:top;border-left:3px solid #1B3464;padding-left:16px">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-size:16px;font-weight:700;color:#1B3464;padding-bottom:2px;font-family:Arial,sans-serif"><strong>${profile.name}</strong></td></tr>
      ${titleLine ? `<tr><td style="font-size:12px;color:#666666;padding-bottom:8px;font-family:Arial,sans-serif">${titleLine}</td></tr>` : ''}
      ${profile.phone ? `<tr><td style="font-size:12px;color:#333333;padding-bottom:2px;font-family:Arial,sans-serif">📞 <a href="tel:${profile.phone}" style="color:#333333;text-decoration:none">${profile.phone}</a></td></tr>` : ''}
      ${profile.email ? `<tr><td style="font-size:12px;color:#333333;padding-bottom:2px;font-family:Arial,sans-serif">✉️ <a href="mailto:${profile.email}" style="color:#1B3464;text-decoration:none">${profile.email}</a></td></tr>` : ''}
      ${profile.website ? `<tr><td style="font-size:12px;padding-bottom:8px;font-family:Arial,sans-serif">🌐 <a href="${profile.website}" style="color:#1B3464;text-decoration:none">${profile.website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
      ${socialsHtml}
      <tr><td style="padding-top:8px;border-top:1px solid #eeeeee;font-size:10px;color:#aaaaaa;font-family:Arial,sans-serif"><a href="https://digitalsucces.tech/c/${profile.slug}" style="color:#aaaaaa;text-decoration:none">Carte digitale · G+Digital Success</a></td></tr>
    </table>
  </td>
</tr>
</table>`;
}

export default function DashboardPage() {
  const [loading, setLoading]         = useState(true);
  const [user, setUser]               = useState<User | null>(null);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingCoverVideo, setUploadingCoverVideo] = useState(false);
  const [cropState, setCropState] = useState<{ file: File; type: 'photo' | 'cover' } | null>(null);

  // Documents state
  const [docs, setDocs]               = useState<Doc[]>([]);
  const [newDocFile, setNewDocFile]   = useState<File | null>(null);
  const [newDocName, setNewDocName]   = useState('');
  const [newDocType, setNewDocType]   = useState<string>('pdf');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Upgrade plan state
  const [upgradeTarget, setUpgradeTarget]   = useState<string | null>(null);
  const [requestingUpgrade, setRequestingUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg]         = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active section (tab navigation)
  const [activeSection, setActiveSection] = useState('section-profil');
  const FORM_SECTIONS = new Set(['section-profil','section-contact','section-rdv','section-labels','section-socials','section-agent-ia','section-whatsapp','section-paiement','section-vocal']);
  const PREVIEW_SECTIONS = new Set(['section-profil','section-contact','section-rdv','section-labels','section-socials','section-liens','section-agent-ia']);

  // Password change state
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Videos state
  const [videos, setVideos]                     = useState<VideoItem[]>([]);
  const [videoUrl, setVideoUrl]                 = useState('');
  const [videoCaption, setVideoCaption]         = useState('');
  const [videoFile, setVideoFile]               = useState<File | null>(null);
  const [addingVideo, setAddingVideo]           = useState(false);
  const [uploadingVideo, setUploadingVideo]     = useState(false);
  const [deletingVideoId, setDeletingVideoId]   = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice]     = useState(false);
  const [generatingVoice, setGeneratingVoice]   = useState(false);
  const [voiceType, setVoiceType]               = useState<'female'|'male'>('female');

  // Portfolio state
  const [portfolio, setPortfolio]                   = useState<PortfolioItem[]>([]);
  const [portfolioPhotoFile, setPortfolioPhotoFile] = useState<File | null>(null);
  const [portfolioCaption, setPortfolioCaption]     = useState('');
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(null);

  // Push notifications state (Pro/Business)
  const [pushTitle, setPushTitle]         = useState('');
  const [pushBody, setPushBody]           = useState('');
  const [sendingPush, setSendingPush]     = useState(false);
  const [pushMsg, setPushMsg]             = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pushSubCount, setPushSubCount]   = useState<number | null>(null);

  // Leads state
  const [leads, setLeads] = useState<LeadItem[]>([]);

  // Chat logs state
  const [chatLogs, setChatLogs] = useState<{ id: string; visitor_message: string; agent_reply: string; is_lead: boolean; created_at: string }[]>([]);

  // Team state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamForm, setTeamForm] = useState({ name: '', title: '', email: '', phone: '', slug: '', linkedin: '', twitter: '' });
  const [savingTeam, setSavingTeam] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [togglingMemberId, setTogglingMemberId] = useState<string | null>(null);
  const [uploadingCoverForId, setUploadingCoverForId] = useState<string | null>(null);
  const memberCoverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploadTargetId, setCoverUploadTargetId] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<Record<string, { visits: number; leads: number }>>({});

  // Signature state
  const [sigCopied, setSigCopied] = useState(false);
  const [installRequested, setInstallRequested] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);

  // Custom links state
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('🔗');
  const [addingLink, setAddingLink] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<{ total: number; thisMonth: number; thisWeek: number; daily: { date: string; count: number }[]; mobile: number; desktop: number } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError]       = useState('');
  const [loginLoading, setLoginLoading]   = useState(false);

  const photoInputRef     = useRef<HTMLInputElement>(null);
  const coverInputRef      = useRef<HTMLInputElement>(null);
  const coverVideoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef       = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef     = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/document', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setDocs(Array.isArray(data) ? data as Doc[] : []);
    }
  }, []);

  const fetchVideos = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/video', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setVideos(Array.isArray(data) ? data as VideoItem[] : []);
    }
  }, []);

  const fetchStats = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/stats', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) setStats(await res.json());
  }, []);

  const fetchLeads = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/leads', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLeads(Array.isArray(data) ? data as LeadItem[] : []);
    }
  }, []);

  const fetchTeam = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/team', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTeam(Array.isArray(data) ? data as TeamMember[] : []);
    }
    const resStats = await fetch('/api/carte/team-stats', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (resStats.ok) setTeamStats(await resStats.json());
  }, []);

  const fetchChatLogs = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/chat-logs', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setChatLogs(Array.isArray(data) ? data : []);
    }
  }, []);

  const fetchLinks = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/links', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLinks(Array.isArray(data) ? data as CustomLink[] : []);
    }
  }, []);

  const fetchPushSubCount = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/push/subscribers-count', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setPushSubCount(data.count ?? 0);
    }
  }, []);

  const fetchPortfolio = useCallback(async (token: string) => {
    const res = await fetch('/api/carte/portfolio', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setPortfolio(Array.isArray(data) ? data as PortfolioItem[] : []);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('carte_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setProfile(data as Profile);
      setForm({
        name:            data.name            ?? '',
        title:           data.title           ?? '',
        company:         data.company         ?? '',
        description:     data.description     ?? '',
        phone:           data.phone           ?? '',
        email:           data.email           ?? '',
        website:         data.website         ?? '',
        location:        data.location        ?? '',
        rdv_url:         data.rdv_url         ?? '',
        instagram:       data.instagram       ?? '',
        tiktok:          data.tiktok          ?? '',
        facebook:        data.facebook        ?? '',
        linkedin:        data.linkedin        ?? '',
        youtube:         data.youtube         ?? '',
        twitter:         data.twitter         ?? '',
        snapchat:        data.snapchat        ?? '',
        telegram:               data.telegram               ?? '',
        whatsapp_auto_enabled:  data.whatsapp_auto_enabled  ?? false,
        whatsapp_auto_message:  data.whatsapp_auto_message  ?? '',
        wave_url:               data.wave_url               ?? '',
        orange_money_url:       data.orange_money_url       ?? '',
        mtn_url:                data.mtn_url                ?? '',
        cinetpay_url:           data.cinetpay_url           ?? '',
        airtel_money_url:       data.airtel_money_url       ?? '',
        moov_money_url:         data.moov_money_url         ?? '',
        wise_url:               data.wise_url               ?? '',
        paypal_url:             data.paypal_url             ?? '',
        voice_message_url:      data.voice_message_url      ?? '',
        voice_message_enabled:  data.voice_message_enabled  ?? false,
        voice_message_text:     data.voice_message_text     ?? '',
        card_language:          data.card_language          ?? 'fr',
        ai_instructions:        data.ai_instructions        ?? '',
        label_rdv:        data.label_rdv        ?? '',
        label_documents:  data.label_documents  ?? '',
        label_videos:     data.label_videos     ?? '',
        portfolio_title:  data.portfolio_title  ?? '',
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await Promise.all([
          fetchDocs(session.access_token),
          fetchPortfolio(session.access_token),
          fetchVideos(session.access_token),
          fetchPushSubCount(session.access_token),
          fetchLeads(session.access_token),
          fetchStats(session.access_token),
          fetchLinks(session.access_token),
          fetchTeam(session.access_token),
          fetchChatLogs(session.access_token),
        ]);
      }
    }
    setLoading(false);
  }, [fetchDocs, fetchPortfolio, fetchVideos, fetchLeads, fetchPushSubCount, fetchStats, fetchLinks, fetchTeam, fetchChatLogs]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setDocs([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  async function handleLogin(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) setLoginError('Email ou mot de passe incorrect.');
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handlePasswordChange() {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) { setPwdMsg({ text: 'Remplissez tous les champs.', type: 'error' }); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdMsg({ text: 'Les mots de passe ne correspondent pas.', type: 'error' }); return; }
    if (pwdForm.next.length < 6) { setPwdMsg({ text: 'Minimum 6 caractères.', type: 'error' }); return; }
    setSavingPwd(true);
    setPwdMsg(null);
    // Vérifier le mot de passe actuel
    const { data: { user: u } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: u?.email ?? '', password: pwdForm.current });
    if (signInError) { setSavingPwd(false); setPwdMsg({ text: 'Mot de passe actuel incorrect.', type: 'error' }); return; }
    const { error } = await supabase.auth.updateUser({ password: pwdForm.next });
    setSavingPwd(false);
    if (error) setPwdMsg({ text: 'Erreur : ' + error.message, type: 'error' });
    else { setPwdMsg({ text: 'Mot de passe mis à jour avec succès.', type: 'success' }); setPwdForm({ current: '', next: '', confirm: '' }); }
  }

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from('carte_profiles')
      .update(form)
      .eq('id', profile!.id);
    if (error) {
      setMsg({ text: 'Erreur lors de la sauvegarde.', type: 'error' });
    } else {
      setProfile(prev => prev ? { ...prev, ...form } : prev);
      setMsg({ text: 'Modifications enregistrées !', type: 'success' });
      setTimeout(() => setMsg(null), 4000);
    }
    setSaving(false);
  }

  async function handlePhotoUpload(file: File, type: 'photo' | 'cover') {
    if (!profile) return;
    const setter = type === 'photo' ? setUploadingPhoto : setUploadingCover;
    setter(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${profile.slug}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('carte-images')
      .upload(path, file, { upsert: true });
    if (!error) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;
      const field = type === 'photo' ? 'photo_url' : 'cover_url';
      await supabase.from('carte_profiles').update({ [field]: url }).eq('id', profile.id);
      setProfile(prev => prev ? { ...prev, [field]: url } : prev);
    }
    setter(false);
  }

  async function handleCropConfirm(blob: Blob) {
    if (!cropState) return;
    const type = cropState.type;
    setCropState(null);
    const file = new File([blob], `crop-${type}.jpg`, { type: 'image/jpeg' });
    await handlePhotoUpload(file, type);
  }

  async function handleCoverVideoUpload(file: File) {
    if (!profile) return;
    if (file.size > 20 * 1024 * 1024) {
      setMsg({ text: 'Vidéo trop lourde — 20 Mo maximum.', type: 'error' });
      return;
    }
    setUploadingCoverVideo(true);
    const ext = file.name.split('.').pop() ?? 'mp4';
    const path = `${profile.slug}/cover-video-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('carte-images')
      .upload(path, file, { upsert: true });
    if (!error) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;
      await supabase.from('carte_profiles').update({ cover_video_url: url }).eq('id', profile.id);
      setProfile(prev => prev ? { ...prev, cover_video_url: url } : prev);
    } else {
      setMsg({ text: 'Erreur upload vidéo : ' + error.message, type: 'error' });
    }
    setUploadingCoverVideo(false);
  }

  async function handleVoiceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 15 * 1024 * 1024) {
      setMsg({ text: 'Fichier trop lourd — 15 Mo maximum.', type: 'error' });
      return;
    }
    setUploadingVoice(true);
    const ext = file.name.split('.').pop() ?? 'mp3';
    const path = `${profile.slug}/voice-message.${ext}`;
    const { error } = await supabase.storage
      .from('carte-images')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;
      await supabase.from('carte_profiles').update({ voice_message_url: url }).eq('id', profile.id);
      setProfile(prev => prev ? { ...prev, voice_message_url: url } : prev);
      setForm(f => ({ ...f, voice_message_url: url }));
    } else {
      setMsg({ text: 'Erreur upload : ' + error.message, type: 'error' });
    }
    setUploadingVoice(false);
    e.target.value = '';
  }

  async function handleVoiceDelete() {
    if (!profile || !confirm('Supprimer le message vocal ?')) return;
    await supabase.from('carte_profiles')
      .update({ voice_message_url: null, voice_message_enabled: false })
      .eq('id', profile.id);
    setProfile(prev => prev ? { ...prev, voice_message_url: '', voice_message_enabled: false } : prev);
    setForm(f => ({ ...f, voice_message_url: '', voice_message_enabled: false }));
  }

  async function handleGenerateVoice() {
    if (!profile || !form.voice_message_text?.trim()) return;
    setGeneratingVoice(true);
    setMsg(null);
    const res = await fetch('/api/carte/generate-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: form.voice_message_text, voice: voiceType, slug: profile.slug }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg({ text: json.error ?? 'Erreur génération audio', type: 'error' });
    } else {
      setForm(f => ({ ...f, voice_message_url: json.url }));
      setProfile(prev => prev ? { ...prev, voice_message_url: json.url } : prev);
      setMsg({ text: 'Message vocal généré avec succès !', type: 'success' });
      setTimeout(() => setMsg(null), 4000);
    }
    setGeneratingVoice(false);
  }

  async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function handleDocUpload() {
    if (!profile || !newDocFile || !newDocName.trim()) return;
    setUploadingDoc(true);
    setMsg(null);

    // 1. Upload du fichier dans Supabase Storage
    const ext = newDocFile.name.split('.').pop() ?? 'pdf';
    const safeName = newDocName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const path = `${profile.slug}/docs/${Date.now()}-${safeName}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('carte-images')
      .upload(path, newDocFile, { upsert: true });
    if (uploadErr) {
      setMsg({ text: 'Erreur upload fichier : ' + uploadErr.message, type: 'error' });
      setUploadingDoc(false);
      return;
    }

    // 2. Enregistrement en base via l'API serveur (service role key)
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;
    const nextPosition = docs.length > 0 ? Math.max(...docs.map(d => d.position)) + 1 : 0;
    const token = await getToken();
    const res = await fetch('/api/carte/document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ profile_id: profile.id, name: newDocName.trim(), url, type: newDocType, position: nextPosition }),
    });
    const inserted = await res.json();
    if (!res.ok) {
      setMsg({ text: 'Erreur enregistrement : ' + (inserted.error ?? 'inconnue'), type: 'error' });
    } else {
      setDocs(prev => [...prev, inserted as Doc]);
      setNewDocFile(null);
      setNewDocName('');
      setNewDocType('pdf');
      if (docInputRef.current) docInputRef.current.value = '';
    }
    setUploadingDoc(false);
  }

  async function handleDocDelete(docId: string) {
    setDeletingDocId(docId);
    const token = await getToken();
    const res = await fetch('/api/carte/document', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ doc_id: docId }),
    });
    if (res.ok) {
      setDocs(prev => prev.filter(d => d.id !== docId));
    }
    setDeletingDocId(null);
  }

  async function handleUpgradeRequest() {
    if (!upgradeTarget) return;
    setRequestingUpgrade(true);
    setUpgradeMsg(null);
    const token = await getToken();
    const res = await fetch('/api/carte/upgrade-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ requested_plan: upgradeTarget }),
    });
    if (res.ok) {
      setUpgradeMsg({ text: 'Demande envoyée ! Nous vous contacterons sous 24h.', type: 'success' });
    } else {
      setUpgradeMsg({ text: 'Erreur lors de l\'envoi. Réessayez.', type: 'error' });
    }
    setUpgradeTarget(null);
    setRequestingUpgrade(false);
    setTimeout(() => setUpgradeMsg(null), 6000);
  }


  async function handleSendPush() {
    if (!pushTitle.trim() || !pushBody.trim()) return;
    setSendingPush(true);
    setPushMsg(null);
    const token = await getToken();
    const res = await fetch('/api/carte/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: pushTitle.trim(), body: pushBody.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setPushMsg({ text: `Notification envoyée à ${data.sent} abonné${data.sent > 1 ? 's' : ''} !`, type: 'success' });
      setPushTitle('');
      setPushBody('');
      setTimeout(() => setPushMsg(null), 5000);
    } else {
      setPushMsg({ text: data.error ?? 'Erreur envoi', type: 'error' });
    }
    setSendingPush(false);
  }

  async function handleVideoLinkAdd() {
    if (!profile || !videoUrl.trim()) return;
    setAddingVideo(true);
    setMsg(null);
    const platform = detectVideoPlatform(videoUrl.trim());
    const nextPosition = videos.length > 0 ? Math.max(...videos.map(v => v.position)) + 1 : 0;
    const token = await getToken();
    const res = await fetch('/api/carte/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ profile_id: profile.id, type: 'link', url: videoUrl.trim(), platform, caption: videoCaption.trim() || null, position: nextPosition }),
    });
    const inserted = await res.json();
    if (!res.ok) {
      setMsg({ text: 'Erreur : ' + (inserted.error ?? 'inconnue'), type: 'error' });
    } else {
      setVideos(prev => [...prev, inserted as VideoItem]);
      setVideoUrl('');
      setVideoCaption('');
    }
    setAddingVideo(false);
  }

  async function handleVideoUpload(file: File) {
    if (!profile) return;
    setUploadingVideo(true);
    setMsg(null);
    const ext = file.name.split('.').pop() ?? 'mp4';
    const path = `${profile.slug}/videos/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('carte-images')
      .upload(path, file, { upsert: true });
    if (uploadErr) {
      setMsg({ text: 'Erreur upload : ' + uploadErr.message, type: 'error' });
      setUploadingVideo(false);
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;
    const nextPosition = videos.length > 0 ? Math.max(...videos.map(v => v.position)) + 1 : 0;
    const token = await getToken();
    const res = await fetch('/api/carte/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ profile_id: profile.id, type: 'upload', url, platform: 'upload', caption: videoCaption.trim() || null, position: nextPosition }),
    });
    const inserted = await res.json();
    if (!res.ok) {
      setMsg({ text: 'Erreur : ' + (inserted.error ?? 'inconnue'), type: 'error' });
    } else {
      setVideos(prev => [...prev, inserted as VideoItem]);
      setVideoFile(null);
      setVideoCaption('');
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
    setUploadingVideo(false);
  }

  async function handleVideoDelete(videoId: string) {
    setDeletingVideoId(videoId);
    const token = await getToken();
    const res = await fetch('/api/carte/video', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ video_id: videoId }),
    });
    if (res.ok) setVideos(prev => prev.filter(v => v.id !== videoId));
    setDeletingVideoId(null);
  }

  async function handlePortfolioUpload(file: File) {
    if (!profile) return;
    const plan = (profile.plan ?? 'starter').toLowerCase();
    const limit = PORTFOLIO_LIMITS[plan] ?? 6;
    if (portfolio.length >= limit) {
      setMsg({ text: `Limite atteinte pour le plan ${plan} (${limit} photos max).`, type: 'error' });
      return;
    }
    setUploadingPortfolio(true);
    setMsg(null);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${profile.slug}/portfolio/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('carte-images')
      .upload(path, file, { upsert: true });
    if (uploadErr) {
      setMsg({ text: 'Erreur upload : ' + uploadErr.message, type: 'error' });
      setUploadingPortfolio(false);
      return;
    }
    const photo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carte-images/${path}`;
    const nextPosition = portfolio.length > 0 ? Math.max(...portfolio.map(p => p.position)) + 1 : 0;
    const token = await getToken();
    const res = await fetch('/api/carte/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ profile_id: profile.id, photo_url, caption: portfolioCaption.trim() || null, position: nextPosition }),
    });
    const inserted = await res.json();
    if (!res.ok) {
      setMsg({ text: 'Erreur enregistrement : ' + (inserted.error ?? 'inconnue'), type: 'error' });
    } else {
      setPortfolio(prev => [...prev, inserted as PortfolioItem]);
      setPortfolioCaption('');
      setPortfolioPhotoFile(null);
      if (portfolioInputRef.current) portfolioInputRef.current.value = '';
    }
    setUploadingPortfolio(false);
  }

  async function handlePortfolioDelete(itemId: string) {
    setDeletingPortfolioId(itemId);
    const token = await getToken();
    const res = await fetch('/api/carte/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ item_id: itemId }),
    });
    if (res.ok) {
      setPortfolio(prev => prev.filter(p => p.id !== itemId));
    }
    setDeletingPortfolioId(null);
  }

  function onDocFilePicked(file: File) {
    setNewDocFile(file);
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
    setNewDocName(nameWithoutExt);
  }

  function set(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function openTeamCreate() {
    setEditingMember(null);
    setTeamForm({ name: '', title: '', email: '', phone: '', slug: '', linkedin: '', twitter: '' });
    setTeamError(null);
    setShowTeamModal(true);
  }

  function openTeamEdit(m: TeamMember) {
    setEditingMember(m);
    setTeamForm({ name: m.name, title: m.title ?? '', email: m.email ?? '', phone: m.phone ?? '', slug: m.slug, linkedin: m.linkedin ?? '', twitter: m.twitter ?? '' });
    setTeamError(null);
    setShowTeamModal(true);
  }

  async function handleTeamSave() {
    if (!teamForm.name.trim() || !teamForm.email.trim()) {
      setTeamError('Nom et email sont obligatoires.');
      return;
    }
    setSavingTeam(true);
    setTeamError(null);
    const token = await getToken();
    const res = await fetch('/api/carte/team', {
      method: editingMember ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editingMember ? { id: editingMember.id, ...teamForm } : teamForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setTeamError(data.error ?? 'Erreur inconnue');
    } else {
      setTeam(prev => editingMember
        ? prev.map(m => m.id === editingMember.id ? data as TeamMember : m)
        : [...prev, data as TeamMember]
      );
      setShowTeamModal(false);
    }
    setSavingTeam(false);
  }

  async function handleTeamToggle(memberId: string, current: boolean) {
    setTogglingMemberId(memberId);
    const token = await getToken();
    const res = await fetch('/api/carte/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: memberId, active: !current }),
    });
    if (res.ok) setTeam(prev => prev.map(m => m.id === memberId ? { ...m, active: !current } : m));
    setTogglingMemberId(null);
  }

  async function handleTeamDelete(memberId: string) {
    setDeletingMemberId(memberId);
    const token = await getToken();
    const res = await fetch('/api/carte/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: memberId }),
    });
    if (res.ok) setTeam(prev => prev.filter(m => m.id !== memberId));
    setDeletingMemberId(null);
  }

  async function handleCoverPermToggle(member: TeamMember) {
    const token = await getToken();
    const next = !member.allow_custom_cover;
    const res = await fetch('/api/carte/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: member.id, allow_custom_cover: next, ...(!next ? { cover_url: null } : {}) }),
    });
    if (res.ok) setTeam(prev => prev.map(m => m.id === member.id ? { ...m, allow_custom_cover: next, ...(!next ? { cover_url: null } : {}) } : m));
  }

  async function handleMemberCoverUpload(file: File, memberId: string, memberSlug: string) {
    setUploadingCoverForId(memberId);
    const ext = file.name.split('.').pop();
    const path = `${memberSlug}/cover-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('carte-images').upload(path, file, { upsert: true });
    if (upErr) { setUploadingCoverForId(null); return; }
    const { data: urlData } = supabase.storage.from('carte-images').getPublicUrl(path);
    const token = await getToken();
    const res = await fetch('/api/carte/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: memberId, cover_url: urlData.publicUrl }),
    });
    if (res.ok) setTeam(prev => prev.map(m => m.id === memberId ? { ...m, cover_url: urlData.publicUrl } : m));
    setUploadingCoverForId(null);
  }

  async function handleMemberCoverRemove(memberId: string) {
    const token = await getToken();
    const res = await fetch('/api/carte/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: memberId, cover_url: null }),
    });
    if (res.ok) setTeam(prev => prev.map(m => m.id === memberId ? { ...m, cover_url: null } : m));
  }

  function handleCopySignature() {
    if (!profile) return;
    navigator.clipboard.writeText(generateSignatureHTML(profile)).then(() => {
      setSigCopied(true);
      setTimeout(() => setSigCopied(false), 3000);
    });
  }

  async function handleRequestInstall() {
    setInstallLoading(true);
    const token = await getToken();
    const res = await fetch('/api/carte/signature-install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) setInstallRequested(true);
    setInstallLoading(false);
  }

  async function handleLinkAdd() {
    if (!profile || !newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setAddingLink(true);
    const nextPosition = links.length > 0 ? Math.max(...links.map(l => l.position)) + 1 : 0;
    const token = await getToken();
    const res = await fetch('/api/carte/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ profile_id: profile.id, label: newLinkLabel.trim(), url: newLinkUrl.trim(), icon: newLinkIcon || null, position: nextPosition }),
    });
    const inserted = await res.json();
    if (res.ok) {
      setLinks(prev => [...prev, inserted as CustomLink]);
      setNewLinkLabel('');
      setNewLinkUrl('');
      setNewLinkIcon('🔗');
    }
    setAddingLink(false);
  }

  async function handleLinkDelete(linkId: string) {
    setDeletingLinkId(linkId);
    const token = await getToken();
    const res = await fetch('/api/carte/links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ link_id: linkId }),
    });
    if (res.ok) setLinks(prev => prev.filter(l => l.id !== linkId));
    setDeletingLinkId(null);
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingDot} />
      </div>
    );
  }

  // ---- Login ----
  if (!user) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <img src="/assets/logo.png" alt="G+Digital" className={styles.loginLogo} />
          <h1 className={styles.loginTitle}>Espace Client</h1>
          <p className={styles.loginSub}>Connectez-vous pour modifier votre carte digitale</p>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="vous@email.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mot de passe</label>
              <input className={styles.input} type="password" placeholder="••••••••"
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            </div>
            {loginError && <p className={styles.loginError}>{loginError}</p>}
            <button type="submit" className={styles.btnSave} disabled={loginLoading}>
              {loginLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className={styles.loginHelp}>
            Mot de passe oublié ? Contactez{' '}
            <span className={styles.loginHelpAccent}>G+Digital Success</span>
          </p>
        </div>
      </div>
    );
  }

  // ---- No profile linked ----
  if (!profile) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <p style={{ color: '#F87171', textAlign: 'center' }}>
            Aucune carte trouvée pour ce compte.<br />Contactez G+Digital Success.
          </p>
          <button className={styles.btnLogout} onClick={handleLogout} style={{ marginTop: 16 }}>
            Déconnexion
          </button>
        </div>
      </div>
    );
  }

  // Membre d'équipe → dashboard simplifié
  if (profile.team_owner_id) {
    return <MemberDashboard profile={profile as Parameters<typeof MemberDashboard>[0]['profile']} />;
  }

  const plan = (profile.plan ?? 'starter').toLowerCase();
  const planStyle = PLAN_STYLE[plan] ?? PLAN_STYLE.starter;

  // ---- Dashboard patron ----
  return (
    <div className={styles.page}>
      {/* Hidden file inputs */}
      <input ref={photoInputRef} className={styles.fileInput} type="file" accept="image/*"
        onChange={e => { if (e.target.files?.[0]) { setCropState({ file: e.target.files[0], type: 'photo' }); e.target.value = ''; } }} />
      <input ref={coverInputRef} className={styles.fileInput} type="file" accept="image/*"
        onChange={e => { if (e.target.files?.[0]) { setCropState({ file: e.target.files[0], type: 'cover' }); e.target.value = ''; } }} />
      <input ref={coverVideoInputRef} className={styles.fileInput} type="file" accept="video/mp4,video/webm,video/quicktime"
        onChange={e => { if (e.target.files?.[0]) handleCoverVideoUpload(e.target.files[0]); }} />
      <input ref={docInputRef} className={styles.fileInput} type="file" accept=".pdf,application/pdf"
        onChange={e => e.target.files?.[0] && onDocFilePicked(e.target.files[0])} />
      <input ref={portfolioInputRef} className={styles.fileInput} type="file" accept="image/*"
        onChange={e => { if (e.target.files?.[0]) { setPortfolioPhotoFile(e.target.files[0]); } }} />
      <input ref={videoInputRef} className={styles.fileInput} type="file" accept="video/*"
        onChange={e => { if (e.target.files?.[0]) { setVideoFile(e.target.files[0]); } }} />

      {/* Top bar */}
      <div className={styles.topBar}>
        <img src="/assets/logo.png" alt="G+Digital" className={styles.topBarLogo} />
        <div className={styles.topBarRight}>
          <a href={`/c/${profile.slug}`} target="_blank" rel="noopener noreferrer" className={styles.btnView}>
            Voir ma carte ↗
          </a>
          <button className={styles.btnLogout} onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>

      {/* ---- Desktop layout wrapper ---- */}
      <div className={styles.desktopWrapper}>

        {/* Sidebar (desktop uniquement) */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Navigation</p>
          {([
            { id: 'section-profil',  icon: <IconUser size={15}/>,     label: 'Profil' },
            { id: 'section-contact', icon: <Phone size={15}/>,        label: 'Contact' },
            { id: 'section-rdv',     icon: <Calendar size={15}/>,     label: 'RDV' },
            { id: 'section-labels',  icon: <Tag size={15}/>,          label: 'Labels' },
            { id: 'section-socials', icon: <Share2 size={15}/>,       label: 'Réseaux sociaux' },
          ] as {id:string;icon:React.ReactNode;label:string}[]).map(item => (
            <button key={item.id} type="button" onClick={() => setActiveSection(item.id)}
              className={`${styles.sidebarLink} ${activeSection === item.id ? styles.sidebarLinkActive : ''}`}>
              {item.icon}{item.label}
            </button>
          ))}
          <div className={styles.sidebarDivider} />
          {([
            { id: 'section-liens',     icon: <Link size={15}/>,           label: 'Liens' },
            { id: 'section-whatsapp',  icon: <MessageCircle size={15}/>,  label: 'WhatsApp Auto' },
            { id: 'section-paiement',  icon: <CreditCard size={15}/>,     label: 'Mobile Money' },
            { id: 'section-vocal',     icon: <Mic size={15}/>,            label: 'Message Vocal' },
            { id: 'section-equipe',    icon: <Users size={15}/>,          label: 'Équipe' },
            { id: 'section-documents', icon: <FileText size={15}/>,       label: 'Documents' },
            { id: 'section-portfolio', icon: <Image size={15}/>,          label: 'Réalisations' },
            { id: 'section-videos',    icon: <Video size={15}/>,          label: 'Vidéos' },
            ...(['pro','business','business_team'].includes(plan) ? [{ id: 'section-agent-ia', icon: <Bot size={15}/>, label: 'Assistant IA' }] : []),
          ] as {id:string;icon:React.ReactNode;label:string}[]).map(item => (
            <button key={item.id} type="button" onClick={() => setActiveSection(item.id)}
              className={`${styles.sidebarLink} ${activeSection === item.id ? styles.sidebarLinkActive : ''}`}>
              {item.icon}{item.label}
            </button>
          ))}
          <div className={styles.sidebarDivider} />
          {([
            { id: 'section-leads',     icon: <Inbox size={15}/>,          label: 'Contacts reçus' },
            ...(['pro','business','business_team'].includes(plan) ? [{ id: 'section-chat-logs', icon: <Bot size={15}/>, label: 'Conversations IA' }] : []),
            { id: 'section-push',      icon: <Bell size={15}/>,           label: 'Notifications' },
            { id: 'section-signature', icon: <Mail size={15}/>,           label: 'Signature email' },
            { id: 'section-plan',      icon: <Star size={15}/>,           label: 'Mon plan' },
            { id: 'section-password',  icon: <Lock size={15}/>,           label: 'Mot de passe' },
          ] as {id:string;icon:React.ReactNode;label:string}[]).map(item => (
            <button key={item.id} type="button" onClick={() => setActiveSection(item.id)}
              className={`${styles.sidebarLink} ${activeSection === item.id ? styles.sidebarLinkActive : ''}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </aside>

        {/* Contenu principal */}
        <div className={styles.mainContent}>

      {/* Hero carte — même structure que la carte publique */}
      {activeSection === 'section-profil' && (
        <div className={styles.coverSection}>
          {/* Fond clippé séparément (permet au logo de déborder) */}
          <div className={styles.coverBg}>
            {profile.cover_video_url
              ? <video src={profile.cover_video_url} autoPlay muted loop playsInline className={styles.coverImg} />
              : profile.cover_url
                ? <img src={profile.cover_url} alt="cover" className={styles.coverImg} />
                : <div className={styles.coverDefault} />}
          </div>

          {/* Dégradé bas */}
          <div className={styles.coverGradient} />

          {/* Nom + titre overlaid */}
          <div className={styles.coverHeroInfo}>
            <div className={styles.coverHeroName}>
              {form.name || <span style={{ opacity: 0.4 }}>Votre nom</span>}
            </div>
            {(form.title || form.company) && (
              <div className={styles.coverHeroMeta}>
                {form.title}{form.company && <span className={styles.coverHeroCompany}> · {form.company}</span>}
              </div>
            )}
          </div>

          {/* Logo badge bas droite */}
          {profile.logo_url && (
            <div className={styles.coverLogoBadge}>
              <div className={styles.coverLogoBadgeInner}>
                <img src={profile.logo_url} alt="logo" className={styles.coverLogoBadgeImg} />
              </div>
            </div>
          )}

          {/* Boutons édition — visibles au hover */}
          <div className={styles.coverOverlay} style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            <button type="button" onClick={() => coverInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 13px', color: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="15" height="15">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {uploadingCover ? '...' : 'Couverture'}
            </button>
            {plan === 'starter' ? (
              <button type="button" onClick={() => setUpgradeTarget('pro')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,168,67,0.4)', borderRadius: 8, padding: '7px 13px', color: '#D4A843', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                🔒 Vidéo — Pro
              </button>
            ) : (
              <button type="button" onClick={() => coverVideoInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 13px', color: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="15" height="15">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                {uploadingCoverVideo ? '...' : 'Vidéo'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Badge plan — profil uniquement */}
      {activeSection === 'section-profil' && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0 16px' }}>
          <span className={styles.planBadge} style={{ background: planStyle.bg, color: planStyle.color }}>
            Plan {plan}
          </span>
        </div>
      )}

      {/* ---- Section Mon Plan ---- */}
      {(() => {
        const currentPlan = (profile.plan ?? 'starter').toLowerCase();
        const plans = [
          { key: 'starter',       label: 'Starter',         price: '$12/mois', features: ['Page digitale active', 'Infos modifiables', '1 vidéo', '6 photos', 'Liens personnalisés'] },
          { key: 'pro',           label: 'Pro',             price: '$29/mois', features: ['+ Logo, couleurs, PDF', 'Stats de visites', 'Bouton RDV', 'Notifications push', '2 vidéos · 12 photos'] },
          { key: 'business',      label: 'Business',        price: '$59/mois', features: ['+ Signature email pro', 'Vidéos & photos illimitées', 'Liens illimités', 'Support prioritaire'] },
          { key: 'business_team', label: 'Business Équipe', price: '$99/mois', features: ['+ Jusqu\'à 10 cartes membres', 'Gestion équipe centralisée', 'Activation / désactivation', 'Idéal PME & équipes'] },
        ];
        const COLORS: Record<string, { bg: string; border: string; text: string }> = {
          starter:       { bg: 'rgba(108,99,255,0.08)',  border: 'rgba(108,99,255,0.3)',  text: '#A78BFA' },
          pro:           { bg: 'rgba(0,207,255,0.08)',   border: 'rgba(0,207,255,0.3)',   text: '#00CFFF' },
          business:      { bg: 'rgba(212,168,67,0.08)', border: 'rgba(212,168,67,0.3)', text: '#D4A843' },
          business_team: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  text: '#22C55E' },
        };
        return (
          <>
          {stats && (currentPlan === 'pro' || currentPlan === 'business') && (
            <div className={styles.body} style={{ marginTop: 8, display: activeSection === 'section-profil' ? 'block' : 'none' }}>
              <div className={styles.section}>
                <p className={styles.sectionTitle} style={{ marginBottom: 14 }}>Statistiques</p>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Total', value: stats.total },
                    { label: '30 jours', value: stats.thisMonth },
                    { label: '7 jours', value: stats.thisWeek },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(0,207,255,0.06)', border: '1px solid rgba(0,207,255,0.15)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00CFFF', lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Mobile vs Desktop */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: '📱 Mobile', value: stats.mobile, color: '#A78BFA' },
                    { label: '💻 Desktop', value: stats.desktop, color: '#00CFFF' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{label}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Graphique 7 jours */}
                <p style={{ fontSize: '0.72rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Visites — 7 derniers jours</p>
                {(() => {
                  const max = Math.max(...stats.daily.map(d => d.count), 1);
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
                      {stats.daily.map(({ date, count }) => {
                        const pct = (count / max) * 100;
                        const day = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short' });
                        return (
                          <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.6rem', color: count > 0 ? '#00CFFF' : '#374151' }}>{count > 0 ? count : ''}</span>
                            <div style={{ width: '100%', height: `${Math.max(pct, 4)}%`, background: count > 0 ? 'linear-gradient(180deg,#00CFFF,#6C63FF)' : 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                            <span style={{ fontSize: '0.6rem', color: '#4B5563', textTransform: 'capitalize' }}>{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <div className={styles.body} style={{ marginTop: 8, display: activeSection === 'section-plan' ? 'block' : 'none' }}>
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Mon plan</p>
              {upgradeMsg && (
                <div className={upgradeMsg.type === 'success' ? styles.msgSuccess : styles.msgError}>
                  {upgradeMsg.text}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plans.map(p => {
                  const isCurrent = p.key === currentPlan;
                  const isDowngrade = ['starter','pro','business'].indexOf(p.key) <= ['starter','pro','business'].indexOf(currentPlan);
                  const c = COLORS[p.key];
                  return (
                    <div key={p.key} style={{
                      background: isCurrent ? c.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? c.border : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 14, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, color: isCurrent ? c.text : 'white', fontSize: '0.95rem' }}>{p.label}</span>
                          <span style={{ fontWeight: 700, color: isCurrent ? c.text : '#6B7280', fontSize: '0.82rem' }}>{p.price}</span>
                          {isCurrent && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 9999, padding: '2px 8px' }}>
                              Actuel
                            </span>
                          )}
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {p.features.map(f => (
                            <li key={f} style={{ fontSize: '0.75rem', color: isCurrent ? '#9CA3AF' : '#4B5563' }}>
                              {isCurrent ? '✓ ' : ''}{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {!isCurrent && !isDowngrade && (
                        <button
                          type="button"
                          onClick={() => setUpgradeTarget(p.key)}
                          style={{
                            flexShrink: 0, padding: '8px 14px', borderRadius: 9999,
                            background: c.bg, border: `1px solid ${c.border}`,
                            color: c.text, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Passer à {p.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          </>
        );
      })()}

      {/* ---- Mot de passe ---- */}
      <div id="section-password" className={styles.body} style={{ marginTop: 0, display: activeSection === 'section-password' ? 'block' : 'none' }}>
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Changer le mot de passe</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Mot de passe actuel</label>
              <input className={styles.input} type="password" placeholder="Votre mot de passe actuel" value={pwdForm.current}
                onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Nouveau mot de passe</label>
              <input className={styles.input} type="password" placeholder="Minimum 6 caractères" value={pwdForm.next}
                onChange={e => setPwdForm(f => ({ ...f, next: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Confirmer le mot de passe</label>
              <input className={styles.input} type="password" placeholder="Répétez le mot de passe" value={pwdForm.confirm}
                onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            {pwdMsg && (
              <div className={pwdMsg.type === 'success' ? styles.msgSuccess : styles.msgError}>{pwdMsg.text}</div>
            )}
            <button type="button" onClick={handlePasswordChange} disabled={savingPwd}
              style={{ padding: '11px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6C63FF,#00CFFF)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: savingPwd ? 0.7 : 1, width: 'fit-content' }}>
              {savingPwd ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal confirmation upgrade */}
      {upgradeTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setUpgradeTarget(null); }}>
          <div style={{ background: '#13131F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
              Passer au plan {upgradeTarget.charAt(0).toUpperCase() + upgradeTarget.slice(1)}
            </p>
            <p style={{ fontSize: '0.84rem', color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
              Nous enverrons votre demande à notre équipe. Vous serez contacté sous 24h pour confirmer le paiement et activer votre nouveau plan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setUpgradeTarget(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                Annuler
              </button>
              <button type="button" onClick={handleUpgradeRequest} disabled={requestingUpgrade}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #6C63FF, #00CFFF)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', opacity: requestingUpgrade ? 0.7 : 1 }}>
                {requestingUpgrade ? 'Envoi...' : 'Confirmer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form body */}
      <form className={styles.body} onSubmit={handleSave} style={{ display: FORM_SECTIONS.has(activeSection) ? 'block' : 'none' }}>

        {/* Profil */}
        <div id="section-profil" className={styles.section} style={{ display: activeSection === 'section-profil' ? 'block' : 'none' }}>
          <p className={styles.sectionTitle}>Profil</p>

          {/* Langue de la carte */}
          <div className={styles.field} style={{ marginBottom: 20 }}>
            <label className={styles.label}>Langue de la carte</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { code: 'fr', flag: '🇫🇷', label: 'Français' },
                { code: 'en', flag: '🇬🇧', label: 'English' },
                { code: 'ar', flag: '🇸🇦', label: 'عربي' },
              ].map(({ code, flag, label }) => (
                <button key={code} type="button"
                  onClick={() => setForm(f => ({ ...f, card_language: code }))}
                  style={{ flex: 1, padding: '10px 6px', borderRadius: 10, border: `2px solid ${form.card_language === code ? '#D4A843' : 'rgba(255,255,255,0.08)'}`, background: form.card_language === code ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.03)', color: form.card_language === code ? '#D4A843' : '#6B7280', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '1.4rem' }}>{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nom complet</label>
            <input className={styles.input} value={form.name} onChange={set('name')} placeholder="Jean Dupont" />
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Poste</label>
              <input className={styles.input} value={form.title} onChange={set('title')} placeholder="CEO" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Entreprise</label>
              <input className={styles.input} value={form.company} onChange={set('company')} placeholder="Acme Corp" />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description courte</label>
            <textarea className={`${styles.input} ${styles.textarea}`} value={form.description}
              onChange={set('description')} placeholder="Décrivez votre activité en quelques mots..." />
          </div>
        </div>

        {/* Contact */}
        <div id="section-contact" className={styles.section} style={{ display: activeSection === 'section-contact' ? 'block' : 'none' }}>
          <p className={styles.sectionTitle}>Contact</p>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Téléphone</label>
              <input className={styles.input} value={form.phone} onChange={set('phone')} placeholder="+33 6 12 34 56 78" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={form.email} onChange={set('email')} placeholder="vous@email.com" />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Site web</label>
            <input className={styles.input} value={form.website} onChange={set('website')} placeholder="https://monsite.com" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Localisation</label>
            <input className={styles.input} value={form.location} onChange={set('location')} placeholder="Paris, France" />
          </div>
        </div>

        {/* RDV */}
        <div id="section-rdv" className={styles.section} style={{ display: activeSection === 'section-rdv' ? 'block' : 'none' }}>
          <p className={styles.sectionTitle}>Lien de prise de RDV</p>
          <div className={styles.field}>
            <label className={styles.label}>URL Calendly / Cal.com</label>
            <input className={styles.input} value={form.rdv_url} onChange={set('rdv_url')} placeholder="https://calendly.com/monpseudo" />
          </div>
        </div>

        {/* Labels des boutons */}
        <div id="section-labels" className={styles.section} style={{ display: activeSection === 'section-labels' ? 'block' : 'none' }}>
          <p className={styles.sectionTitle}>Labels des boutons</p>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '-8px 0 16px' }}>Personnalisez les textes affichés sur votre carte. Laissez vide pour garder le texte par défaut.</p>
          <div className={styles.field}>
            <label className={styles.label}>Bouton RDV <span style={{ color: '#4B5563', fontWeight: 400 }}>(défaut : "Prendre RDV — Appel gratuit 30 min")</span></label>
            <input className={styles.input} value={form.label_rdv} onChange={set('label_rdv')} placeholder="ex: Réserver une table, Commander, Prendre rendez-vous..." />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Bouton Documents <span style={{ color: '#4B5563', fontWeight: 400 }}>(défaut : "Documents")</span></label>
            <input className={styles.input} value={form.label_documents} onChange={set('label_documents')} placeholder="ex: Nos menus, Brochures, Téléchargements..." />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Bouton Réalisations <span style={{ color: '#4B5563', fontWeight: 400 }}>(défaut : "Réalisations")</span></label>
            <input className={styles.input} value={form.portfolio_title} onChange={set('portfolio_title')} placeholder="ex: Nos produits, Notre portfolio, Nos services..." />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Bouton Vidéos <span style={{ color: '#4B5563', fontWeight: 400 }}>(défaut : "Vidéos")</span></label>
            <input className={styles.input} value={form.label_videos} onChange={set('label_videos')} placeholder="ex: Nos tutos, Nos recettes, Nos projets..." />
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div id="section-socials" className={styles.section} style={{ display: activeSection === 'section-socials' ? 'block' : 'none' }}>
          <p className={styles.sectionTitle}>Réseaux sociaux</p>
          {[
            { key: 'instagram' as const, label: 'Instagram',   prefix: 'instagram.com/',      ph: 'monpseudo' },
            { key: 'tiktok'    as const, label: 'TikTok',      prefix: 'tiktok.com/@',        ph: 'monpseudo' },
            { key: 'facebook'  as const, label: 'Facebook',    prefix: 'facebook.com/',       ph: 'monpseudo' },
            { key: 'linkedin'  as const, label: 'LinkedIn',    prefix: 'linkedin.com/in/',    ph: 'monpseudo' },
            { key: 'youtube'   as const, label: 'YouTube',     prefix: 'youtube.com/@',       ph: 'monpseudo' },
            { key: 'twitter'   as const, label: 'X / Twitter', prefix: 'twitter.com/',        ph: 'monpseudo' },
            { key: 'snapchat'  as const, label: 'Snapchat',    prefix: 'snapchat.com/add/',   ph: 'monpseudo' },
            { key: 'telegram'  as const, label: 'Telegram',    prefix: 't.me/',               ph: 'monpseudo' },
          ].map(({ key, label, prefix, ph }) => (
            <div className={styles.field} key={key}>
              <label className={styles.label}>{label}</label>
              <div className={styles.inputPrefix}>
                <span className={styles.prefix}>{prefix}</span>
                <input className={styles.inputNoBorder} value={form[key]} onChange={set(key)} placeholder={ph} />
              </div>
            </div>
          ))}
        </div>

        {/* ---- Assistant IA (Pro+) ---- */}
        {['pro', 'business', 'business_team'].includes(plan) && (
          <div id="section-agent-ia" className={styles.section} style={{ display: activeSection === 'section-agent-ia' ? 'block' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Assistant IA</p>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(0,207,255,0.15)', color: '#00CFFF', border: '1px solid rgba(0,207,255,0.3)', borderRadius: 9999, padding: '2px 9px' }}>
                Pro
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '-4px 0 14px', lineHeight: 1.6 }}>
              Décrivez vos services, tarifs et réponses habituelles. L&apos;assistant s&apos;en servira pour répondre aux visiteurs de votre carte.
            </p>
            <div className={styles.field}>
              <label className={styles.label}>Instructions pour votre assistant</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.ai_instructions}
                onChange={set('ai_instructions')}
                rows={10}
                style={{ resize: 'vertical', minHeight: 200 }}
                placeholder={`Je suis [poste] spécialisé en [domaine].

Services proposés :
- [Service 1] : [prix ou description courte]
- [Service 2] : [prix ou description courte]

Questions fréquentes :
- Q : Quel est votre délai ? → R : [votre réponse]
- Q : Vous travaillez à distance ? → R : [votre réponse]

Pour prendre RDV : [instruction ou lien]
Délai de réponse habituel : [ex: 24h]
Langue de travail : [français, anglais...]`}
              />
            </div>
          </div>
        )}

        {/* ---- Message Vocal ---- */}
        {activeSection === 'section-vocal' && (() => {
          const firstName = form.name.split(' ')[0] || 'vous';
          const TEMPLATES = [
            `Bonjour et bienvenue ! Je suis ${firstName} et je suis ravi de vous accueillir sur ma carte digitale. Explorez mon profil et n'hésitez pas à me contacter. À très bientôt !`,
            `Bonjour ! Merci d'avoir scanné ma carte. Je suis ${firstName} et je serais heureux d'échanger avec vous sur vos besoins. Contactez-moi directement via cette carte, je réponds rapidement !`,
            `Bienvenue ! Je suis ${firstName}, entrepreneur passionné. Je construis des solutions pour vous aider à réussir. Découvrez mes services ici et parlons de votre projet ensemble !`,
            `Bonjour ! Je suis ${firstName}, expert dans mon domaine, et je suis là pour répondre à toutes vos questions. Mon objectif : vous apporter les meilleures solutions. À bientôt !`,
            `Bonjour ! Bienvenue sur ma carte digitale. Je m'appelle ${firstName} et je serais ravi de collaborer avec vous. Laissez-moi vos coordonnées et je vous recontacte très rapidement !`,
          ];
          return (
          <div className={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Message Vocal IA</p>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 9999, padding: '2px 9px' }}>
                Nouveau
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.6 }}>
              Écrivez votre message ou choisissez un modèle — l&apos;IA génère une voix naturelle en français, anglais ou arabe.
            </p>

            {/* Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: `rgba(99,102,241,${form.voice_message_enabled ? '0.08' : '0.03'})`, border: `1px solid ${form.voice_message_enabled ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <input type="checkbox" checked={form.voice_message_enabled}
                onChange={e => setForm(f => ({ ...f, voice_message_enabled: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#818CF8', cursor: 'pointer', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>Activer le message vocal</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>Un bouton &quot;Écouter&quot; apparaîtra sur votre carte publique</div>
              </div>
            </label>

            {form.voice_message_enabled && (<>

              {/* Templates */}
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Modèles de messages</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {TEMPLATES.map((t, i) => (
                  <button key={i} type="button"
                    onClick={() => setForm(f => ({ ...f, voice_message_text: t }))}
                    style={{ textAlign: 'left', background: form.voice_message_text === t ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.voice_message_text === t ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '10px 14px', color: '#9CA3AF', fontSize: '0.78rem', cursor: 'pointer', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: '#818CF8', marginRight: 6 }}>#{i + 1}</span>{t.slice(0, 80)}…
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className={styles.field}>
                <label className={styles.label}>Votre message (500 caractères max)</label>
                <textarea className={styles.input} rows={4} style={{ resize: 'vertical' }}
                  value={form.voice_message_text}
                  onChange={e => setForm(f => ({ ...f, voice_message_text: e.target.value.slice(0, 500) }))}
                  placeholder="Écrivez votre message de bienvenue..." />
                <p style={{ fontSize: '0.7rem', color: form.voice_message_text.length > 450 ? '#F87171' : '#6B7280', marginTop: 4 }}>
                  {form.voice_message_text.length}/500 caractères
                </p>
              </div>

              {/* Voix */}
              <div className={styles.field}>
                <label className={styles.label}>Type de voix</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['female','male'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setVoiceType(v)}
                      style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${voiceType === v ? '#818CF8' : 'rgba(255,255,255,0.08)'}`, background: voiceType === v ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: voiceType === v ? '#818CF8' : '#6B7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      {v === 'female' ? '👩 Voix féminine' : '👨 Voix masculine'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouton générer */}
              <button type="button" onClick={handleGenerateVoice}
                disabled={generatingVoice || !form.voice_message_text?.trim()}
                style={{ width: '100%', padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg,#6C63FF,#4F46E5)', color: 'white', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: generatingVoice || !form.voice_message_text?.trim() ? 'not-allowed' : 'pointer', opacity: !form.voice_message_text?.trim() ? 0.5 : 1, marginBottom: 12 }}>
                {generatingVoice ? '⏳ Génération en cours...' : '🎙️ Générer l\'audio avec l\'IA'}
              </button>

              {/* Preview */}
              {form.voice_message_url && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Aperçu audio</p>
                  <audio src={form.voice_message_url} controls style={{ width: '100%', borderRadius: 8 }} />
                  <button type="button" onClick={handleVoiceDelete}
                    style={{ marginTop: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', borderRadius: 8, padding: '8px 16px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                    Supprimer le message vocal
                  </button>
                </div>
              )}

              {/* Import manuel */}
              <div style={{ textAlign: 'center', margin: '12px 0 4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>ou</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px', cursor: uploadingVoice ? 'wait' : 'pointer', opacity: uploadingVoice ? 0.6 : 1 }}>
                <input type="file" accept=".mp3,.wav,.m4a,.ogg,audio/*" onChange={handleVoiceUpload} style={{ display: 'none' }} disabled={uploadingVoice} />
                <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{uploadingVoice ? 'Chargement...' : '📁 Importer votre propre fichier MP3/WAV'}</span>
              </label>
            </>)}
          </div>
          );
        })()}

        {/* ---- Mobile Money ---- */}
        {activeSection === 'section-paiement' && (
          <div className={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Mobile Money</p>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 9999, padding: '2px 9px' }}>
                Nouveau
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              Ajoutez vos liens de paiement mobile — Wave, Orange Money, MTN, CinetPay. Un bouton &quot;Me payer&quot; apparaîtra sur votre carte publique pour chaque service configuré.
            </p>

            {[
              { key: 'wave_url',         label: 'Wave',             logo: '/assets/payment/wave.png',          placeholder: 'https://pay.wave.com/m/...' },
              { key: 'orange_money_url', label: 'Orange Money',     logo: '/assets/payment/orange-money.jpeg', placeholder: 'https://om.orange.cm/...' },
              { key: 'mtn_url',          label: 'MTN Mobile Money', logo: '/assets/payment/mtn.png',           placeholder: 'https://mtn.com/pay/...' },
              { key: 'cinetpay_url',     label: 'CinetPay',         logo: '/assets/payment/cinetpay.jpg',      placeholder: 'https://cinetpay.com/...' },
              { key: 'airtel_money_url', label: 'Airtel Money',     logo: '/assets/payment/airtel-money.png',  placeholder: 'https://airtel.africa/pay/...' },
              { key: 'moov_money_url',   label: 'Moov Money',       logo: '/assets/payment/moov-money.png',    placeholder: 'https://moov-africa.com/pay/...' },
              { key: 'wise_url',         label: 'Wise',             logo: '/assets/payment/wise.jpg',          placeholder: 'https://wise.com/pay/...' },
              { key: 'paypal_url',       label: 'PayPal',           logo: '/assets/payment/paypal.png',        placeholder: 'https://paypal.me/...' },
            ].map(({ key, label, logo, placeholder }) => (
              <div key={key} className={styles.field} style={{ marginBottom: 14 }}>
                <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', width: 56, height: 20, flexShrink: 0, overflow: 'hidden', borderRadius: 3 }}>
                    <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </span>
                  {label}
                </label>
                <input
                  className={styles.input}
                  type="url"
                  value={((form as unknown) as Record<string, string>)[key] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <p style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 4, lineHeight: 1.6 }}>
              Laissez vide les services que vous n&apos;utilisez pas. Seuls les services renseignés apparaîtront sur la carte.
            </p>
          </div>
        )}

        {/* ---- WhatsApp Auto-message ---- */}
        {activeSection === 'section-whatsapp' && (
          <div className={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>WhatsApp Auto-message</p>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 9999, padding: '2px 9px' }}>
                Nouveau
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              Affiche un bouton sur votre carte publique permettant aux visiteurs d&apos;ouvrir WhatsApp avec un message pré-rempli contenant le lien de votre carte.
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'rgba(37,211,102,0.05)', border: `1px solid ${form.whatsapp_auto_enabled ? 'rgba(37,211,102,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16, transition: 'border-color .2s' }}>
              <input
                type="checkbox"
                checked={form.whatsapp_auto_enabled}
                onChange={e => setForm(f => ({ ...f, whatsapp_auto_enabled: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#25D366', cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>Activer le bouton WhatsApp</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>Les visiteurs pourront partager votre carte via WhatsApp en un clic</div>
              </div>
            </label>

            {form.whatsapp_auto_enabled && (
              <div className={styles.field}>
                <label className={styles.label}>Message personnalisé (optionnel)</label>
                <textarea
                  className={styles.input}
                  value={form.whatsapp_auto_message}
                  onChange={e => setForm(f => ({ ...f, whatsapp_auto_message: e.target.value }))}
                  rows={3}
                  style={{ resize: 'vertical' }}
                  placeholder={`Découvrez la carte digitale de ${form.name || 'ce professionnel'} 👇`}
                />
                <p style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 6 }}>
                  Si vide, un message par défaut avec le lien de votre carte sera utilisé.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bouton save contextuel */}
        {msg && (
          <div className={msg.type === 'success' ? styles.msgSuccess : styles.msgError} style={{ margin: '0 16px 8px' }}>
            {msg.text}
          </div>
        )}
        <div style={{ padding: '12px 16px 20px' }}>
          <button type="submit" className={styles.btnSave} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* ---- Liens personnalisés ---- */}
      <div id="section-liens" className={styles.body} style={{ marginTop: 0, display: activeSection === 'section-liens' ? 'block' : 'none' }}>
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Liens personnalisés</p>
          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '-4px 0 8px', lineHeight: 1.6 }}>
            Boutons d&apos;action affichés sur votre carte — &quot;Commander&quot;, &quot;Voir le menu&quot;, &quot;Ma boutique&quot;...
          </p>

          {links.map(link => (
            <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{link.icon ?? '🔗'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{link.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.url.length > 42 ? link.url.slice(0, 42) + '…' : link.url}
                </div>
              </div>
              <button
                type="button"
                className={styles.btnDelete}
                onClick={() => handleLinkDelete(link.id)}
                disabled={deletingLinkId === link.id}
                title="Supprimer"
              >
                {deletingLinkId === link.id ? <span style={{ fontSize: '0.7rem' }}>...</span> : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                )}
              </button>
            </div>
          ))}

          {links.length < 10 && (
            <div className={styles.addDocWrap}>
              <p className={styles.addDocTitle}>Ajouter un lien</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {['🔗','🛒','🍽','🛍','📱','🌐','📍','📸','💼','⭐','🎁','📅'].map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewLinkIcon(e)}
                    style={{
                      padding: '6px 9px',
                      fontSize: '1.1rem',
                      background: newLinkIcon === e ? 'rgba(0,207,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${newLinkIcon === e ? 'rgba(0,207,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Libellé du bouton</label>
                <input
                  className={styles.input}
                  value={newLinkLabel}
                  onChange={e => setNewLinkLabel(e.target.value)}
                  placeholder="Ex: Commander, Voir le menu, Ma boutique..."
                  maxLength={40}
                />
              </div>
              <div className={styles.addDocRow} style={{ marginTop: 8 }}>
                <input
                  className={styles.input}
                  style={{ flex: 1 }}
                  value={newLinkUrl}
                  onChange={e => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  className={styles.btnAddDoc}
                  onClick={handleLinkAdd}
                  disabled={addingLink || !newLinkLabel.trim() || !newLinkUrl.trim()}
                >
                  {addingLink ? '...' : 'Ajouter'}
                </button>
              </div>
            </div>
          )}

          {links.length >= 10 && (
            <p className={styles.emptyDocs} style={{ color: '#D4A843' }}>Limite de 10 liens atteinte.</p>
          )}
        </div>
      </div>

      {/* ---- Gestion d'équipe ---- */}
      <div id="section-equipe" className={styles.body} style={{ marginTop: 0, display: activeSection === 'section-equipe' ? 'block' : 'none' }}>
        <div className={styles.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Gestion d&apos;équipe</p>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 9999, padding: '2px 9px' }}>
              Business
            </span>
          </div>

          {!TEAM_LIMITS[plan] ? (
            <div style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 14, padding: '20px 18px' }}>
              <p style={{ fontSize: '1.3rem', margin: '0 0 10px' }}>👥</p>
              <p style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', margin: '0 0 8px' }}>
                Plusieurs cartes, une seule équipe
              </p>
              <p style={{ fontSize: '0.82rem', color: '#9CA3AF', lineHeight: 1.7, margin: '0 0 16px' }}>
                Disponible dès le plan Pro (2 membres), Business (5 membres) ou Business Équipe (10 membres).
              </p>
              <button
                type="button"
                onClick={() => setUpgradeTarget('business_team')}
                style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Passer au plan Pro ou supérieur
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: '0.72rem', color: '#6B7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '3px 10px' }}>
                  {team.length}/{TEAM_LIMITS[plan]} membre{team.length > 1 ? 's' : ''}
                </span>
                {team.length < TEAM_LIMITS[plan] && (
                  <button
                    type="button"
                    onClick={openTeamCreate}
                    style={{ padding: '7px 14px', borderRadius: 9999, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.35)', color: '#A78BFA', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    + Ajouter un membre
                  </button>
                )}
              </div>

              {team.length === 0 ? (
                <p className={styles.emptyDocs}>Aucun membre pour l&apos;instant — ajoutez le premier collaborateur de votre équipe.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input ref={memberCoverInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file && coverUploadTargetId) {
                        const member = team.find(m => m.id === coverUploadTargetId);
                        if (member) handleMemberCoverUpload(file, member.id, member.slug);
                      }
                      e.target.value = '';
                    }} />
                  {team.map(member => {
                    const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const color = memberColor(member.name);
                    return (
                      <div key={member.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                        {/* Ligne principale */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: color + '22', border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {member.photo_url
                              ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: '0.78rem', fontWeight: 800, color }}>{initials}</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem', marginBottom: 1 }}>{member.name}</div>
                            {member.title && <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: 2 }}>{member.title}</div>}
                            <a href={`/c/${member.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color, textDecoration: 'none', fontFamily: 'monospace' }}>
                              /c/{member.slug} ↗
                            </a>
                            {teamStats[member.id] !== undefined && (
                              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: '0.62rem', color: '#6B7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9999, padding: '2px 7px' }}>
                                  👁 {teamStats[member.id].visits} vues
                                </span>
                                <span style={{ fontSize: '0.62rem', color: '#6B7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9999, padding: '2px 7px' }}>
                                  📩 {teamStats[member.id].leads} leads
                                </span>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button type="button" onClick={() => handleTeamToggle(member.id, member.active)} disabled={togglingMemberId === member.id}
                              style={{ fontSize: '0.66rem', fontWeight: 700, padding: '3px 8px', borderRadius: 9999, cursor: 'pointer', background: member.active ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${member.active ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`, color: member.active ? '#22C55E' : '#F87171' }}>
                              {togglingMemberId === member.id ? '...' : (member.active ? 'Active' : 'Inactive')}
                            </button>
                            <button type="button" onClick={() => openTeamEdit(member)}
                              style={{ padding: '5px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button type="button" onClick={() => handleTeamDelete(member.id)} disabled={deletingMemberId === member.id} className={styles.btnDelete}>
                              {deletingMemberId === member.id ? <span style={{ fontSize: '0.7rem' }}>...</span> : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        {/* Couverture personnalisée */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button type="button" onClick={() => handleCoverPermToggle(member)}
                            style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 9999, cursor: 'pointer', background: member.allow_custom_cover ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${member.allow_custom_cover ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.1)'}`, color: member.allow_custom_cover ? '#A78BFA' : '#6B7280' }}>
                            {member.allow_custom_cover ? 'Cover perso activée' : 'Cover entreprise'}
                          </button>
                          {member.allow_custom_cover && (
                            <>
                              {member.cover_url
                                ? <img src={member.cover_url} alt="cover" style={{ height: 28, width: 50, objectFit: 'cover', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)' }} />
                                : <span style={{ fontSize: '0.65rem', color: '#4B5563' }}>Aucune cover — hérite de l&apos;entreprise</span>}
                              <button type="button" disabled={uploadingCoverForId === member.id}
                                onClick={() => { setCoverUploadTargetId(member.id); memberCoverInputRef.current?.click(); }}
                                style={{ fontSize: '0.65rem', fontWeight: 600, padding: '3px 9px', borderRadius: 9999, cursor: 'pointer', background: 'rgba(0,207,255,0.08)', border: '1px solid rgba(0,207,255,0.25)', color: '#00CFFF' }}>
                                {uploadingCoverForId === member.id ? '...' : 'Changer'}
                              </button>
                              {member.cover_url && (
                                <button type="button" onClick={() => handleMemberCoverRemove(member.id)}
                                  style={{ fontSize: '0.65rem', fontWeight: 600, padding: '3px 9px', borderRadius: 9999, cursor: 'pointer', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
                                  Retirer
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---- Documents (section indépendante) ---- */}
      <div id="section-documents" className={styles.body} style={{ marginTop: 0, display: activeSection === 'section-documents' ? 'block' : 'none' }}>
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Documents PDF</p>

          {/* Liste des documents existants */}
          {docs.length === 0
            ? <p className={styles.emptyDocs}>Aucun document ajouté.</p>
            : docs.map(doc => {
                const typeStyle = DOC_TYPE_STYLE[doc.type] ?? DOC_TYPE_STYLE.pdf;
                return (
                  <div key={doc.id} className={styles.docRow}>
                    <div className={styles.docIconBox}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#00CFFF" strokeWidth="2" width="18" height="18">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <div className={styles.docInfo}>
                      <span className={styles.docName}>{doc.name}</span>
                      <span className={styles.typeBadge} style={{ background: typeStyle.bg, color: typeStyle.color }}>
                        {doc.type}
                      </span>
                    </div>
                    <div className={styles.docActions}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.btnOpen}>
                        Ouvrir
                      </a>
                      <button
                        type="button"
                        className={styles.btnDelete}
                        onClick={() => handleDocDelete(doc.id)}
                        disabled={deletingDocId === doc.id}
                        title="Supprimer"
                      >
                        {deletingDocId === doc.id
                          ? <span style={{ fontSize: '0.7rem' }}>...</span>
                          : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          )}
                      </button>
                    </div>
                  </div>
                );
              })
          }

          {/* Ajouter un document */}
          <div className={styles.addDocWrap}>
            <p className={styles.addDocTitle}>Ajouter un document</p>

            <button
              type="button"
              className={`${styles.filePickerBtn} ${newDocFile ? styles.hasFile : ''}`}
              onClick={() => docInputRef.current?.click()}
            >
              {newDocFile
                ? `📄 ${newDocFile.name}`
                : '+ Choisir un fichier PDF'}
            </button>

            {newDocFile && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Nom affiché sur la carte</label>
                  <input
                    className={styles.input}
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    placeholder="Ex: Brochure de services"
                  />
                </div>
                <div className={styles.addDocRow}>
                  <select
                    className={styles.selectInput}
                    value={newDocType}
                    onChange={e => setNewDocType(e.target.value)}
                  >
                    {DOC_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  <input
                    className={styles.input}
                    style={{ flex: 1 }}
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    placeholder="Nom du document"
                  />
                  <button
                    type="button"
                    className={styles.btnAddDoc}
                    onClick={handleDocUpload}
                    disabled={uploadingDoc || !newDocName.trim()}
                  >
                    {uploadingDoc ? '...' : 'Ajouter'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ---- Vidéos ---- */}
        <div id="section-videos" className={styles.section} style={{ display: activeSection === 'section-videos' ? 'block' : 'none' }}>
          {(() => {
            const plan = (profile.plan ?? 'starter').toLowerCase();
            const limit = VIDEO_LIMITS[plan] ?? 1;
            const canUpload = plan === 'business';
            const count = videos.length;
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className={styles.sectionTitle}>Vidéos</p>
                  <span className={styles.portfolioLimit}>{count}/{limit}</span>
                </div>

                {/* Liste vidéos existantes */}
                {videos.map(video => {
                  const platform = video.platform ?? detectVideoPlatform(video.url);
                  const color = PLATFORM_ICONS[platform] ?? '#6B7280';
                  return (
                    <div key={video.id} className={styles.videoRow}>
                      <div className={styles.videoPlatformDot} style={{ background: color }} />
                      <div className={styles.videoInfo}>
                        <span className={styles.videoPlatformLabel}>{platform}</span>
                        {video.caption && <span className={styles.videoRowCaption}>{video.caption}</span>}
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoRowUrl}>
                          {video.url.length > 40 ? video.url.slice(0, 40) + '…' : video.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        className={styles.btnDelete}
                        onClick={() => handleVideoDelete(video.id)}
                        disabled={deletingVideoId === video.id}
                        title="Supprimer"
                      >
                        {deletingVideoId === video.id ? <span style={{ fontSize: '0.7rem' }}>...</span> : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Ajouter une vidéo */}
                {count < limit && (
                  <div className={styles.addDocWrap}>
                    <p className={styles.addDocTitle}>Ajouter une vidéo</p>

                    {/* Lien externe */}
                    <div className={styles.addDocRow}>
                      <input
                        className={styles.input}
                        style={{ flex: 1 }}
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... ou TikTok, Facebook, Instagram"
                      />
                      <button
                        type="button"
                        className={styles.btnAddDoc}
                        onClick={handleVideoLinkAdd}
                        disabled={addingVideo || !videoUrl.trim()}
                      >
                        {addingVideo ? '...' : 'Ajouter'}
                      </button>
                    </div>

                    {/* Légende commune */}
                    {(videoUrl.trim() || videoFile) && (
                      <input
                        className={styles.input}
                        value={videoCaption}
                        onChange={e => setVideoCaption(e.target.value)}
                        placeholder="Légende (optionnel)"
                      />
                    )}

                    {/* Upload MP4 — Business uniquement */}
                    {canUpload && (
                      <>
                        <p style={{ fontSize: '0.72rem', color: '#4B5563', textAlign: 'center', margin: '4px 0' }}>— ou —</p>
                        <button
                          type="button"
                          className={`${styles.filePickerBtn} ${videoFile ? styles.hasFile : ''}`}
                          onClick={() => videoInputRef.current?.click()}
                        >
                          {videoFile ? `🎬 ${videoFile.name}` : '+ Upload vidéo MP4 (Business)'}
                        </button>
                        {videoFile && (
                          <button
                            type="button"
                            className={styles.btnAddDoc}
                            onClick={() => handleVideoUpload(videoFile)}
                            disabled={uploadingVideo}
                            style={{ width: '100%' }}
                          >
                            {uploadingVideo ? 'Upload en cours...' : 'Uploader la vidéo'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {count >= limit && (
                  <p className={styles.emptyDocs} style={{ color: '#D4A843' }}>
                    Limite atteinte — passez au plan supérieur pour plus de vidéos.
                  </p>
                )}
              </>
            );
          })()}
        </div>

        {/* ---- Portfolio / Réalisations ---- */}
        <div id="section-portfolio" className={styles.section} style={{ display: activeSection === 'section-portfolio' ? 'block' : 'none' }}>
          {(() => {
            const plan = (profile.plan ?? 'starter').toLowerCase();
            const limit = PORTFOLIO_LIMITS[plan] ?? 6;
            const count = portfolio.length;
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className={styles.sectionTitle}>Photos de réalisations</p>
                  <span className={styles.portfolioLimit}>{count}/{limit === 999 ? '∞' : limit}</span>
                </div>

                {/* Grille photos existantes */}
                {count > 0 && (
                  <div className={styles.portfolioGrid}>
                    {portfolio.map(item => (
                      <div key={item.id} className={styles.portfolioItem}>
                        <img src={item.photo_url} alt={item.caption || 'photo'} className={styles.portfolioImg} />
                        {item.caption && <p className={styles.portfolioCaption}>{item.caption}</p>}
                        <button
                          type="button"
                          className={styles.portfolioDeleteBtn}
                          onClick={() => handlePortfolioDelete(item.id)}
                          disabled={deletingPortfolioId === item.id}
                          title="Supprimer"
                        >
                          {deletingPortfolioId === item.id ? '...' : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajouter une photo */}
                {count < limit && (
                  <div className={styles.addDocWrap}>
                    <p className={styles.addDocTitle}>Ajouter une photo</p>
                    <button
                      type="button"
                      className={`${styles.filePickerBtn} ${portfolioPhotoFile ? styles.hasFile : ''}`}
                      onClick={() => portfolioInputRef.current?.click()}
                    >
                      {portfolioPhotoFile ? `🖼 ${portfolioPhotoFile.name}` : '+ Choisir une image'}
                    </button>
                    {portfolioPhotoFile && (
                      <div className={styles.addDocRow}>
                        <input
                          className={styles.input}
                          style={{ flex: 1 }}
                          value={portfolioCaption}
                          onChange={e => setPortfolioCaption(e.target.value)}
                          placeholder="Légende (optionnel)"
                        />
                        <button
                          type="button"
                          className={styles.btnAddDoc}
                          onClick={() => handlePortfolioUpload(portfolioPhotoFile)}
                          disabled={uploadingPortfolio}
                        >
                          {uploadingPortfolio ? '...' : 'Ajouter'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {count >= limit && (
                  <p className={styles.emptyDocs} style={{ color: '#D4A843' }}>
                    Limite atteinte — passez au plan supérieur pour ajouter plus de photos.
                  </p>
                )}
              </>
            );
          })()}
        </div>

        {/* ---- Leads reçus ---- */}
        <div id="section-leads" className={styles.section} style={{ marginTop: 8, display: activeSection === 'section-leads' ? 'block' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Contacts reçus</p>
            {leads.length > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#6B7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '3px 10px' }}>
                {leads.length} contact{leads.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {leads.length === 0 ? (
            <p className={styles.emptyDocs}>Aucun contact reçu pour l&apos;instant.<br/>Les visiteurs qui remplissent le formulaire sur votre carte apparaîtront ici.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leads.map(lead => (
                <div key={lead.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{lead.visitor_name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#4B5563' }}>
                      {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {lead.visitor_phone && (
                      <a href={`tel:${lead.visitor_phone}`} style={{ fontSize: '0.82rem', color: '#00CFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {lead.visitor_phone}
                      </a>
                    )}
                    {lead.visitor_email && (
                      <a href={`mailto:${lead.visitor_email}`} style={{ fontSize: '0.82rem', color: '#A78BFA', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {lead.visitor_email}
                      </a>
                    )}
                    {lead.message && (
                      <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '4px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
                        &ldquo;{lead.message}&rdquo;
                      </p>
                    )}
                  </div>
                  {lead.visitor_phone && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <a href={`tel:${lead.visitor_phone}`}
                        style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 8, background: 'rgba(27,52,100,0.4)', border: '1px solid rgba(27,52,100,0.6)', color: '#93C5FD', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                        Appeler
                      </a>
                      <a href={`https://wa.me/${lead.visitor_phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                        style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 8, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Conversations IA ---- */}
        {['pro', 'business', 'business_team'].includes(plan) && (
          <div id="section-chat-logs" className={styles.section} style={{ marginTop: 8, display: activeSection === 'section-chat-logs' ? 'block' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Conversations IA</p>
              {chatLogs.length > 0 && (
                <span style={{ fontSize: '0.72rem', color: '#6B7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '3px 10px' }}>
                  {chatLogs.length} échange{chatLogs.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {chatLogs.length === 0 ? (
              <p className={styles.emptyDocs}>Aucune conversation pour l&apos;instant.<br/>Les échanges avec votre assistant IA apparaîtront ici.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatLogs.map(log => (
                  <div key={log.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${log.is_lead ? 'rgba(0,207,255,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.7rem', color: '#4B5563' }}>
                        {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {log.is_lead && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(0,207,255,0.12)', color: '#00CFFF', border: '1px solid rgba(0,207,255,0.3)', borderRadius: 9999, padding: '2px 8px' }}>
                          Prospect
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', flexShrink: 0, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Visiteur</span>
                        <p style={{ fontSize: '0.82rem', color: '#E5E7EB', margin: 0, lineHeight: 1.5, flex: 1 }}>{log.visitor_message}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00CFFF', flexShrink: 0, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>IA</span>
                        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, lineHeight: 1.5, flex: 1, fontStyle: 'italic' }}>{log.agent_reply}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- Notifications Push ---- */}
        <div id="section-push" className={styles.section} style={{ marginTop: 8, display: activeSection === 'section-push' ? 'block' : 'none' }}>
          {(() => {
            const plan = (profile?.plan ?? 'starter').toLowerCase();
            const isPro = plan === 'pro' || plan === 'business';
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Notifications Push</p>
                  {pushSubCount !== null && isPro && (
                    <span style={{ fontSize: '0.72rem', color: '#6B7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '3px 10px' }}>
                      {pushSubCount} abonné{pushSubCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {!isPro ? (
                  <div style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
                      🔔 Disponible avec le plan <strong style={{ color: '#D4A843' }}>Pro</strong> — envoyez des notifications push à vos abonnés (promos, actualités, nouveaux produits).
                    </p>
                  </div>
                ) : (
                  <>
                    {pushMsg && (
                      <div className={pushMsg.type === 'success' ? styles.msgSuccess : styles.msgError} style={{ marginBottom: 12 }}>
                        {pushMsg.text}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className={styles.field}>
                        <label className={styles.label}>Titre</label>
                        <input
                          className={styles.input}
                          value={pushTitle}
                          onChange={e => setPushTitle(e.target.value)}
                          placeholder="Nouveau produit disponible !"
                          maxLength={80}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Message</label>
                        <textarea
                          className={styles.input}
                          value={pushBody}
                          onChange={e => setPushBody(e.target.value)}
                          placeholder="Découvrez notre nouvelle offre..."
                          maxLength={200}
                          rows={2}
                          style={{ resize: 'none' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendPush}
                        disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
                        style={{
                          padding: '10px 16px', borderRadius: 10,
                          background: 'linear-gradient(135deg,#6C63FF,#00CFFF)',
                          border: 'none', color: 'white', fontWeight: 700,
                          fontSize: '0.875rem', cursor: 'pointer',
                          opacity: sendingPush || !pushTitle.trim() || !pushBody.trim() ? 0.5 : 1,
                        }}
                      >
                        {sendingPush ? 'Envoi...' : '🔔 Envoyer la notification'}
                      </button>
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>

        {/* ---- Signature Email ---- */}
        <div id="section-signature" className={styles.section} style={{ marginTop: 8, display: activeSection === 'section-signature' ? 'block' : 'none' }}>

          {/* Titre + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>Signature Email</p>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 9999, padding: '2px 9px' }}>
              Business
            </span>
          </div>

          {plan !== 'business' && plan !== 'business_team' ? (
            /* ---- Plan non Business : teaser verrouillé ---- */
            <div style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 14, padding: '20px 18px' }}>
              <p style={{ fontSize: '1.3rem', margin: '0 0 10px' }}>✉️</p>
              <p style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', margin: '0 0 8px' }}>
                Une signature email qui vend pour vous
              </p>
              <p style={{ fontSize: '0.82rem', color: '#9CA3AF', lineHeight: 1.7, margin: '0 0 16px' }}>
                Chaque email que vous envoyez depuis votre ordinateur affichera automatiquement votre photo, vos coordonnées et vos réseaux sociaux — comme une carte de visite au bas de chaque message.
              </p>
              <p style={{ fontSize: '0.82rem', color: '#D4A843', fontWeight: 600, margin: '0 0 16px' }}>
                Avec le plan Business, notre équipe configure tout pour vous (Gmail, Outlook, Apple Mail). Vous n&apos;avez rien à faire.
              </p>
              <button
                type="button"
                onClick={() => setUpgradeTarget('business')}
                style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.35)', color: '#D4A843', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Passer au plan Business
              </button>
            </div>

          ) : (
            /* ---- Plan Business : feature complète ---- */
            <>
              {/* Explication */}
              <div style={{ background: 'rgba(0,207,255,0.05)', border: '1px solid rgba(0,207,255,0.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: '#00CFFF', fontSize: '0.82rem', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Comment ça fonctionne ?
                </p>
                <p style={{ fontSize: '0.82rem', color: '#9CA3AF', lineHeight: 1.7, margin: 0 }}>
                  Votre signature professionnelle s&apos;affiche automatiquement au bas de chaque email envoyé depuis votre ordinateur. Chaque destinataire voit votre photo, vos coordonnées et vos réseaux sociaux — sans que vous n&apos;ayez à rien faire à chaque fois.
                </p>
              </div>

              {/* Aperçu */}
              <p style={{ fontSize: '0.72rem', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Aperçu de votre signature</p>
              <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px', marginBottom: 16, overflow: 'auto' }}
                dangerouslySetInnerHTML={{ __html: generateSignatureHTML(profile) }}
              />

              {/* Bouton installation gratuite */}
              {installRequested ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <div>
                    <p style={{ fontWeight: 700, color: '#22C55E', fontSize: '0.875rem', margin: 0 }}>Demande envoyée !</p>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0' }}>Notre équipe vous contacte sous 24h pour configurer votre signature.</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestInstall}
                  disabled={installLoading}
                  style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'linear-gradient(135deg,#D4A843,#c49535)', border: 'none', color: '#0D0D1A', fontWeight: 800, fontSize: '0.9rem', cursor: installLoading ? 'not-allowed' : 'pointer', marginBottom: 12, opacity: installLoading ? 0.7 : 1 }}
                >
                  {installLoading ? 'Envoi...' : '✉️ Demander l\'installation gratuite'}
                </button>
              )}

              {/* Guide autonome */}
              <details style={{ marginTop: 4 }}>
                <summary style={{ fontSize: '0.78rem', color: '#4B5563', cursor: 'pointer', userSelect: 'none', padding: '8px 0' }}>
                  Installer moi-même (Gmail, Outlook, Apple Mail)
                </summary>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { app: 'Gmail', steps: ['Ouvrir Gmail sur ordinateur', 'Paramètres (⚙️) → Voir tous les paramètres', 'Onglet "Général" → section "Signature"', 'Créer une signature → cliquer l\'icône HTML (<>)', 'Coller le code → Enregistrer'] },
                    { app: 'Outlook', steps: ['Ouvrir Outlook sur ordinateur', 'Nouveau message → Insérer → Signature', 'Gérer les signatures → Nouvelle', 'Dans l\'éditeur : cliquer source HTML', 'Coller le code → OK → Enregistrer'] },
                    { app: 'Apple Mail (Mac)', steps: ['Mail → Préférences → Signatures', 'Sélectionner votre compte → cliquer +', 'Désactiver "Toujours correspondre à mon style"', 'Coller le code HTML → fermer'] },
                  ].map(({ app, steps }) => (
                    <div key={app} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem', margin: '0 0 8px' }}>{app}</p>
                      <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {steps.map((s, i) => <li key={i} style={{ fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.5 }}>{s}</li>)}
                      </ol>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleCopySignature}
                    style={{ padding: '10px', borderRadius: 10, background: sigCopied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sigCopied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, color: sigCopied ? '#22C55E' : '#9CA3AF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    {sigCopied ? '✓ Code HTML copié !' : 'Copier le code HTML'}
                  </button>
                </div>
              </details>
            </>
          )}
        </div>

        {/* Spacer pour la save bar fixe */}
        <div style={{ height: 80 }} />
      </div>

        </div>{/* fin mainContent */}

        {/* Panneau aperçu live (desktop uniquement) */}
        <aside className={styles.previewPanel} style={{ display: PREVIEW_SECTIONS.has(activeSection) ? 'flex' : 'none' }}>
          <p className={styles.previewTitle}>Aperçu de votre carte</p>
          <MiniCardPreview
                    form={form}
                    profile={profile}
                    theme={{
                      bg_color:        profile.bg_color,
                      primary_color:   profile.primary_color,
                      secondary_color: profile.secondary_color,
                      text_color:      profile.text_color,
                      font_heading:    profile.font_heading,
                    }}
                  />
        </aside>

      </div>{/* fin desktopWrapper */}

      {/* Modal Gestion d'équipe */}
      {showTeamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTeamModal(false); }}>
          <div style={{ background: '#13131F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', margin: '0 0 20px' }}>
              {editingMember ? 'Modifier le membre' : 'Ajouter un membre'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={teamLabelStyle}>Nom complet *</label>
                <input
                  style={teamInputStyle}
                  placeholder="Jean Dupont"
                  value={teamForm.name}
                  onChange={e => {
                    const name = e.target.value;
                    setTeamForm(f => ({ ...f, name, slug: editingMember ? f.slug : slugifyMember(name) }));
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={teamLabelStyle}>Email *</label>
                  <input style={teamInputStyle} type="email" placeholder="jean@email.com" value={teamForm.email}
                    onChange={e => setTeamForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={teamLabelStyle}>Téléphone</label>
                  <input style={teamInputStyle} placeholder="+33 6..." value={teamForm.phone}
                    onChange={e => setTeamForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={teamLabelStyle}>Poste</label>
                <input style={teamInputStyle} placeholder="Directeur commercial" value={teamForm.title}
                  onChange={e => setTeamForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={teamLabelStyle}>LinkedIn</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                    <span style={{ padding: '10px 8px', fontSize: '0.7rem', color: '#0A66C2', whiteSpace: 'nowrap', fontWeight: 700 }}>in/</span>
                    <input style={{ ...teamInputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }}
                      placeholder="jean-dupont" value={teamForm.linkedin}
                      onChange={e => setTeamForm(f => ({ ...f, linkedin: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={teamLabelStyle}>X (Twitter)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                    <span style={{ padding: '10px 8px', fontSize: '0.7rem', color: '#9CA3AF', whiteSpace: 'nowrap', fontWeight: 700 }}>@</span>
                    <input style={{ ...teamInputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }}
                      placeholder="jeandupont" value={teamForm.twitter}
                      onChange={e => setTeamForm(f => ({ ...f, twitter: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div>
                <label style={teamLabelStyle}>URL de la carte (slug) *</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 10px', fontSize: '0.72rem', color: '#4B5563', whiteSpace: 'nowrap' }}>/c/</span>
                  <input style={{ ...teamInputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }}
                    placeholder="jean-dupont" value={teamForm.slug}
                    onChange={e => setTeamForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>
              {teamError && <p style={{ color: '#F87171', fontSize: '0.8rem', margin: 0 }}>{teamError}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowTeamModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  Annuler
                </button>
                <button type="button" onClick={handleTeamSave} disabled={savingTeam}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#6C63FF,#00CFFF)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', opacity: savingTeam ? 0.7 : 1 }}>
                  {savingTeam ? 'Sauvegarde...' : (editingMember ? 'Enregistrer' : 'Créer la carte')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de recadrage photo */}
      {cropState && (
        <CropModal
          file={cropState.file}
          aspect={cropState.type === 'photo' ? 1 : 3}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropState(null)}
        />
      )}
    </div>
  );
}

const teamLabelStyle: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 };
const teamInputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: 'white', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
