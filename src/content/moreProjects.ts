/**
 * Projects found on Arbab's Netlify team (researched from the live sites and repositories).
 * Conservative on purpose: no live links where the live copy has issues, code written by
 * others is left out, and employer/client internal systems start unpublished (need permission).
 */
import type { Project } from '../types/content.ts'

type Extra = Partial<Project> & Pick<Project, 'title' | 'slug'> & { de: Record<string, unknown> }

export const moreProjects: Extra[] = [
  {
    title: 'Vehicle Importer Back-Office System',
    slug: 'vehicle-importer-back-office-system',
    category: 'Web App',
    is_featured: true,
    short_description:
      'React + TypeScript back office for a vehicle importer: purchasing and import clearing, cash/installment/bank-finance sales, role permissions, PDF invoices and Excel export.',
    description: [
      'I built most of the React front end of an internal back-office system for a vehicle import and sales business. It covers purchasing and import clearing (suppliers, shipments, vehicles, clearing agents, clearing costs and exchange rates) and sales (cash, installment and bank-finance sales, quotations and installation items).',
      'The app talks to a separate REST API using JWT sign-in with token refresh. It sends the active company with each request, and users can switch company from the sidebar. Every module is gated by role permissions (view, create, update, delete). Cash-sale invoices are generated as PDFs in the browser, and list pages export to Excel. Another developer wrote the first versions of the supplier, shipment and currency-rate screens. The client’s backend is no longer online, so there is no live demo.',
    ].join('\n\n'),
    key_features: [
      'Role-based access control: roles carry view/create/update/delete rights per module and sub-module, and routes and list-page actions are gated by them',
      'JWT sign-in, with a token refresh scheduled from the token’s expiry and automatic logout on 401/403 responses',
      'Purchasing and import-clearing modules: suppliers, shipments, vehicles (chassis/engine number, fuel type, engine CC, mileage), clearing agents, clearing costs and currency exchange rates',
      'Sales modules for cash, installment and bank-finance sales, quotations and installation items, each backed by its own API service',
      'In-browser PDF invoices for cash sales and Excel export on list pages',
      'Multi-company scoping with a sidebar company switcher, plus list pages with server-side filtering, pagination, a page-size selector and search-term highlighting',
    ],
    technologies: ['React 19', 'TypeScript', 'Vite', 'Redux Toolkit (RTK Query)', 'React Router 7', 'Tailwind CSS', 'shadcn/ui', 'Formik', 'Yup', '@react-pdf/renderer', 'SheetJS (xlsx)', 'Docker', 'Nginx'],
    de: {
      title: 'Back-Office-System für einen Fahrzeugimporteur',
      category: 'Web-App',
      short_description:
        'Back-Office mit React und TypeScript für einen Fahrzeugimporteur: Einkauf und Importverzollung, Bar-, Raten- und Bankfinanzierungsverkäufe, Rollenrechte, PDF-Rechnungen und Excel-Export.',
      description: [
        'Ich habe den Großteil des React-Frontends eines internen Back-Office-Systems für ein Unternehmen im Fahrzeugimport und -verkauf entwickelt. Es umfasst Einkauf und Importverzollung (Lieferanten, Lieferungen, Fahrzeuge, Zollagenten, Verzollungskosten und Wechselkurse) sowie den Verkauf (Bar-, Raten- und Bankfinanzierungsverkäufe, Angebote und Einbauposten).',
        'Die App kommuniziert mit einer separaten REST-API über JWT-Anmeldung mit Token-Erneuerung. Sie sendet bei jeder Anfrage das aktive Unternehmen mit, und Nutzer können das Unternehmen in der Seitenleiste wechseln. Jedes Modul ist durch Rollenrechte (ansehen, anlegen, ändern, löschen) geschützt. Rechnungen für Barverkäufe werden im Browser als PDF erzeugt, und Listen lassen sich nach Excel exportieren. Die ersten Versionen der Lieferanten-, Lieferungs- und Wechselkursmasken stammen von einem anderen Entwickler. Das Backend des Kunden ist nicht mehr online, daher gibt es keine Live-Demo.',
      ].join('\n\n'),
      key_features: [
        'Rollenbasierte Zugriffskontrolle: Rollen tragen Rechte zum Ansehen, Anlegen, Ändern und Löschen je Modul und Untermodul; Routen und Aktionen in Listen richten sich danach',
        'JWT-Anmeldung mit einer Token-Erneuerung, die anhand des Ablaufdatums geplant wird, und automatischer Abmeldung bei 401/403',
        'Module für Einkauf und Importverzollung: Lieferanten, Lieferungen, Fahrzeuge (Fahrgestell-/Motornummer, Kraftstoff, Hubraum, Kilometerstand), Zollagenten, Verzollungskosten und Wechselkurse',
        'Verkaufsmodule für Bar-, Raten- und Bankfinanzierungsverkäufe, Angebote und Einbauposten, jeweils mit eigenem API-Service',
        'PDF-Rechnungen für Barverkäufe direkt im Browser und Excel-Export auf Listenseiten',
        'Mandantenfähigkeit mit Unternehmenswechsel in der Seitenleiste sowie Listen mit serverseitigem Filtern, Paginierung, Auswahl der Seitengröße und Hervorhebung von Suchbegriffen',
      ],
    },
  },
  {
    title: 'Numan Hussain: Graphic Designer Portfolio',
    slug: 'numan-hussain-portfolio',
    category: 'Client Website',
    short_description:
      'One-page portfolio I built for graphic designer Numan Hussain with React and TypeScript: scroll-triggered animations, a Behance work carousel, CV download and an EmailJS contact form.',
    description:
      'I built this one-page portfolio for Numan Hussain, a graphic designer, with React, TypeScript, Vite, Tailwind CSS and shadcn/ui. It covers his services, software skills, work history, Behance projects, testimonials and contact details. The header underlines the section in view and hides while you scroll down. The stat counters and skill bars animate when they scroll into view, and his Behance projects sit in an Embla carousel. Visitors can download his CV or send him a message through an EmailJS form validated with Formik and Yup.',
    key_features: [
      'Scroll-spy navigation that underlines the section in view, with a header that hides on scroll-down and comes back on scroll-up',
      'Behance work carousel (shadcn/ui Carousel on Embla) with hover zoom; each slide opens that project on Behance in a new tab',
      'Stat counters and skill bars that animate once their section scrolls into view',
      'Contact form that sends through EmailJS, with Formik + Yup validation and toast messages',
      'Responsive layout with a full-height mobile menu behind an animated hamburger icon',
      'Repeated content (services, skill levels, Behance projects, work history, testimonials, social links) comes from one typed constants module',
    ],
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Embla Carousel', 'Formik', 'Yup', 'EmailJS', 'Netlify'],
    live_url: 'https://noman-g.netlify.app',
    thumbnail_url: 'https://xlqjwnvlurshymxmkpik.supabase.co/storage/v1/object/public/media/projects/numan-hussain-portfolio/thumbnail.jpg',
    de: {
      title: 'Numan Hussain: Portfolio eines Grafikdesigners',
      category: 'Kundenwebsite',
      short_description:
        'Einseitiges Portfolio für den Grafikdesigner Numan Hussain, gebaut mit React und TypeScript: Animationen beim Scrollen, ein Behance-Karussell, CV-Download und ein Kontaktformular mit EmailJS.',
      description:
        'Ich habe dieses einseitige Portfolio für den Grafikdesigner Numan Hussain mit React, TypeScript, Vite, Tailwind CSS und shadcn/ui gebaut. Es zeigt seine Leistungen, Software-Kenntnisse, seinen Werdegang, Behance-Projekte, Referenzen und Kontaktdaten. Der Header unterstreicht den sichtbaren Abschnitt und blendet sich beim Herunterscrollen aus. Zähler und Skill-Balken animieren, sobald sie ins Bild scrollen, und seine Behance-Projekte laufen in einem Embla-Karussell. Besucher können seinen Lebenslauf herunterladen oder ihm über ein mit Formik und Yup validiertes EmailJS-Formular schreiben.',
      key_features: [
        'Scroll-Spy-Navigation, die den sichtbaren Abschnitt unterstreicht, mit einem Header, der beim Herunterscrollen verschwindet und beim Hochscrollen zurückkommt',
        'Behance-Karussell (shadcn/ui Carousel auf Embla) mit Zoom beim Überfahren; jede Folie öffnet das Projekt auf Behance in einem neuen Tab',
        'Zähler und Skill-Balken, die animieren, sobald ihr Abschnitt ins Bild scrollt',
        'Kontaktformular über EmailJS mit Formik- und Yup-Validierung und Toast-Meldungen',
        'Responsives Layout mit einem bildschirmhohen Mobilmenü hinter einem animierten Hamburger-Icon',
        'Wiederkehrende Inhalte (Leistungen, Skill-Level, Behance-Projekte, Werdegang, Referenzen, Social Links) kommen aus einem typisierten Konstanten-Modul',
      ],
    },
  },
  {
    title: 'Concord Medical Website',
    slug: 'concord-medical-website',
    category: 'Client Website',
    short_description:
      'Marketing website for a medical-technology company, with a scroll-driven canvas product animation, six content pages and an EmailJS contact form.',
    description: [
      'I built a marketing website for Concord Medical Technology Corporation, a university spin-off working on non-invasive diagnostic devices, immunotherapy and vaccine development. The home and products pages open with a scroll-driven product animation: a canvas redraws a supplied PNG image sequence frame by frame as the visitor scrolls, with a percentage counter while the frames preload.',
      'The site has Home, Products & Services, About Us, Research, News and Contact pages on lazy-loaded React Router routes, styled responsively with Tailwind CSS. The contact form is validated with Formik and Yup and sends messages through EmailJS.',
    ].join('\n\n'),
    key_features: [
      'Scroll-scrubbed product animation: a canvas redraws a supplied 90-frame PNG sequence (85 frames on Products) in step with the scroll position, with a preload percentage counter',
      'Six content pages (Home, Products & Services, About Us, Research, News list and article, Contact) on lazy-loaded routes with Suspense, per-page titles and a custom 404',
      'Contact form with Formik + Yup validation that sends enquiries through EmailJS and shows toast feedback',
      'Responsive layout with a mobile hamburger menu and a header that turns translucent and blurred on scroll',
    ],
    technologies: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router 6', 'Formik', 'Yup', 'EmailJS', 'HTML Canvas API'],
    thumbnail_url: 'https://xlqjwnvlurshymxmkpik.supabase.co/storage/v1/object/public/media/projects/concord-medical-website/thumbnail.jpg',
    de: {
      title: 'Website für Concord Medical',
      category: 'Kundenwebsite',
      short_description:
        'Marketing-Website für ein Medizintechnik-Unternehmen mit einer scrollgesteuerten Canvas-Produktanimation, sechs Inhaltsseiten und einem Kontaktformular mit EmailJS.',
      description: [
        'Ich habe eine Marketing-Website für die Concord Medical Technology Corporation gebaut, eine Hochschul-Ausgründung, die an nicht-invasiven Diagnosegeräten, Immuntherapie und Impfstoffentwicklung arbeitet. Start- und Produktseite beginnen mit einer scrollgesteuerten Produktanimation: Ein Canvas zeichnet eine gelieferte PNG-Bildsequenz Bild für Bild passend zur Scrollposition, mit einem Prozentzähler während des Vorladens.',
        'Die Website hat die Seiten Start, Produkte & Leistungen, Über uns, Forschung, News und Kontakt auf per Lazy Loading geladenen React-Router-Routen und ist mit Tailwind CSS responsiv gestaltet. Das Kontaktformular wird mit Formik und Yup validiert und versendet Nachrichten über EmailJS.',
      ].join('\n\n'),
      key_features: [
        'Scroll-gesteuerte Produktanimation: Ein Canvas zeichnet eine gelieferte Sequenz aus 90 PNG-Bildern (85 auf der Produktseite) passend zur Scrollposition, mit Prozentzähler beim Vorladen',
        'Sechs Inhaltsseiten (Start, Produkte & Leistungen, Über uns, Forschung, News-Liste und Artikel, Kontakt) auf Lazy-Loading-Routen mit Suspense, eigenen Seitentiteln und eigener 404-Seite',
        'Kontaktformular mit Formik- und Yup-Validierung, das Anfragen über EmailJS sendet und Toast-Rückmeldungen zeigt',
        'Responsives Layout mit Hamburger-Menü und einem Header, der beim Scrollen durchscheinend und unscharf wird',
      ],
    },
  },
  {
    title: 'The International School Website (React Rebuild)',
    slug: 'the-international-school-website',
    category: 'Website Rebuild',
    short_description:
      'React + Tailwind rebuild of The International School (Karachi) website: about 64 routes covering admissions, IB programmes, school life and contact, with accordions and media sliders.',
    description: [
      'I rebuilt the website of The International School, Karachi (an IB World School) as a React single-page app using Vite and Tailwind CSS. It reproduces the school’s existing pages and URL structure in about 64 routes. They cover the school’s history, leadership, IB Primary Years, Middle Years and Diploma programmes, admissions, fees, student life and contact details. Every route is registered from one config under a shared layout with a fixed navbar, a sitemap footer and scroll-to-top on navigation.',
      'Long content is organised with Flowbite React accordions. Testimonials, pre-school photos and event galleries use react-awesome-slider and react-responsive-carousel, and the brand colours are defined as Tailwind theme tokens. The page copy and photography are the school’s own.',
    ].join('\n\n'),
    key_features: [
      'About 64 content pages registered from a single routes array into React Router’s createBrowserRouter under a shared root layout',
      'Shared fixed navbar and a three-column footer sitemap (About Us, Admissions, Life at TIS), with scroll-to-top on every route change',
      'Collapsible long-form content, such as the strategic plan by year, built with Flowbite React accordions',
      'Media sliders for video testimonials and pre-school photos, plus per-event photo carousels on the gallery page',
      'Data-heavy pages such as the fee structure tables and a school history timeline',
    ],
    technologies: ['React 18', 'Vite', 'React Router 6', 'Tailwind CSS', 'Flowbite React', 'react-awesome-slider', 'react-responsive-carousel'],
    de: {
      title: 'Website der International School (Neuaufbau mit React)',
      category: 'Website-Neuaufbau',
      short_description:
        'Neuaufbau der Website der International School (Karachi) mit React und Tailwind: rund 64 Routen zu Aufnahme, IB-Programmen, Schulleben und Kontakt, mit Akkordeons und Medien-Slidern.',
      description: [
        'Ich habe die Website der International School in Karachi (eine IB World School) als React-Single-Page-App mit Vite und Tailwind CSS neu aufgebaut. Sie bildet die bestehenden Seiten und die URL-Struktur der Schule in rund 64 Routen nach: Geschichte, Schulleitung, die IB-Programme Primary Years, Middle Years und Diploma, Aufnahme, Gebühren, Schulleben und Kontakt. Alle Routen werden aus einer Konfiguration unter einem gemeinsamen Layout mit fixierter Navigation, Sitemap-Footer und Scroll-nach-oben beim Seitenwechsel registriert.',
        'Lange Inhalte sind mit Akkordeons von Flowbite React gegliedert. Referenzen, Fotos der Vorschule und Veranstaltungsgalerien nutzen react-awesome-slider und react-responsive-carousel, und die Markenfarben sind als Tailwind-Theme-Tokens definiert. Texte und Fotos stammen von der Schule.',
      ].join('\n\n'),
      key_features: [
        'Rund 64 Inhaltsseiten aus einem einzigen Routen-Array, registriert über createBrowserRouter von React Router unter einem gemeinsamen Layout',
        'Gemeinsame fixierte Navigation und ein dreispaltiger Sitemap-Footer (Über uns, Aufnahme, Leben an der TIS), mit Scroll-nach-oben bei jedem Seitenwechsel',
        'Aufklappbare lange Inhalte, etwa der Strategieplan nach Jahren, umgesetzt mit Akkordeons von Flowbite React',
        'Medien-Slider für Video-Referenzen und Fotos der Vorschule sowie Fotokarussells je Veranstaltung in der Galerie',
        'Datenreiche Seiten wie Gebührentabellen und eine Zeitleiste zur Geschichte der Schule',
      ],
    },
  },
  {
    title: 'Nike Store Clone',
    slug: 'nike-store-clone',
    category: 'Learning Project',
    short_description:
      'Practice e-commerce front end styled after Nike’s store, built with React, Vite and Redux Toolkit. Products, categories, cart and wishlist run on the public Fake Store API.',
    description: [
      'A practice e-commerce front end styled after Nike’s online store, built with React, Vite and Tailwind CSS. Product data comes from the public Fake Store API through RTK Query, so the 20 items are that API’s sample backpacks, clothing, jewellery and electronics, not Nike products.',
      'Redux Toolkit slices hold the cart, the wishlist and the open or closed state of the slide-out drawers. Category and product pages are generated from the API data using URL slugs, and the cart page totals the quantities. A Formik and Yup form validates a new product and shows a live preview card, but nothing is saved: there is no backend or checkout. This is an unofficial learning clone, not affiliated with Nike.',
    ].join('\n\n'),
    key_features: [
      'Product catalogue loaded from the Fake Store API with RTK Query, with skeleton cards while loading',
      'Category and product pages built from API data using URL slugs',
      'Redux Toolkit cart with quantity controls, remove, clear all and subtotal, in a slide-out drawer and on a full cart page',
      'Wishlist drawer, with count badges for the wishlist and cart in the header',
      'Hero, product-gallery and related-products carousels, with a responsive layout and mobile menu',
    ],
    technologies: ['React 18', 'Vite', 'React Router 6', 'Redux Toolkit (RTK Query)', 'Tailwind CSS', 'Formik', 'Yup', 'Fake Store API'],
    de: {
      title: 'Nike-Store-Klon',
      category: 'Lernprojekt',
      short_description:
        'Übungs-Frontend für einen Onlineshop im Stil des Nike-Stores, gebaut mit React, Vite und Redux Toolkit. Produkte, Kategorien, Warenkorb und Merkliste laufen über die öffentliche Fake Store API.',
      description: [
        'Ein Übungs-Frontend für einen Onlineshop im Stil des Nike-Onlinestores, gebaut mit React, Vite und Tailwind CSS. Die Produktdaten kommen über RTK Query aus der öffentlichen Fake Store API; die 20 Artikel sind deren Beispielprodukte (Rucksäcke, Kleidung, Schmuck und Elektronik), keine Nike-Produkte.',
        'Redux-Toolkit-Slices halten den Warenkorb, die Merkliste und den Zustand der ausklappbaren Seitenleisten. Kategorie- und Produktseiten entstehen aus den API-Daten über URL-Slugs, und die Warenkorbseite summiert die Mengen. Ein mit Formik und Yup validiertes Formular zeigt ein neues Produkt als Live-Vorschau, speichert aber nichts: Es gibt kein Backend und keinen Checkout. Ein inoffizieller Lern-Klon ohne Verbindung zu Nike.',
      ].join('\n\n'),
      key_features: [
        'Produktkatalog aus der Fake Store API über RTK Query, mit Skeleton-Karten beim Laden',
        'Kategorie- und Produktseiten aus den API-Daten über URL-Slugs',
        'Warenkorb mit Redux Toolkit: Mengenauswahl, Entfernen, Alles leeren und Zwischensumme, in einer Seitenleiste und auf einer eigenen Warenkorbseite',
        'Merkliste in einer Seitenleiste, mit Zählern für Merkliste und Warenkorb im Header',
        'Karussells für Hero, Produktgalerie und ähnliche Produkte, mit responsivem Layout und Mobilmenü',
      ],
    },
  },
  {
    title: 'HR Management System',
    slug: 'hr-management-system',
    category: 'Web App',
    is_published: false,
    short_description:
      'Angular 18 front end of an internal HR system, built with a four-person team: role-based permissions, employee records, attendance with Excel import, and leave approvals.',
    description: [
      'I was the main contributor to the Angular front end of my employer Cybersoft Vantage’s internal Human Resource Management System, built by a four-person team on the Metronic admin theme against a separate REST API.',
      'Admins define roles with per-module view, create, edit and delete rights, and the admin, employee, attendance and leave screens are gated by them. The app covers company structure and master data, employee records with work history, education and profile photos, attendance with approvals and Excel bulk import, and leave requests with remaining-balance checks and approve/reject.',
    ].join('\n\n'),
    key_features: [
      'Role editor with per-module view/create/edit/delete rights, enforced in the UI by a route resolver',
      'Attendance by date range with an approval step and Excel bulk import through a drag-and-drop upload',
      'Leave requests that check the remaining balance, with approve/reject and delete',
      'Employee records with work history, education, assigned assets, department/team and shift',
      'Multi-company sign-in, password flows, and Excel export on about 20 list screens',
    ],
    technologies: ['Angular 18', 'TypeScript', 'RxJS', 'Angular SSR', 'ngx-translate', 'SheetJS (xlsx)', 'Bootstrap 5', 'Metronic theme'],
    de: {
      title: 'Personalmanagement-System',
      category: 'Web-App',
      short_description:
        'Angular-18-Frontend eines internen Personalmanagement-Systems, entwickelt im Viererteam: Rollenrechte, Personalakten, Zeiterfassung mit Excel-Import und Urlaubsgenehmigungen.',
    },
  },
  {
    title: 'Expense Management Portal',
    slug: 'expense-management-portal',
    category: 'Web App',
    is_published: false,
    short_description:
      'React + TypeScript expense portal for a client company, co-built at work: role-based access, filterable expense records with CSV export, receipt uploads and English/Arabic labels.',
    description: [
      'At my employer, Cybersoft Vantage, I co-developed an internal expense-management portal for a client company with one other developer. It is built on the free TailAdmin React + Tailwind dashboard template and talks to a separate REST API.',
      'Users sign in with JWT and are signed out automatically when the token expires. User management is limited to the Admin and Manager roles, and Data Operators can’t edit or delete expenses. Expenses are entered through Formik and Yup forms with receipt image uploads and a zoomable preview, and the expense list has eight server-side filters, CSV export and delete. Labels are shown in both English and Arabic.',
    ].join('\n\n'),
    key_features: [
      'Role-based access: user management is limited to the Admin and Manager roles, and Data Operators can’t edit or delete expenses',
      'Expense list with eight server-side filters, a 13-column table, CSV export and delete',
      'Create and edit forms built with Formik and Yup, with receipt image uploads and a zoomable preview',
      'JWT sign-in with automatic sign-out when the token expires',
      'Interface labels in English and Arabic',
    ],
    technologies: ['React 18', 'TypeScript', 'Vite', 'Redux Toolkit (RTK Query)', 'React Router 6', 'Formik', 'Yup', 'Tailwind CSS (TailAdmin)'],
    de: {
      title: 'Portal für Ausgabenverwaltung',
      category: 'Web-App',
      short_description:
        'Ausgabenportal mit React und TypeScript für ein Kundenunternehmen, gemeinsam bei der Arbeit entwickelt: Rollenrechte, filterbare Ausgaben mit CSV-Export, Beleg-Uploads und englisch-arabische Beschriftungen.',
    },
  },
]
