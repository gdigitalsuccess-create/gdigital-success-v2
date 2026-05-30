// ============================================================
//  CLIENT CONFIG — modifier uniquement ce fichier par client
// ============================================================
const config = {

  // ══════════════════════════════════════════════════════════
  // IDENTITÉ
  // ══════════════════════════════════════════════════════════
  name:        'G+Digital Success',
  tagline:     'Agence digitale & IA',
  domain:      'https://digitalsucces.tech',
  logo:        '/assets/logo.png',
  ceoPhoto:    '/assets/photo-ceo.jpg',
  ceoName:     'Paul Gilderic NYAMA MOUKAGNI',
  favicon:     '/assets/favicon.ico',

  // ══════════════════════════════════════════════════════════
  // CONTACT
  // ══════════════════════════════════════════════════════════
  email:       'contact@digitalsucces.tech',
  emailPerso:  'paulgildericnyamamoukagni@gmail.com',
  phone:       '+971582680034',
  whatsapp:    'https://wa.me/971582680034',
  calendly:    'https://calendly.com/gdigitalsuccess/30min',

  // ══════════════════════════════════════════════════════════
  // ANALYTICS & INTÉGRATIONS
  // ══════════════════════════════════════════════════════════
  ga4Id:       'G-W57S4WDG6N',
  chatbaseId:  'KwxP1_W8mIFe1Pc4YGmUi',

  // ══════════════════════════════════════════════════════════
  // COULEURS
  // ══════════════════════════════════════════════════════════
  colors: {
    primary:   '#6C63FF',
    secondary: '#3ECFCF',
    accent:    '#FF6B6B',
    dark:      '#0A0A0F',
  },

  // ══════════════════════════════════════════════════════════
  // DONNÉES STRUCTURÉES
  // ══════════════════════════════════════════════════════════
  stats: [
    { target: 3,  suffix: '+',  labelFr: 'Projets livrés',           labelEn: 'Projects delivered' },
    { target: 3,  suffix: '',   labelFr: 'Pays',                      labelEn: 'Countries' },
    { target: 8,  suffix: '+',  labelFr: 'Technologies maîtrisées',   labelEn: 'Technologies mastered' },
    { target: 24, suffix: 'h',  labelFr: 'Délai de réponse garanti',  labelEn: 'Guaranteed response time' },
  ],

  technos: ['Next.js','React','TypeScript','Tailwind CSS','Node.js','Supabase','Stripe','Vercel','PostgreSQL','Python','LangChain','Framer Motion'],

  marches: [
    { flag: '🇬🇦', nameFr: 'Gabon',               descFr: 'Marché local — PME, commerces et services',                  nameEn: 'Gabon',    descEn: 'Home market — SMEs, retail & services' },
    { flag: '🇸🇳', nameFr: 'Sénégal',             descFr: 'Afrique de l\'Ouest — startups et boutiques',                nameEn: 'Senegal',  descEn: 'West Africa — startups & boutiques' },
    { flag: '🇦🇪', nameFr: 'Émirats Arabes Unis', descFr: 'Diaspora africaine & clients internationaux',                nameEn: 'UAE',      descEn: 'African diaspora & international clients', featured: true },
    { flag: '🇫🇷', nameFr: 'France',              descFr: 'Europe francophone — PME & entrepreneurs',                   nameEn: 'France',   descEn: 'Francophone Europe — SMEs & entrepreneurs' },
    { flag: '🌍',  nameFr: 'Partout ailleurs',     descFr: '100% remote — nous travaillons avec vous où que vous soyez', nameEn: 'Anywhere', descEn: '100% remote — we work with you wherever you are', world: true },
  ],

  portfolio: [
    { slug: 'furpaws', title: 'FurPaws UAE', type: 'E-commerce', image: '/assets/preview-furpaws.jpg', descFr: 'Boutique animaux · Next.js + Stripe · UAE', descEn: 'Pet accessories · Next.js + Stripe · UAE', url: 'https://furpaws-uae.com', status: 'live', flag: '🇦🇪', size: 'large' },
    { slug: 'jardin', title: 'Le Jardin Parfumerie', type: 'E-commerce · Parfumerie', image: '/assets/preview-jardin-real.jpg', descFr: 'Boutique luxe · Dakar, Sénégal', descEn: 'Luxury boutique · Dakar, Senegal', url: 'https://lejardinparfumerie.com', status: 'live', flag: '🇸🇳', size: 'small' },
    { slug: 'gpay', title: 'G+PAY Wallet', type: 'Fintech · Mobile Money', image: '/assets/preview-gpay.jpg', descFr: 'Paiement mobile · Afrique & Gabon', descEn: 'Mobile payment · Africa & Gabon', status: 'soon', flag: '🇬🇦', size: 'small' },
  ],

  packs: [
    {
      name: { fr: 'Basique', en: 'Basic' },
      tagline: { fr: 'Idéal pour démarrer en ligne', en: 'Ideal to get started online' },
      price: '$250',
      features: {
        fr: ['Site web professionnel','Design responsive mobile','Formulaire de contact','Optimisation SEO de base','Chatbot IA'],
        en: ['Professional website','Mobile responsive design','Contact form','Basic SEO optimization','AI Chatbot'],
      },
      highlighted: false,
    },
    {
      name: { fr: 'Pro', en: 'Pro' },
      tagline: { fr: 'Pour les entreprises en croissance', en: 'For growing businesses' },
      price: '$600',
      features: {
        fr: ['Site web + design premium','Responsive + animations','Chatbot intelligent','Automatisation email','SEO avancé','Agent IA personnalisé'],
        en: ['Website + premium design','Responsive + animations','Smart chatbot','Email automation','Advanced SEO','Custom AI Agent'],
      },
      badge: { fr: 'Recommandé', en: 'Recommended' },
      highlighted: true,
    },
    {
      name: { fr: 'Premium', en: 'Premium' },
      tagline: { fr: 'Transformation digitale complète', en: 'Complete digital transformation' },
      price: '$1 200',
      features: {
        fr: ['Site web + branding complet','Agent IA personnalisé','Automatisation complète','Clients, messages, suivi auto','Support mensuel inclus','Formation équipe'],
        en: ['Website + full branding','Custom AI agent','Full automation','Clients, messages, auto tracking','Monthly support included','Team training'],
      },
      highlighted: false,
    },
  ],

  subscription: {
    price: '$170',
    period: { fr: '/mois', en: '/month' },
  },

  // ══════════════════════════════════════════════════════════
  // CONTENU TEXTUEL FR / EN
  // C'est ici que tu changes tout le texte pour un nouveau client
  // ══════════════════════════════════════════════════════════
  content: {
    fr: {
      // Page
      pageTitle: 'G+Digital Success — Transformation Digitale',

      // Urgency bar
      urgencyMsg: '⚡ 2 places disponibles ce mois — audit gratuit offert pour tout nouveau projet',

      // Hero
      heroBadge: 'Disponible pour nouveaux projets',
      heroTitle: 'Transformez votre entreprise avec le digital et l\'IA.',
      heroTitleGradient: 'avec le digital et l\'IA.',
      heroSlogan: 'Invisible en ligne, c\'est un client de perdu chaque jour.',
      heroSubtitle: 'Nous aidons les entreprises à automatiser leurs tâches, attirer plus de clients et augmenter leur chiffre d\'affaires grâce à des solutions digitales et des agents IA.',
      heroStats: [
        { value: 'IA',   label: 'Agents intelligents' },
        { value: '3×',   label: 'Plus de clients' },
        { value: '24/7', label: 'Automatisation' },
      ],

      // About
      ceoRole: 'CEO & Fondateur',
      aboutTitle: 'Je ne fais pas que coder.\nJe construis votre présence.',
      aboutDesc1: 'Je ne livre pas juste des sites web. Je construis des systèmes digitaux qui génèrent des résultats concrets — plus de clients, plus de conversions, plus de chiffre d\'affaires.',
      aboutDesc2: 'Ma différence ? Je combine développement web sur mesure et agents IA pour automatiser ce qui vous coûte du temps : réponses clients, relances commerciales, prise de rendez-vous.',
      aboutTags: ['Création web', 'Refonte UX/UI', 'Branding', 'Mobile-first', 'Suivi post-livraison'],
      aboutFloaters: ['Design', 'Performance', 'SEO'],

      // Marchés
      marchesTitle: 'Nous intervenons partout dans le monde',
      marchesSubtitle: '100% à distance — de l\'Afrique au Moyen-Orient, en passant par l\'Europe.',

      // Services
      servicesTitle: 'Ce que nous proposons',
      servicesSubtitle: 'Digital, design et intelligence artificielle — une offre complète pour transformer votre entreprise.',
      services: [
        { title: 'Création de site web', desc: 'Site vitrine, e-commerce ou landing page — développé from scratch avec un design sur mesure, rapide et moderne.', items: ['Design personnalisé','Mobile-first','Optimisé SEO dès le départ','Livré avec formation'], link: 'Démarrer un projet →', badge: null },
        { title: 'Refonte & Amélioration', desc: 'Votre site existe mais donne une mauvaise image ? Je le transforme complètement : UX/UI, vitesse, mobile, conversion.', items: ['Audit complet gratuit','Nouveau design moderne','Performance x2 minimum','Accessibilité mobile'], link: 'Demander un audit →', badge: 'Le plus populaire' },
        { title: 'Automatisation & IA', desc: 'Gagnez du temps et augmentez vos revenus avec des agents IA qui travaillent pour vous — 24h/24, sans interruption.', items: ['Agents IA sur mesure','Automatisation emails & relances','Chatbot service client','Intégration dans votre site'], link: 'Découvrir les agents IA →', badge: null },
      ],

      // Agents IA
      agentsTitle: 'Nos agents IA pour votre entreprise',
      agentsSubtitle: 'Des agents intelligents qui automatisent vos tâches répétitives et travaillent pour vous en permanence.',
      agents: [
        { title: 'Agent IA Service Client', desc: 'Répond automatiquement aux questions de vos clients, 24h/24 et 7j/7.', items: ['Réponses instantanées','Disponible 24h/24','Capture de leads automatique'], link: 'En savoir plus →', badge: null },
        { title: 'Agent IA Commercial', desc: 'Relance automatiquement vos prospects et augmente vos ventes sans effort supplémentaire.', items: ['Relances automatiques','Offres personnalisées','Suivi des prospects'], link: 'En savoir plus →', badge: 'Meilleur ROI' },
        { title: 'Agent IA Réceptionniste', desc: 'Gère les demandes entrantes, prend les rendez-vous et oriente chaque visiteur automatiquement.', items: ['Prise de rendez-vous auto','Orientation des demandes','Notifications en temps réel'], link: 'En savoir plus →', badge: null },
        { title: 'Agent IA Marketing', desc: 'Génère du contenu, publie sur vos réseaux sociaux et automatise vos campagnes.', items: ['Génération de contenu','Publication automatique','Analyse des performances'], link: 'En savoir plus →', badge: null },
      ],

      // Pourquoi
      pourquoiTitle: 'Pourquoi choisir G+Digital Success ?',
      pourquoiSubtitle: 'Nous ne livrons pas juste un site. Nous construisons un outil de croissance.',
      pourquoiCards: [
        { icon: '🚀', title: 'Solutions modernes IA + Digital', desc: 'Nous intégrons les dernières technologies pour vous donner un avantage compétitif réel.' },
        { icon: '⚡', title: 'Gain de temps et automatisation', desc: 'Nos agents IA prennent en charge les tâches répétitives. Vous vous concentrez sur votre cœur de métier.' },
        { icon: '📈', title: 'Augmentation des ventes', desc: 'Un site optimisé + des agents IA commerciaux = plus de prospects, plus de conversions. Résultats mesurables.' },
        { icon: '🤝', title: 'Accompagnement personnalisé', desc: 'Consultant dédié du premier jour à la livraison et au-delà.' },
      ],

      // Packs
      packsTitle: 'Choisissez votre pack',
      packsSubtitle: 'Des offres claires, sans surprises. Chaque pack est livré clé en main.',

      // Portfolio
      portfolioTitle: 'Nos projets',
      portfolioSubtitle: 'Premiers clients en ligne — solutions concrètes, technologies modernes.',
      portfolioCta: { title: 'Votre projet ici', desc: 'Vous avez un projet en tête ? Parlons-en — audit gratuit, sans engagement.', btn: 'Démarrer maintenant' },

      // Case Studies
      caseStudiesTitle: 'Ce que nous avons livré',
      caseStudiesSubtitle: 'Chaque projet résout un vrai problème business.',
      caseStudies: [
        { flag: '🇦🇪', name: 'FurPaws UAE', domain: 'E-commerce', color: '#6C63FF', delay: '0s', defi: 'Boutique animaux sans présence digitale — zéro vente en ligne malgré une forte demande.', solution: 'E-commerce Next.js + Stripe UAE, catalogue produits, chatbot IA 24/7 intégré.', result: 'Live en 10 jours · Stripe UAE opérationnel · Chatbot actif 24/7' },
        { flag: '🇸🇳', name: 'Le Jardin Parfumerie', domain: 'Site vitrine', color: '#3ECFCF', delay: '0.5s', defi: 'Boutique de luxe sans image digitale — clients incapables de trouver la marque en ligne.', solution: 'Site vitrine premium, galerie produits élégante, identité visuelle cohérente.', result: 'Live en 7 jours · Présence digitale établie · Image luxe préservée' },
        { flag: '🇬🇦', name: 'G+PAY Wallet', domain: 'Fintech', color: '#FF6B6B', delay: '1s', defi: 'Besoin d\'une solution de paiement mobile pour l\'Afrique — aucune plateforme locale adaptée.', solution: 'Interface fintech moderne, dashboard utilisateur, intégration Mobile Money Afrique.', result: 'MVP complet livré · Design fintech premium · Déploiement en cours' },
      ],

      // Témoignages
      temoTitle: 'Ce que disent nos clients',
      temoSubtitle: 'Un premier avis reçu — et ce n\'est que le début.',
      temoClients: [
        { initial: 'F', name: 'FurPaws UAE',          country: '🇦🇪 Émirats Arabes Unis', waName: 'FurPaws',       photo: '/assets/furpaws-ceo.jpg' as string | undefined, personName: 'Mr. Chaudhary M. Rehan Babar' as string | undefined, role: 'CEO · FurPaws UAE' as string | undefined, quote: 'Thanks for your help to build our website. It\'s really nice to work with you. The website is so good to see and operate — fulfilling our needs as we were expecting. Thanks.' as string | undefined },
        { initial: 'J', name: 'Le Jardin Parfumerie', country: '🇸🇳 Sénégal',             waName: 'Le%20Jardin',   photo: '/assets/dalhia-nanda.jpg' as string | undefined,  personName: 'Mme Dalhia NANDA' as string | undefined, role: 'CEO · Le Jardin Parfumerie' as string | undefined, quote: 'Étant une personne exigeante, vous avez su répondre à mes attentes surélevées et ce n\'est pas anodin. Merci et bonne continuation.' as string | undefined },
        { initial: 'G', name: 'G+PAY Wallet',         country: '🇬🇦 Gabon',               waName: 'G%2BPAY',       photo: undefined as string | undefined, personName: undefined as string | undefined, role: undefined as string | undefined, quote: undefined as string | undefined },
      ],

      // Offre
      offreTitle: 'Votre site, géré à long terme.',
      offreDesc: 'La plupart des agences livrent et disparaissent. Moi, je reste. Un abonnement mensuel pour que votre site continue de performer.',
      offreFeatures: [
        { icon: '🔧', title: 'Maintenance continue',    desc: 'Corrections de bugs, mises à jour, sécurité' },
        { icon: '📈', title: 'Optimisation continue',   desc: 'Vitesse, SEO, taux de conversion' },
        { icon: '💬', title: 'Support technique',       desc: 'Réponse sous 24h, toujours disponible' },
        { icon: '✏️', title: 'Mises à jour contenu',   desc: 'Actualités, produits, prix — à votre demande' },
      ],
      pricingTagline: 'Tout inclus. Aucune surprise.',
      pricingItems: ['Maintenance mensuelle','Mises à jour illimitées','Support prioritaire','Rapport mensuel performance','Optimisation SEO continue'],

      // Process
      processTitle: 'Un processus simple et transparent',
      steps: [
        { title: 'Audit gratuit',      desc: 'On analyse votre situation actuelle et on définit ensemble vos objectifs.' },
        { title: 'Proposition',        desc: 'Je vous présente une proposition détaillée : design, fonctionnalités, délai, tarif.' },
        { title: 'Création',           desc: 'Je développe votre site avec des points de validation réguliers.' },
        { title: 'Livraison & Suivi',  desc: 'Mise en ligne, formation, et accompagnement long terme si vous le souhaitez.' },
      ],

      // Engagements
      engTitle: 'Ce que je vous garantis',
      engSubtitle: 'Pas de grandes promesses — des engagements concrets que je respecte sur chaque projet.',
      engagements: [
        { title: 'Délais respectés',            desc: 'Je m\'engage sur une date de livraison précise dès le début du projet.' },
        { title: 'Révisions incluses',          desc: 'Jusqu\'à 3 révisions gratuites pour que le résultat corresponde exactement à vos attentes.' },
        { title: 'Audit gratuit',               desc: 'On analyse votre situation en détail avant de commencer. Aucun engagement.' },
        { title: 'Suivi 30 jours',              desc: 'Je reste disponible 30 jours après la mise en ligne.' },
        { title: 'Communication transparente',  desc: 'Vous suivez l\'avancement en temps réel. Aucune surprise.' },
        { title: 'Satisfaction garantie',       desc: 'Si le résultat ne correspond pas au brief validé, on recommence.' },
      ],

      // FAQ
      faqTitle: 'Questions fréquentes',
      faqSubtitle: 'Tout ce que vous voulez savoir avant de démarrer.',
      faqs: [
        { q: 'Combien coûte un site web ?',               a: 'Nos packs démarrent à $250 pour un site vitrine. Un e-commerce commence à $600. Nous offrons un audit gratuit pour vous donner un devis précis sous 24h.' },
        { q: 'Quel est le délai de livraison ?',           a: 'Un site vitrine est livré en 5 à 10 jours. Un e-commerce complet prend 2 à 4 semaines.' },
        { q: 'Je n\'ai pas de contenu — vous pouvez aider ?', a: 'Oui. Nous vous guidons sur les textes, les images et la structure.' },
        { q: 'Puis-je modifier mon site seul après livraison ?', a: 'Oui. Nous configurons un tableau de bord simple. Une formation est incluse à la livraison.' },
        { q: 'Qu\'est-ce qu\'un agent IA ?',              a: 'Un chatbot intelligent qui répond à vos clients 24h/24 sur votre site et WhatsApp.' },
        { q: 'Proposez-vous une maintenance après livraison ?', a: 'Oui, abonnement mensuel à partir de $170/mois : mises à jour, sécurité, corrections.' },
        { q: 'Travaillez-vous avec des clients hors d\'Afrique ?', a: 'Oui. 100% à distance — Gabon, France, UAE, Sénégal. WhatsApp, email ou visio.' },
        { q: 'Comment se passe le paiement ?',            a: 'Virements, Mobile Money (Orange, MTN, Wave) et Stripe. Acompte 50% au démarrage.' },
      ],

      // Contact
      contactTitle: 'Parlons de votre projet.',
      contactDesc: 'Que vous ayez un projet précis ou juste des questions, je vous réponds sous 24h. L\'audit initial est toujours gratuit.',

      // Footer
      footerTagline: 'Agence digitale & IA — Votre transformation commence ici.',
      footerCopy: `© ${new Date().getFullYear()} G+Digital Success. Agence digitale & IA. Tous droits réservés.`,
    },

    en: {
      // Page
      pageTitle: 'G+Digital Success — Digital Transformation',

      // Urgency bar
      urgencyMsg: '⚡ 2 spots available this month — free audit for every new project',

      // Hero
      heroBadge: 'Available for new projects',
      heroTitle: 'Transform your business with digital & AI.',
      heroTitleGradient: 'with digital & AI.',
      heroSlogan: 'Invisible online means a lost client every single day.',
      heroSubtitle: 'We help businesses automate their tasks, attract more clients, and grow their revenue through digital solutions and AI agents.',
      heroStats: [
        { value: 'AI',   label: 'Smart agents' },
        { value: '3×',   label: 'More clients' },
        { value: '24/7', label: 'Automation' },
      ],

      // About
      ceoRole: 'CEO & Founder',
      aboutTitle: 'I don\'t just code.\nI build your presence.',
      aboutDesc1: 'I don\'t just deliver websites. I build digital systems that generate concrete results — more clients, more conversions, more revenue.',
      aboutDesc2: 'My difference? I combine custom web development with AI agents to automate what costs you time: client responses, sales follow-ups, appointment booking.',
      aboutTags: ['Web creation', 'UX/UI Redesign', 'Branding', 'Mobile-first', 'Post-delivery support'],
      aboutFloaters: ['Design', 'Performance', 'SEO'],

      // Marchés
      marchesTitle: 'We work anywhere in the world',
      marchesSubtitle: '100% remote — from Africa to the Middle East to Europe.',

      // Services
      servicesTitle: 'What we offer',
      servicesSubtitle: 'Digital, design and artificial intelligence — a complete offering to transform your business.',
      services: [
        { title: 'Website creation', desc: 'Showcase site, e-commerce or landing page — built from scratch with a custom design, fast and modern.', items: ['Custom design','Mobile-first','SEO optimized from the start','Delivered with training'], link: 'Start a project →', badge: null },
        { title: 'Redesign & Improvement', desc: 'Your site exists but gives a poor image? I transform it completely: UX/UI, speed, mobile, conversion.', items: ['Full free audit','New modern design','Performance x2 minimum','Mobile accessibility'], link: 'Request an audit →', badge: 'Most popular' },
        { title: 'Automation & AI', desc: 'Save time and increase revenue with AI agents working for you — 24/7, without interruption.', items: ['Custom AI agents','Email & follow-up automation','Customer service chatbot','Integration into your website'], link: 'Discover AI agents →', badge: null },
      ],

      // Agents IA
      agentsTitle: 'Our AI agents for your business',
      agentsSubtitle: 'Smart agents that automate your repetitive tasks and work for you around the clock.',
      agents: [
        { title: 'Customer Service AI Agent', desc: 'Automatically answers your clients\' questions, 24/7.', items: ['Instant responses','Available 24/7','Automatic lead capture'], link: 'Learn more →', badge: null },
        { title: 'Sales AI Agent', desc: 'Automatically follows up on prospects and increases your sales with no extra effort.', items: ['Automatic follow-ups','Personalized offers','Prospect tracking'], link: 'Learn more →', badge: 'Best ROI' },
        { title: 'Receptionist AI Agent', desc: 'Handles incoming requests, books appointments, and routes each visitor automatically.', items: ['Auto appointment booking','Request routing','Real-time notifications'], link: 'Learn more →', badge: null },
        { title: 'Marketing AI Agent', desc: 'Generates content, posts on your social media, and automates your campaigns.', items: ['Content generation','Auto publishing','Performance analytics'], link: 'Learn more →', badge: null },
      ],

      // Pourquoi
      pourquoiTitle: 'Why choose G+Digital Success?',
      pourquoiSubtitle: 'We don\'t just deliver a website. We build a growth tool.',
      pourquoiCards: [
        { icon: '🚀', title: 'Modern AI + Digital solutions', desc: 'We integrate the latest technologies to give you a real competitive edge.' },
        { icon: '⚡', title: 'Time savings and automation', desc: 'Our AI agents handle repetitive tasks. You focus on your core business.' },
        { icon: '📈', title: 'Sales growth', desc: 'An optimized website + commercial AI agents = more leads, more conversions. Measurable results.' },
        { icon: '🤝', title: 'Personalized support', desc: 'Dedicated consultant from day one through delivery and beyond.' },
      ],

      // Packs
      packsTitle: 'Choose your package',
      packsSubtitle: 'Clear offers, no surprises. Every package delivered turnkey.',

      // Portfolio
      portfolioTitle: 'Our projects',
      portfolioSubtitle: 'First clients live — concrete solutions, modern technologies.',
      portfolioCta: { title: 'Your project here', desc: 'Have a project in mind? Let\'s talk — free audit, no commitment.', btn: 'Start now' },

      // Case Studies
      caseStudiesTitle: 'What we have delivered',
      caseStudiesSubtitle: 'Every project solves a real business problem.',
      caseStudies: [
        { flag: '🇦🇪', name: 'FurPaws UAE', domain: 'E-commerce', color: '#6C63FF', delay: '0s', defi: 'Pet shop with no digital presence — zero online sales despite strong local demand.', solution: 'Full e-commerce Next.js + Stripe UAE, product catalog, 24/7 AI chatbot.', result: 'Live in 10 days · Stripe UAE operational · Chatbot active 24/7' },
        { flag: '🇸🇳', name: 'Le Jardin Parfumerie', domain: 'Showcase site', color: '#3ECFCF', delay: '0.5s', defi: 'Luxury boutique with no digital image — customers unable to find the brand online.', solution: 'Premium showcase site, elegant product gallery, consistent visual identity.', result: 'Live in 7 days · Digital presence established · Luxury image preserved' },
        { flag: '🇬🇦', name: 'G+PAY Wallet', domain: 'Fintech', color: '#FF6B6B', delay: '1s', defi: 'Need for a modern mobile payment solution for Africa — no suitable local platform.', solution: 'Modern fintech interface, user dashboard, Mobile Money Africa integration.', result: 'Full MVP delivered · Premium fintech design · Deployment in progress' },
      ],

      // Témoignages
      temoTitle: 'What our clients say',
      temoSubtitle: 'First real review in — and this is just the beginning.',
      temoClients: [
        { initial: 'F', name: 'FurPaws UAE',          country: '🇦🇪 United Arab Emirates', waName: 'FurPaws',       photo: '/assets/furpaws-ceo.jpg' as string | undefined, personName: 'Mr. Chaudhary M. Rehan Babar' as string | undefined, role: 'CEO · FurPaws UAE' as string | undefined, quote: 'Thanks for your help to build our website. It\'s really nice to work with you. The website is so good to see and operate — fulfilling our needs as we were expecting. Thanks.' as string | undefined },
        { initial: 'J', name: 'Le Jardin Parfumerie', country: '🇸🇳 Senegal',              waName: 'Le%20Jardin',   photo: '/assets/dalhia-nanda.jpg' as string | undefined,  personName: 'Mme Dalhia NANDA' as string | undefined, role: 'CEO · Le Jardin Parfumerie' as string | undefined, quote: 'Being a demanding person, you managed to meet my high expectations — and that is not a small thing. Thank you and all the best.' as string | undefined },
        { initial: 'G', name: 'G+PAY Wallet',         country: '🇬🇦 Gabon',                waName: 'G%2BPAY',       photo: undefined as string | undefined, personName: undefined as string | undefined, role: undefined as string | undefined, quote: undefined as string | undefined },
      ],

      // Offre
      offreTitle: 'Your site, managed long-term.',
      offreDesc: 'Most agencies deliver and disappear. Not me. A monthly subscription so your site keeps performing.',
      offreFeatures: [
        { icon: '🔧', title: 'Ongoing maintenance',   desc: 'Bug fixes, updates, security' },
        { icon: '📈', title: 'Ongoing optimization',  desc: 'Speed, SEO, conversion rate' },
        { icon: '💬', title: 'Technical support',     desc: 'Response within 24h, always available' },
        { icon: '✏️', title: 'Content updates',       desc: 'News, products, prices — on request' },
      ],
      pricingTagline: 'All included. No surprises.',
      pricingItems: ['Monthly maintenance','Unlimited updates','Priority support','Monthly performance report','Ongoing SEO optimization'],

      // Process
      processTitle: 'A simple and transparent process',
      steps: [
        { title: 'Free audit',        desc: 'We analyze your current situation and define your objectives together.' },
        { title: 'Proposal',          desc: 'I present a detailed proposal: design, features, timeline, price.' },
        { title: 'Creation',          desc: 'I develop your site with regular validation checkpoints.' },
        { title: 'Delivery & Follow-up', desc: 'Go live, training, and long-term support if you wish.' },
      ],

      // Engagements
      engTitle: 'What I guarantee you',
      engSubtitle: 'No empty promises — concrete commitments I keep on every project.',
      engagements: [
        { title: 'Deadlines respected',         desc: 'I commit to a precise delivery date from the start.' },
        { title: 'Revisions included',          desc: 'Up to 3 free revisions so the result matches your vision.' },
        { title: 'Free audit',                  desc: 'We analyze your situation in detail before starting. No commitment.' },
        { title: '30-day follow-up',            desc: 'I stay available 30 days after launch.' },
        { title: 'Transparent communication',   desc: 'You track progress in real time. No surprises.' },
        { title: 'Satisfaction guaranteed',     desc: 'If the result doesn\'t match the brief, we start over.' },
      ],

      // FAQ
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Everything you want to know before getting started.',
      faqs: [
        { q: 'How much does a website cost?',          a: 'Our packages start at $250 for a showcase site. An e-commerce site starts at $600. We offer a free audit to give you a precise quote within 24h.' },
        { q: 'What is the delivery timeline?',          a: 'A showcase site is delivered in 5 to 10 days. A full e-commerce takes 2 to 4 weeks.' },
        { q: 'I don\'t have content — can you help?',  a: 'Yes. We guide you on texts, images, and structure.' },
        { q: 'Can I edit my site myself after delivery?', a: 'Yes. We set up a simple dashboard. Training is included at delivery.' },
        { q: 'What is an AI agent?',                   a: 'A smart chatbot that answers your clients 24/7 on your site and WhatsApp.' },
        { q: 'Do you offer maintenance after delivery?', a: 'Yes, monthly subscription from $170/month: updates, security, fixes.' },
        { q: 'Do you work with clients outside Africa?', a: 'Yes. 100% remote — Gabon, France, UAE, Senegal. WhatsApp, email, or video call.' },
        { q: 'How does payment work?',                 a: 'Bank transfers, Mobile Money (Orange, MTN, Wave), and Stripe. 50% deposit to start.' },
      ],

      // Contact
      contactTitle: 'Let\'s talk about your project.',
      contactDesc: 'Whether you have a specific project or just questions, I\'ll reply within 24h. The initial audit is always free.',

      // Footer
      footerTagline: 'Digital & AI Agency — Your transformation starts here.',
      footerCopy: `© ${new Date().getFullYear()} G+Digital Success. Digital & AI Agency. All rights reserved.`,
    },
  },
} as const;

export default config;
