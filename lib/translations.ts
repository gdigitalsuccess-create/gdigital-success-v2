// ============================================================
//  TRANSLATIONS — Labels UI génériques uniquement
//  Le contenu client (textes, titres, descriptions) est dans client.config.ts
// ============================================================
export type Lang = 'fr' | 'en';

export const TRANSLATIONS = {
  fr: {
    sending: 'Envoi en cours...',

    // Navigation
    nav_about:     'À propos',
    nav_services:  'Services',
    nav_ia:        'Solutions IA',
    nav_packs:     'Packs',
    nav_portfolio: 'Portfolio',
    nav_contact:   'Contact',

    // Urgency bar
    urgency_cta: 'Réserver →',

    // Hero
    hero_cta1: 'Demander un audit gratuit',
    hero_cta2: 'Voir nos solutions',

    // Section labels
    techno_label:    'Technologies maîtrisées',
    about_label:     'À propos',
    marches_label:   'Marchés ciblés',
    services_label:  'Services',
    ia_label:        'Intelligence Artificielle',
    pourquoi_label:  'Notre différence',
    packs_label:     'Tarifs',
    portfolio_label: 'Portfolio',
    cs_label:        'Résultats concrets',
    cs_defi:         'Défi',
    cs_solution:     'Solution',
    cs_resultat:     'Résultat',
    temo_label:      'Témoignages',
    temo_pending:    'Témoignage en cours de collecte...',
    temo_req:        'Laisser un avis →',
    offre_label:     'Offre unique',
    process_label:   'Comment ça marche',
    eng_label:       'Mes engagements',
    faq_label:       'FAQ',
    contact_label:   'Contact',

    // Portfolio
    status_live:  '● Live',
    status_soon:  'Bientôt',
    p_visit_link: 'Voir le site →',

    // WhatsApp
    wa_tooltip: 'Discuter sur WhatsApp',

    // Packs
    pack_cta:   'Commencer maintenant',
    packs_note: 'Tous les prix sont en USD. Chaque projet est unique — contactez-nous pour un devis personnalisé gratuit.',

    // Offre / pricing
    pricing_period: '/mois',
    pricing_label:  'Abonnement mensuel',
    pricing_cta:    'Souscrire à l\'abonnement',
    pricing_note:   'Sans engagement — résiliable à tout moment',

    // Contact channels
    ch1_title: 'Email professionnel',
    ch2_title: 'Email personnel',
    ch3_title: 'Téléphone',
    ch4_title: 'WhatsApp',

    // Calendly
    calendly_or:   'ou',
    calendly_btn:  'Réserver un appel gratuit de 30 min',
    calendly_note: 'Audit de votre projet · Sans engagement',

    // Form
    form_name_label:    'Nom complet',
    form_name_ph:       'Jean Dupont',
    form_email_label:   'Email',
    form_email_ph:      'jean@entreprise.com',
    form_subject_label: 'Type de projet',
    form_subject_ph:    'Choisissez un type de projet',
    form_o1:  'Audit gratuit de mon site',
    form_o2:  'Création d\'un nouveau site',
    form_o3:  'Refonte de site existant',
    form_o4:  'Agent IA pour mon entreprise',
    form_o5:  'Automatisation de processus',
    form_o6:  'Identité digitale / Branding',
    form_o7:  'Pack Basique',
    form_o8:  'Pack Pro',
    form_o9:  'Pack Premium',
    form_o10: 'Abonnement maintenance',
    form_o11: 'Autre demande',
    form_budget_label: 'Budget estimé',
    form_budget_ph:    'Sélectionnez une fourchette',
    form_b1: 'Moins de $250',
    form_b2: '$250 — $600',
    form_b3: '$600 — $1 200',
    form_b4: 'Plus de $1 200',
    form_b5: 'À discuter',
    form_delai_label: 'Délai souhaité',
    form_delai_ph:    'Quand souhaitez-vous démarrer ?',
    form_d1: 'Dès que possible (urgent)',
    form_d2: 'Dans 1 mois',
    form_d3: 'Dans 2 à 3 mois',
    form_d4: 'Pas de délai précis',
    form_msg_label: 'Message',
    form_msg_ph:    'Décrivez votre projet ou posez votre question...',
    form_submit:    'Envoyer ma demande',
    form_success:   'Merci ! Je vous réponds sous 24h.',
    form_error:     'Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.',

    // Footer
    footer_legal: 'Mentions légales',
  },

  en: {
    sending: 'Sending...',

    // Navigation
    nav_about:     'About',
    nav_services:  'Services',
    nav_ia:        'AI Solutions',
    nav_packs:     'Packages',
    nav_portfolio: 'Portfolio',
    nav_contact:   'Contact',

    // Urgency bar
    urgency_cta: 'Book now →',

    // Hero
    hero_cta1: 'Request a free audit',
    hero_cta2: 'Discover our solutions',

    // Section labels
    techno_label:    'Technologies we master',
    about_label:     'About',
    marches_label:   'Target markets',
    services_label:  'Services',
    ia_label:        'Artificial Intelligence',
    pourquoi_label:  'Our difference',
    packs_label:     'Pricing',
    portfolio_label: 'Portfolio',
    cs_label:        'Concrete results',
    cs_defi:         'Challenge',
    cs_solution:     'Solution',
    cs_resultat:     'Result',
    temo_label:      'Testimonials',
    temo_pending:    'Testimonial being collected...',
    temo_req:        'Leave a review →',
    offre_label:     'Unique offer',
    process_label:   'How it works',
    eng_label:       'My commitments',
    faq_label:       'FAQ',
    contact_label:   'Contact',

    // Portfolio
    status_live:  '● Live',
    status_soon:  'Coming soon',
    p_visit_link: 'Visit the site →',

    // WhatsApp
    wa_tooltip: 'Chat on WhatsApp',

    // Packs
    pack_cta:   'Get started now',
    packs_note: 'All prices are in USD. Every project is unique — contact us for a free personalized quote.',

    // Offre / pricing
    pricing_period: '/month',
    pricing_label:  'Monthly subscription',
    pricing_cta:    'Subscribe now',
    pricing_note:   'No commitment — cancel anytime',

    // Contact channels
    ch1_title: 'Professional email',
    ch2_title: 'Personal email',
    ch3_title: 'Phone',
    ch4_title: 'WhatsApp',

    // Calendly
    calendly_or:   'or',
    calendly_btn:  'Book a free 30-min call',
    calendly_note: 'Project audit · No commitment',

    // Form
    form_name_label:    'Full name',
    form_name_ph:       'John Doe',
    form_email_label:   'Email',
    form_email_ph:      'john@company.com',
    form_subject_label: 'Project type',
    form_subject_ph:    'Choose a project type',
    form_o1:  'Free site audit',
    form_o2:  'New website creation',
    form_o3:  'Existing site redesign',
    form_o4:  'AI agent for my business',
    form_o5:  'Process automation',
    form_o6:  'Digital identity / Branding',
    form_o7:  'Basic Package',
    form_o8:  'Pro Package',
    form_o9:  'Premium Package',
    form_o10: 'Maintenance subscription',
    form_o11: 'Other request',
    form_budget_label: 'Estimated budget',
    form_budget_ph:    'Select a range',
    form_b1: 'Less than $250',
    form_b2: '$250 — $600',
    form_b3: '$600 — $1,200',
    form_b4: 'More than $1,200',
    form_b5: 'To discuss',
    form_delai_label: 'Desired timeline',
    form_delai_ph:    'When would you like to start?',
    form_d1: 'As soon as possible (urgent)',
    form_d2: 'Within 1 month',
    form_d3: 'Within 2 to 3 months',
    form_d4: 'No specific timeline',
    form_msg_label: 'Message',
    form_msg_ph:    'Describe your project or ask your question...',
    form_submit:    'Send my request',
    form_success:   'Thank you! I\'ll reply within 24h.',
    form_error:     'An error occurred. Try again or contact us on WhatsApp.',

    // Footer
    footer_legal: 'Legal notice',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.fr;
