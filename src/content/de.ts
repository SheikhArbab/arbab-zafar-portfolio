/**
 * German versions of the default content, stored per row as translations.de.<field>.
 * Faithful translations of the English text only: no new claims. Fields left out fall back to English.
 * After seeding, German text is edited in /admin on each editor's "Deutsch" tab.
 */

type T = Record<string, unknown>

export const deProfile: T = {
  title: 'Softwareentwickler · Full-Stack-Entwickler',
  availability_text: 'Offen für neue Möglichkeiten',
  hero_eyebrow: 'Softwareentwickler bei CyberSoft Vantage',
  hero_heading: 'Full-Stack-Produkte, durchgängig entwickelt.',
  hero_highlight: 'entwickelt',
  hero_description:
    'Ich bin Arbab Zafar, Softwareentwickler mit rund drei Jahren Erfahrung. Ich entwickle Web-Apps, mobile Apps, Dashboards und die APIs dahinter, mit React, Next.js, React Native, Angular, Node.js und .NET.',
  hero_roles: ['React- & Next.js-Entwickler', 'React-Native-Entwickler', 'MERN-Stack-Entwickler', 'Angular-Entwickler'],
  terminal_lines: [
    { key: 'user', value: 'arbab-zafar' },
    { key: 'role', value: 'softwareentwickler' },
    { key: 'stack', value: 'full-stack-entwicklung' },
    { key: 'base', value: 'pakistan' },
    { key: 'status', value: 'entwickelt digitale Erlebnisse' },
  ],
  about_heading: 'Der Entwickler hinter der Oberfläche',
  about_lead:
    'Ich bin Full-Stack-Entwickler aus Pakistan und mache aus vagen Anforderungen gern Software, die sich klar bedienen und einfach warten lässt.',
  about_body: [
    'Angefangen habe ich als Praktikant in der Softwareentwicklung. Gewachsen bin ich durch praktische Produktarbeit bei CyberSoft Vantage in Islamabad: zuerst mit Angular-Frontends, dann mit Anwendungen auf dem MERN-Stack und heute mit React Native und Next.js für Mobile und Web.',
    'Der Großteil meiner Arbeit liegt an der Schnittstelle von Frontend und Backend. Ich entwerfe Komponentensysteme und Dashboards, verwalte den State mit Redux Toolkit, RTK Query oder Angular Signals und schreibe die REST-APIs in Node.js/Express oder ASP.NET Core, die sie mit Daten versorgen.',
    'Neben der Arbeit lerne ich Deutsch und bereite mich auf berufliche Möglichkeiten in Deutschland vor, mit derselben ruhigen, schrittweisen Herangehensweise wie in der Softwareentwicklung.',
  ].join('\n\n'),
  about_highlights: [
    { label: 'Erfahrung', value: '~3 Jahre' },
    { label: 'Aktuell bei', value: 'CyberSoft Vantage' },
    { label: 'Standort', value: 'Pakistan' },
    { label: 'Fokus', value: 'Web · Mobile · APIs' },
  ],
  about_cards: [
    { title: 'Was ich baue', body: 'Webanwendungen, Admin-Dashboards, plattformübergreifende mobile Apps und die REST-APIs dahinter.' },
    { title: 'Wie ich arbeite', body: 'Typisierter Code, wiederverwendbare Komponenten, vorhersehbarer State und Layouts, die auf jeder Bildschirmgröße funktionieren.' },
    { title: 'Was mir wichtig ist', body: 'Software, die Menschen gern benutzen: schnell, verständlich und zuverlässig, mit Sorgfalt im Detail.' },
  ],
  german: {
    points: [
      'Interessiert an beruflichen Möglichkeiten in Deutschland',
      'Ziel: Ausbildung Fachinformatiker für Anwendungsentwicklung',
      'Nächster Meilenstein: B1 → B2',
    ],
  },
}

export const deSettings: T = {
  seo_title: 'Arbab Zafar: Softwareentwickler & Full-Stack-Entwickler',
  seo_description:
    'Arbab Zafar ist Softwareentwickler und Full-Stack-Entwickler in Pakistan und baut Web- und Mobile-Produkte mit React, Next.js, React Native, Angular, Node.js und .NET.',
  seo_keywords: [
    'Arbab Zafar',
    'Arbab Zafar Softwareentwickler',
    'Full-Stack-Entwickler',
    'React Entwickler',
    'Next.js Entwickler',
    'MERN Stack Entwickler',
    'React Native Entwickler',
  ],
  maintenance_message: 'Das Portfolio wird gerade aktualisiert. Bitte schauen Sie bald wieder vorbei.',
  content: {
    nav: {
      home: 'Start',
      about: 'Über mich',
      experience: 'Erfahrung',
      skills: 'Skills',
      projects: 'Projekte',
      education: 'Ausbildung',
      contact: 'Kontakt',
    },
    hero: { cta_projects: 'Projekte ansehen', cta_cv: 'Lebenslauf herunterladen', cta_contact: 'Kontakt aufnehmen' },
    about: { eyebrow: 'über mich', heading: 'Der Entwickler hinter der Oberfläche' },
    experience: {
      eyebrow: 'erfahrung',
      heading: 'Eine Karriere, Release für Release',
      description: 'Mein Werdegang bei CyberSoft Vantage: vom Praktikanten bis zur Auslieferung von Web- und Mobile-Produkten.',
    },
    skills: { eyebrow: 'stack', heading: 'Meine Werkzeuge', description: 'Die Sprachen, Frameworks und Plattformen, mit denen ich täglich arbeite.' },
    featured: {
      eyebrow: 'ausgewählte arbeiten',
      heading: 'Ausgewählte Projekte',
      description: 'Einige Projekte, die zeigen, wie ich Produkte von Anfang bis Ende umsetze.',
    },
    projects: { eyebrow: 'archiv', heading: 'Alle Projekte', description: 'Alle veröffentlichten Projekte durchsuchen und filtern.' },
    education: { eyebrow: 'lernen', heading: 'Ausbildung & Zertifikate' },
    contact: {
      eyebrow: 'kontakt',
      heading: 'Kanal öffnen',
      description:
        'Sie haben eine Stelle, eine Produktidee oder eine Frage? Schreiben Sie mir. Die Nachricht landet direkt in meinem Postfach, und ich antworte persönlich.',
      submit_label: 'Nachricht senden',
      success_message: 'Nachricht erhalten. Ich melde mich bald bei Ihnen.',
    },
    playground: {
      eyebrow: 'playground',
      heading: 'Kurze Pause? Eine Runde spielen.',
      description: 'Drei kleine Browserspiele, die ich zum Spaß mit React und TypeScript gebaut habe. Bestwerte werden in Ihrem Browser gespeichert.',
    },
    footer: { tagline: 'Gestaltet und entwickelt von Arbab Zafar.', text: 'Alle Rechte vorbehalten.' },
  },
}

/** Keyed by experience sort order (0 = current role). */
export const deExperiences: T[] = [
  {
    title: 'React-Native- & Next.js-Entwickler',
    description: 'Entwicklung plattformübergreifender mobiler Apps mit React Native und produktiver Webanwendungen mit Next.js.',
  },
  {
    title: 'MERN-Stack-Entwickler',
    description: 'Entwicklung von Full-Stack-Webanwendungen mit MongoDB, Express.js, React und Node.js, von REST-APIs bis zu Dashboards.',
  },
  {
    title: 'Angular-Entwickler',
    description: 'Umsetzung von Frontend-Features und Anwendungsoberflächen mit Angular und TypeScript.',
  },
  {
    title: 'Praktikant Softwareentwicklung',
    description: 'Einstieg ins Berufsleben: produktive Arbeitsabläufe kennengelernt und an Webprojekten mitgearbeitet.',
  },
]

/** Keyed by category slug. */
export const deCategories: Record<string, T> = {
  frontend: { description: 'Oberflächen & Web-Apps' },
  mobile: { description: 'Plattformübergreifende Apps' },
  backend: { description: 'APIs & Services' },
  databases: { name: 'Datenbanken', description: 'Daten & Speicherung' },
  'state-ui': { name: 'State & UI-Tools', description: 'State-Management & Styling' },
  platform: { name: 'Plattform & Workflow', description: 'Auslieferung & Zusammenarbeit' },
}

const LEARNING = 'Lernprojekt'
const CLIENT = 'Kundenwebsite'

/** Keyed by project slug. */
export const deProjects: Record<string, T> = {
  'techflow-llc': {
    category: CLIENT,
    short_description: 'Unternehmenswebsite für Tech Flow LLC, ein Technologie-Beratungsunternehmen, entwickelt mit Next.js.',
    description: [
      'Tech Flow LLC ist ein Technologie-Beratungsunternehmen mit Leistungen in Softwareentwicklung, QA-Testing, DevOps und Embedded Software.',
      'Ich habe die Marketing-Website des Unternehmens als mehrseitige Next.js-Anwendung entwickelt. Sie stellt das Unternehmen, seine Leistungen und Referenzen vor und gibt potenziellen Kunden und Bewerbern einen klaren Weg zur Kontaktaufnahme.',
    ].join('\n\n'),
    key_features: [
      'Eigene Seiten für Unternehmen, Leistungen, Referenzen, Karriere und Kontakt',
      'Inhalte zu Softwareentwicklung, QA-Testing, DevOps und Embedded Software',
      'Gebaut mit Next.js und React für schnelle, SEO-freundliche Seiten',
    ],
  },
  'sukna-capital-fintech-app': {
    title: 'Sukna Capital Fintech-App',
    short_description: 'Eine Fintech-Anwendung, entwickelt für Sukna Capital.',
  },
  'sims-dashboard': {
    short_description: 'Ein Admin-Dashboard auf Basis des MERN-Stacks, mit Formik und Yup für Formulare und Validierung.',
  },
  'saj-holding': {
    category: CLIENT,
    short_description:
      'Unternehmenswebsite für S.A.J Holding & Investment, eine Holding aus Abu Dhabi, von Hand gebaut mit HTML, CSS und JavaScript.',
    description: [
      'S.A.J Holding & Investment ist eine 2011 gegründete Holding mit Sitz in Abu Dhabi. Zu ihren Tochterunternehmen gehören Cardip UAE und EVS UAE.',
      'Ich habe die einseitige Unternehmenswebsite ohne Framework von Grund auf gebaut: eine Vorstellung des Unternehmens, die Tochterunternehmen mit Links zu ihren eigenen Websites, das Team und einen Kontaktbereich.',
    ].join('\n\n'),
    key_features: [
      'Animierter Partikel-Hero mit wechselnden Slogans (particles.js + Typed.js)',
      'Fixierte Navigation, die den gerade sichtbaren Abschnitt hervorhebt',
      'Responsives Team-Karussell mit ein bis drei Karten je nach Bildschirmgröße',
      'Karten der Tochterunternehmen mit Hover-Overlays und Links zu Cardip UAE und EVS UAE',
      'Animiertes Mobilmenü, SEO-Meta-Tags und fünf responsive Breakpoints',
    ],
  },
  'simple-meditation-app': {
    short_description:
      'Eine Meditations-App mit React Native, Expo Router und NativeWind: ein Willkommensbildschirm mit Farbverlauf und Natur-Meditationen in Tabs.',
    description: [
      'Eine mobile App, mit der ich React Native übe. Expo Router übernimmt die dateibasierte Navigation, NativeWind gestaltet die nativen Komponenten mit Tailwind-Klassen.',
      'Sie hat einen Willkommensbildschirm mit Farbverlauf und ein Tab-Layout für Natur-Meditationen und Affirmationen. Der Session-Player und der Affirmationen-Bildschirm sind noch in Arbeit.',
    ].join('\n\n'),
    key_features: [
      'Dateibasierte Navigation mit Expo Router: Willkommensbildschirm plus Tab-Layout (Nature Meditate, Affirmations)',
      'Tailwind-Styling nativer Komponenten mit NativeWind',
      'Sechs Natur-Sessions (Mountains, Rivers, Sunset, Beaches, Starry Night, Waterfall) als Bildkarten in einer FlatList',
      'Wiederverwendbarer Farbverlauf-Hintergrund sowie eigene Button- und Header-Komponenten',
    ],
  },
  'fitness-app-react-native': {
    title: 'Fitness-App (React Native)',
    short_description:
      'Die Oberfläche einer Fitness-App mit React Native, Expo Router und NativeWind, mit Willkommensbildschirm und animiertem Bildkarussell.',
    description: [
      'Eine mobile App, mit der ich React-Native-Oberflächen mit Expo Router und NativeWind erkunde.',
      'Ein bildschirmfüllender Willkommensbildschirm führt zu einem Startbildschirm mit animiertem Bildkarussell und Layouts, die sich an unterschiedliche Smartphone-Bildschirme anpassen. Die Trainingsinhalte sind noch in Arbeit.',
    ].join('\n\n'),
    key_features: [
      'Willkommensbildschirm mit Call-to-Action, der zum Startbildschirm navigiert (Expo Router)',
      'Animiertes Bildkarussell auf Basis von react-native-reanimated-carousel',
      'Bildschirmrelative Größen mit react-native-responsive-screen',
      'Tailwind-Styling mit NativeWind',
    ],
  },
  'mern-blog-platform': {
    title: 'MERN-Blog-Plattform',
    category: LEARNING,
    short_description: 'Ein Full-Stack-Blog mit Authentifizierung, Rich-Text-Editor, Suche, Kommentaren und Admin-Dashboard.',
    description: [
      'Eine Full-Stack-Blogplattform mit React-Client und einer REST-API auf Basis von Express und MongoDB. Entstanden beim Lernen des MERN-Stacks, ausgehend von einem bekannten MERN-Blog-Tutorial.',
      'Leser können Beiträge durchsuchen und nach der Anmeldung kommentieren. Admins schreiben, bearbeiten und löschen Beiträge und verwalten Nutzer über ein Dashboard.',
    ].join('\n\n'),
    key_features: [
      'Registrierung und Anmeldung per E-Mail und Passwort, mit bcrypt-gehashten Passwörtern und JWT-Sessions',
      'Google-Anmeldung über Firebase Authentication',
      'Rollenbasiertes Admin-Dashboard für Beiträge und Nutzer, abgesichert auf Client und Server',
      'Rich-Text-Editor (React Quill) mit Kategorien, Titelbildern und serverseitig erzeugten Slugs',
      'Suche mit Kategoriefiltern und Seitennummerierung',
      'Kommentare für angemeldete Nutzer und ein gespeichertes Dark/Light-Theme',
    ],
  },
  '3d-portfolio': {
    title: '3D-Portfolio',
    category: LEARNING,
    short_description: 'Mein früheres interaktives 3D-Portfolio, gebaut mit React Three Fiber, Drei und Framer Motion.',
    description:
      'Eine frühere Version meines Portfolios, entstanden nach dem 3D-Portfolio-Tutorial von JavaScript Mastery und angepasst mit meiner eigenen Erfahrung, meinen Projekten und Referenzen.',
    key_features: [
      '3D-Modell eines Desktop-PCs (GLTF) im Hero, mit begrenzter Orbit-Steuerung',
      '3D-Kugeln für den Tech-Stack mit Icon-Decals',
      'Rotierender 3D-Planet neben einem Kontaktformular mit EmailJS',
      'Animierter Sternenhimmel, Scroll-Reveal-Abschnitte, eine Erfahrungs-Timeline und Tilt-Karten',
    ],
  },
  'hoo-bank': {
    category: LEARNING,
    short_description: 'Eine responsive Fintech-Landingpage, gebaut mit React und Tailwind CSS.',
    description:
      'Eine einseitige Landingpage für eine fiktive Digitalbank, gebaut mit React, Vite und Tailwind CSS nach dem HooBank-Tutorial von JavaScript Mastery. Jeder Abschnitt wird aus einer einzigen Datendatei gerendert.',
    key_features: [
      'Zehn responsive Abschnitte aus einer einzigen Konstanten-Datei',
      'Eigene Tailwind-Breakpoints, Farben und Verlaufs-Tokens',
      'Animiertes SVG-Hamburger-Menü und Anker-Navigation mit sanftem Scrollen',
    ],
  },
  'mern-estate': {
    category: LEARNING,
    short_description: 'Eine Immobilien-App in Arbeit, gebaut mit dem MERN-Stack und Tailwind CSS.',
  },
}
