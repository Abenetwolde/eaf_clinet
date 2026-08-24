import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trophy, Calendar, MapPin, ChevronRight, Mail, Phone, Globe, Users, Award, Activity, BookOpen, Search, Filter, Clock, CheckCircle, X, Send, Play, Image, Sparkles, ShieldCheck, ChevronLeft, ArrowRight, UserCheck, HelpCircle, Plus, Minus, FolderOpen, Share2, ChevronUp, ChevronDown, Check, ExternalLink, Maximize2, Eye, Camera, Bookmark, Share } from 'lucide-react';
import CompetitionDetail from './CompetitionDetail';
import { ResponsiveSeeMoreText } from './ResponsiveSeeMoreText';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';

/* ─────────────────────────────────────────────
   STATIC DATA & GALLERY IMAGES
   ───────────────────────────────────────────── */
export interface NewsItem {
  id: number;
  date: string;
  title: string;
  amharicTitle?: string;
  summary: string;
  tag: string;
  img: string;
  featured?: boolean;
  author: string;
  readTime: string;
  location: string;
  paragraphs: string[];
  quote?: {
    text: string;
    author: string;
  };
  stats?: { label: string; value: string }[];
  gallery?: string[];
}

export interface GalleryCapture {
  id: number;
  img: string;
  title: string;
  caption: string;
  photographer?: string;
  time?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  img: string;
  location: string;
  date: string;
  type: 'PHOTO' | 'VIDEO';
  description: string;
  captures: GalleryCapture[];
}

const NEWS: NewsItem[] = [
  {
    id: 1,
    date: 'May 18, 2026',
    title: 'Ethiopia Finishes 24th African Championship with 15 Medals',
    amharicTitle: 'ኢትዮጵያ 24ኛውን የአፍሪካ አትሌቲክስ ሻምፒዮና በ15 ሜዳሊያዎች አጠናቀቀች',
    summary: 'Ethiopia collected 7 gold, 4 silver, and 4 bronze medals at the 24th African Athletics Championship hosted in Accra, Ghana, topping the distance running charts.',
    tag: 'Championship',
    img: '/images/d1.jpg',
    featured: true,
    author: 'EAF Media Unit / Solomon Desta',
    readTime: '4 min read',
    location: 'Accra, Ghana',
    paragraphs: [
      'The Ethiopian National Athletics Team delivered a historic performance at the 24th African Senior Athletics Championships concluded at the Accra International Stadium, securing a remarkable haul of 7 Gold, 4 Silver, and 4 Bronze medals across four grueling days of elite continental competition.',
      'Led by dominant tactical masterclasses in the men’s 10,000m and women’s 5,000m, Ethiopian distance runners swept both podiums while showing impressive breakthroughs in middle-distance and steeplechase disciplines. The young sensation Haile Demisse clinched gold in the 5,000m with an electrifying final lap sprint of 53.2 seconds, holding off formidable East African rivals.',
      'In the women’s 10,000m, Sifan Mengistu Wolde set a new championship record with a commanding solo run from 6,000 meters out, crossing the line in 30:52.14 amidst thunderous applause from the stadium crowd and the vibrant Ethiopian diaspora delegation.',
      'The Ethiopian Athletics Federation President lauded the athletes, declaring this championship a definitive confirmation of the federation’s long-term talent development pipeline as Ethiopia prepares for the upcoming World Athletics Championships.'
    ],
    quote: {
      text: 'Our athletes demonstrated unmatched tactical maturity, national pride, and resilience under high humidity. The future of Ethiopian athletics is stronger than ever.',
      author: 'Derartu Tulu, EAF Executive Leadership'
    },
    stats: [
      { label: 'Gold Medals', value: '7' },
      { label: 'Silver Medals', value: '4' },
      { label: 'Bronze Medals', value: '4' },
      { label: 'Total Medals', value: '15' },
      { label: 'Continental Rank', value: '#1 (Distance)' }
    ],
    gallery: ['/images/d1.jpg', '/images/d5.jpg', '/images/a2.jpg']
  },
  {
    id: 2,
    date: 'Apr 26, 2026',
    title: 'Ethiopian Heroes Dominate London Marathon',
    amharicTitle: 'የኢትዮጵያ ጀግኖች የለንደን ማራቶንን በበላይነት አጠናቀቁ',
    summary: 'Ethiopian elite marathoners showcased breathtaking endurance along the Thames, capturing both men’s and women’s podium crowns in world-class times.',
    tag: 'Marathon',
    img: '/images/d2.jpeg',
    author: 'EAF International Desk / London',
    readTime: '3 min read',
    location: 'London, United Kingdom',
    paragraphs: [
      'Ethiopian distance masters wrote another glorious chapter in distance running history at the prestigious London Marathon, dominating a world-class field from Blackheath to The Mall in front of hundreds of thousands of spectators.',
      'In the women’s elite race, Tigst Assefa unleashed a blistering surge after passing the 35km mark near Embankment, breaking away from the defending champion and crossing the finish line in a spectacular course-record pace.',
      'The men’s division was equally thrilling, with Ethiopian athletes controlling the rhythm through 30km before an explosive dual sprint towards Buckingham Palace sealed a 1-2 finish for Ethiopia.',
      'EAF Technical Director noted that the rigorous altitude preparation in Entoto and Sululta was instrumental in sustaining peak cardiovascular power through the cool, breezy London conditions.'
    ],
    quote: {
      text: 'Every kilometer we train in the hills of Bekoji and Sululta is for this exact moment—bringing glory to the green, yellow, and red flag.',
      author: 'Tigst Assefa, Marathon Champion'
    },
    stats: [
      { label: 'Women Winning Time', value: '2:14:18' },
      { label: 'Men Winning Time', value: '2:03:42' },
      { label: 'Top-5 Ethiopian Finishers', value: '4 Athletes' },
      { label: 'Spectator Crowd', value: '800,000+' }
    ],
    gallery: ['/images/d2.jpeg', '/images/runner_marathon.png', '/images/a1.jpg']
  },
  {
    id: 3,
    date: 'Apr 26, 2026',
    title: '4th Ethiopia Tamirt 10KM Won by Nibret Kinde & Birtukan Mola',
    amharicTitle: '4ኛው የኢትዮጵያ ታምርት 10 ኪሜ በንብረት ኪንዴ እና ብርቱካን ሞላ አሸናፊነት ተጠናቀቀ',
    summary: 'More than 20,000 participants and national club elites raced through the heart of the capital in a vibrant celebration of athletics and national unity.',
    tag: 'Road Race',
    img: '/images/d3.jpeg',
    author: 'EAF Road Race Committee',
    readTime: '3 min read',
    location: 'Meskel Square, Addis Ababa',
    paragraphs: [
      'The 4th edition of the annual Ethiopia Tamirt 10-Kilometer Road Race electrified Addis Ababa as over 20,000 elite and mass participants lined up at the historic Meskel Square on Sunday morning.',
      'Nibret Kinde produced an exceptional tactical performance, pulling clear of the elite men’s pack at the 7km uphill stretch towards Mexico Square and crossing the tape in 28:14 at an altitude of 2,355 meters.',
      'In the women’s contest, Birtukan Mola delivered a stunning kick over the final 500 meters to secure first place in 31:48, setting a new course benchmark for high-altitude 10k road circuits in Ethiopia.',
      'Federation officials commended the flawless electronic chip timing, Fayda athlete verification integration, and enthusiastic turnout from youth development academies across all regional states.'
    ],
    quote: {
      text: 'Running alongside thousands of fellow Ethiopians at Meskel Square gives you unmatched energy. It proves grassroots athletics is thriving across our country.',
      author: 'Nibret Kinde, Men’s 10K Winner'
    },
    stats: [
      { label: 'Registered Runners', value: '22,400+' },
      { label: 'Men Record', value: '28:14.2' },
      { label: 'Women Record', value: '31:48.0' },
      { label: 'Participating Clubs', value: '34 Clubs' }
    ],
    gallery: ['/images/d3.jpeg', '/images/runners_training.png', '/images/banner_grand_prix.png']
  },
  {
    id: 4,
    date: 'Apr 26, 2026',
    title: '10-Day Athletics Judging Training Completed',
    amharicTitle: 'የ10 ቀናት የአትሌቲክስ ዳኝነት እና ቴክኒካል ስልጠና በስኬት ተጠናቀቀ',
    summary: 'Sixty technical officials from 11 regional states completed advanced World Athletics Level-1 and Level-2 technical judging, officiating, and photo-finish certification.',
    tag: 'Training',
    img: '/images/d4.jpg',
    author: 'EAF Technical & Education Department',
    readTime: '3 min read',
    location: 'EAF Headquarters & National Stadium',
    paragraphs: [
      'The Ethiopian Athletics Federation successfully concluded an intensive 10-day Technical Officials and Judging Certification Seminar at the EAF Headquarters and Addis Ababa National Stadium.',
      'The comprehensive curriculum covered modern electronic timing systems, false start detection sensors, wind gauge calibration, track umpire coordination, and strict anti-doping protocol enforcement.',
      'Facilitated by certified World Athletics international technical delegates, the seminar awarded 60 officials with national level badges, significantly expanding Ethiopia’s officiating capacity ahead of the international calendar.',
      'EAF Technical Committee affirmed that digitalizing meet operations and licensing officials through the central EAF Portal will ensure maximum integrity and international standard alignment in all domestic meets.'
    ],
    quote: {
      text: 'World-class athletes require world-class officiating. Modern electronic timing and trained technical referees guarantee fair and accurate results for every competitor.',
      author: 'Technical Committee Chairperson'
    },
    stats: [
      { label: 'Certified Officials', value: '60 Judges' },
      { label: 'Regional States', value: '11 Regions' },
      { label: 'Course Duration', value: '80 Hours' },
      { label: 'Standard', value: 'World Athletics L1/L2' }
    ],
    gallery: ['/images/d4.jpg', '/images/d5.jpg', '/images/logo.jpeg']
  },
  {
    id: 5,
    date: 'May 10, 2026',
    title: 'Ethiopian Delegation Departs for African Championships',
    amharicTitle: 'የኢትዮጵያ ብሔራዊ ልዑክ ለአፍሪካ ሻምፒዮና ጉዞ ጀመረ',
    summary: 'A 42-member contingent of elite athletes, coaches, physiotherapists, and team physicians departed Addis Ababa with high expectations and thorough preparation.',
    tag: 'Championship',
    img: '/images/d5.jpg',
    author: 'EAF National Teams Secretariat',
    readTime: '2 min read',
    location: 'Bole International Airport',
    paragraphs: [
      'The official Ethiopian delegation composed of 32 elite track and field athletes and 10 technical support staff departed from Bole International Airport for the 24th African Athletics Championships in Accra, Ghana.',
      'The squad underwent an intensive six-week residential high-altitude training camp in Sululta and the Ethiopian Youth Sport Academy, focusing on tactical speed surges, humid conditions acclimation, and team relay transitions.',
      'Speaking before departure, National Team Head Coach expressed strong confidence in the blend of Olympic veteran leaders and emerging U20 youth champions who earned their national vests through the recent national trials.',
      'Supporters, family members, and federation leadership gathered at the departure lounge to offer their prayers, blessings, and words of national encouragement.'
    ],
    quote: {
      text: 'We go to Accra not just to participate, but to uphold Ethiopia’s proud legacy as the beacon of African distance running excellence.',
      author: 'National Team Head Coach'
    },
    stats: [
      { label: 'Delegation Size', value: '42 Members' },
      { label: 'Athletes', value: '32 Competitors' },
      { label: 'Disciplines', value: '14 Events' },
      { label: 'Target Medals', value: '12+ Medals' }
    ],
    gallery: ['/images/d5.jpg', '/images/a2.jpg', '/images/runners_training.png']
  },
  {
    id: 6,
    date: 'May 10, 2026',
    title: 'National Team Official Send-Off Ceremony Held',
    amharicTitle: 'ለብሔራዊ ቡድኑ ይፋዊ የሽኝት እና የክብር ስነ-ስርዓት ተካሄደ',
    summary: 'Government dignitaries, athletics legends, and corporate sponsors gathered to honor the national athletics contingent and hand over the sacred national flag.',
    tag: 'National Team',
    img: '/images/a1.jpg',
    author: 'EAF Communications Office',
    readTime: '3 min read',
    location: 'Skylight Hotel, Addis Ababa',
    paragraphs: [
      'In a grand and dignified ceremony held at the Ethiopian Skylight Hotel ballroom, the Ethiopian Athletics Federation, Ministry of Culture & Sports, and key corporate partners hosted the official send-off gala for the national athletics squad.',
      'The event commenced with the ceremonial handover of the Ethiopian national tricolor by government ministers to the team captain, symbolizing the hopes and unity of over 120 million citizens.',
      'Athletics legends including double Olympic champion Derartu Tulu and Haile Gebrselassie delivered impassioned speeches, sharing wisdom on mental composure, tactical endurance, and honoring the legacy of Abebe Bikila.',
      'Major federation partners, including Ethiopian Airlines, Ethio Telecom, and Commercial Bank of Ethiopia, announced enhanced performance bonuses and reward packages for medal-winning performances.'
    ],
    quote: {
      text: 'Wearing the Ethiopian uniform is the ultimate privilege. Carry the national flag with pride, integrity, and uncompromising dedication on the track.',
      author: 'EAF Executive Committee'
    },
    stats: [
      { label: 'Distinguished Guests', value: '350+ Attendees' },
      { label: 'Corporate Sponsors', value: '6 Partners' },
      { label: 'Athletes Honored', value: '32 Athletes' },
      { label: 'Flag Ceremony', value: 'Official Handover' }
    ],
    gallery: ['/images/a1.jpg', '/images/d5.jpg', '/images/d4.jpg']
  }
];

const ENRICHED_MEETS = [
  {
    id: "MEET-2026-01",
    title: "Addis Ababa International Grand Prix 2026",
    amharic: "አዲስ አበባ ግራንድ ፕሪ 2026",
    venue: "Addis Ababa National Stadium",
    date: "2026-08-12",
    dateString: "August 12–14, 2026",
    status: "REGISTRATION_OPEN",
    disciplines: ["100m Sprint", "5,000m", "10,000m", "800m", "1,500m", "3,000m Steeplechase", "Marathon"],
    region: "Addis Ababa",
    img: "/images/banner_grand_prix.png"
  },
  {
    id: "MEET-2026-02",
    title: "Ethiopian National Youth Olympic Games U18/U20",
    amharic: "ብሔራዊ የወጣቶች ኦሎምፒክ ጨዋታዎች",
    venue: "Hawassa International Stadium",
    date: "2026-09-05",
    dateString: "September 5–8, 2026",
    status: "REGISTRATION_OPEN",
    disciplines: ["100m Sprint", "800m", "1,500m", "5,000m", "3,000m Steeplechase", "High Jump", "Long Jump"],
    region: "Sidama",
    img: "/images/banner_youth_games.png"
  },
  {
    id: "MEET-2026-03",
    title: "Jan Meda National Cross-Country Olympic Trials",
    amharic: "ጃን ሜዳ ብሔራዊ ምርጫ",
    venue: "Jan Meda Race Course, Addis Ababa",
    date: "2026-10-20",
    dateString: "October 20, 2026",
    status: "UPCOMING",
    disciplines: ["10km Senior Men", "10km Senior Women", "8km U20 Men", "6km U18 Mixed"],
    region: "Addis Ababa",
    img: "/images/banner_jan_meda.png"
  },
  {
    id: "MEET-2026-04",
    title: "Oromia Athletics Championship 2026",
    amharic: "የኦሮሚያ አትሌቲክስ ሻምፒዮና 2026",
    venue: "Asella Stadium",
    date: "2026-07-10",
    dateString: "July 10-12, 2026",
    status: "LIVE",
    disciplines: ["5,000m", "10,000m", "800m"],
    region: "Oromia",
    img: "/images/d1.jpg"
  },
  {
    id: "MEET-2026-05",
    title: "Amhara Track & Field Open",
    amharic: "የአማራ ትራክ እና ፊልድ ክፍት ውድድር",
    venue: "Bahir Dar International Stadium",
    date: "2026-11-14",
    dateString: "November 14-16, 2026",
    status: "UPCOMING",
    disciplines: ["800m", "1,500m", "High Jump"],
    region: "Amhara",
    img: "/images/runners_training.png"
  },
  {
    id: "MEET-2026-06",
    title: "Tigray Regional Athletics Meet",
    amharic: "የትግራይ ክልላዊ አትሌቲክስ ውድድር",
    venue: "Mekelle Stadium",
    date: "2026-06-25",
    dateString: "June 25-27, 2026",
    status: "REGISTRATION_CLOSED",
    disciplines: ["5,000m", "10,000m", "1,500m"],
    region: "Tigray",
    img: "/images/d2.jpeg"
  }
];

const ATHLETES = [
  {
    id: 1,
    name: 'Tigst Assefa',
    amharicName: 'ትዕግስት አሰፋ',
    achievement: '2023 Berlin Marathon World Record — 2:11:53',
    event: 'Marathon',
    club: 'Ethiopian National Team / Adidas',
    faydaFin: '9840-2210-4491',
    faydaStatus: 'VERIFIED',
    dob: '1996-12-03',
    gender: 'Female',
    ageTier: 'Senior',
    pb: '2:11:53 (World Record)',
    quote: 'Hard work in Bekoji and dedication to my country bring world records to Ethiopia.',
    img: '/images/a1.jpg',
    medals: ['🥇 Berlin Marathon 2023 (WR)', '🥇 Berlin Marathon 2022', '🥈 Olympic Games 2024'],
  },
  {
    id: 2,
    name: 'Selemon Barega',
    amharicName: 'ሰለሞን ባረጋ',
    achievement: 'Olympic 10,000m Champion — Tokyo 2020',
    event: '5,000m / 10,000m',
    club: 'Ethiopian National Team / Defense AC',
    faydaFin: '4410-9830-1120',
    faydaStatus: 'VERIFIED',
    dob: '2000-01-20',
    gender: 'Male',
    ageTier: 'Senior',
    pb: '12:43.02 (5000m) / 26:44.73 (10000m)',
    quote: 'Stepping onto the track with the green, yellow, and red flag is my greatest honor.',
    img: '/images/a2.jpg',
    medals: ['🥇 Tokyo 2020 Olympic Gold 10,000m', '🥇 World Indoor Champion 3000m', '🥈 World Championships Silver'],
  },
  {
    id: 3,
    name: 'Haile Demisse Tadesse',
    amharicName: 'ኃይሌ ደሚሴ ታደሰ',
    achievement: 'Addis Ababa Grand Prix 5,000m Champion',
    event: '5,000m / 10,000m',
    club: 'Defense Athletics Club',
    faydaFin: '9840-3920-1124',
    faydaStatus: 'VERIFIED',
    dob: '2002-04-12',
    gender: 'Male',
    ageTier: 'Senior',
    pb: '12:51.44 (5000m) / 26:58.20 (10000m)',
    quote: 'Every altitude training run in Entoto prepares us to conquer global competitions.',
    img: '/images/runner_marathon.png',
    medals: ['🥇 2025 Addis Ababa GP Gold', '🥈 National Championships Silver'],
  },
  {
    id: 4,
    name: 'Sifan Mengistu Wolde',
    amharicName: 'ሲፋን መንግስቱ ወልዴ',
    achievement: 'Ethiopian Olympic Trials 10,000m Champion',
    event: '10,000m / Marathon',
    club: 'Oromia Police Sports Club',
    faydaFin: '6021-9983-4112',
    faydaStatus: 'VERIFIED',
    dob: '2004-01-30',
    gender: 'Female',
    ageTier: 'Senior',
    pb: '29:42.10 (10000m) / 1:04:30 (Half Marathon)',
    quote: 'Perseverance and faith turn every challenging kilometer into victory.',
    img: '/images/runner_female.png',
    medals: ['🥇 2025 Ethiopian Olympic Trial Champion', '🥇 Hawassa Half Marathon Winner'],
  }
];

const GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 1,
    title: 'African Championships 2026 Medal Ceremony',
    category: 'Championships',
    img: '/images/d1.jpg',
    location: 'Accra Stadium, Ghana',
    date: 'May 2026',
    type: 'PHOTO',
    description: 'Historic podium sweep and gold medal ceremony celebrating Ethiopian distance dominance at the 24th African Athletics Championships in Accra.',
    captures: [
      { id: 101, img: '/images/d1.jpg', title: 'Podium Gold Medal Presentation', caption: 'Ethiopian medalists stand tall on the podium receiving gold medals as the national anthem resonates across Accra Stadium.', photographer: 'EAF Media Unit' },
      { id: 102, img: '/images/d5.jpg', title: 'National Delegation Flag Celebration', caption: 'Coaches and teammates celebrate together trackside draped in the Ethiopian flag after the medal sweep.', photographer: 'EAF Media / Ghana Press' },
      { id: 103, img: '/images/d4.jpg', title: 'EAF Presidential Stand', caption: 'EAF executive committee members applauding from the presidential pavilion at Accra Stadium.', photographer: 'AAC Official' }
    ]
  },
  {
    id: 2,
    title: 'London Marathon Ethiopian Elite Champions',
    category: 'Marathons',
    img: '/images/d2.jpeg',
    location: 'London, UK',
    date: 'April 2026',
    type: 'VIDEO',
    description: 'Breathtaking moments from the London Marathon through iconic landmarks and Thames river bridges.',
    captures: [
      { id: 201, img: '/images/d2.jpeg', title: 'Lead Breakaway at River Thames', caption: 'Ethiopian elite pack dictating a blistering world-record pace along the Victoria Embankment.', photographer: 'London Marathon Press / Getty' },
      { id: 202, img: '/images/runner_marathon.png', title: 'Tower Bridge 20K Split', caption: 'Crossing Tower Bridge amid roaring applause from thousands of Ethiopian diaspora supporters.', photographer: 'EAF International Desk' },
      { id: 203, img: '/images/d3.jpeg', title: 'Sprint Finish at The Mall', caption: 'Sprinting toward the finish line in front of Buckingham Palace to claim the elite crown.', photographer: 'London Marathon Media' },
      { id: 204, img: '/images/runner_female.png', title: 'Women\'s Champion — Post-Race Finish', caption: 'Ethiopian women\'s champion draped in the national flag celebrating with fans along the boulevard.', photographer: 'EAF Press' }
    ]
  },
  {
    id: 3,
    title: '4th Ethiopia Tamirt 10KM Start Line',
    category: 'Track & Field',
    img: '/images/d3.jpeg',
    location: 'Meskel Square, Addis Ababa',
    date: 'April 2026',
    type: 'PHOTO',
    description: 'A sea of 22,000+ runners filling Meskel Square in the annual Ethiopia Tamirt festival of athletics.',
    captures: [
      { id: 301, img: '/images/d3.jpeg', title: 'Mass Start at Meskel Square', caption: 'Over 20,000 runners charge forward across Meskel Square in a vibrant sea of green, yellow, and red.', photographer: 'EAF Photography / Dawit K.' },
      { id: 302, img: '/images/runners_training.png', title: 'Elite Leaders Surge at 5KM', caption: 'Nibret Kinde and Birtukan Mola pacing the elite field along Menelik II Avenue.', photographer: 'EAF Media Unit' },
      { id: 303, img: '/images/runner_marathon.png', title: 'Uphill Push to Mexico Square', caption: 'Runners tackling the steep capital altitude climb with grit and determination.', photographer: 'Addis Ababa Sports Bureau' },
      { id: 304, img: '/images/runner_female.png', title: 'Women\'s Tamirt 10KM Champions', caption: 'Women\'s race winner crossing the tape at the Addis Ababa National Stadium finish line.', photographer: 'EAF Press' }
    ]
  },
  {
    id: 4,
    title: 'Technical Athletics Officials & Judging Seminar',
    category: 'Ceremonies',
    img: '/images/d4.jpg',
    location: 'EAF HQ, Addis Ababa',
    date: 'April 2026',
    type: 'PHOTO',
    description: 'Classroom and track workshops training 60 officials in electronic timing, photo-finish and World Athletics rules.',
    captures: [
      { id: 401, img: '/images/d4.jpg', title: 'Judging Seminar Classroom', caption: 'Sixty regional technical officials studying modern electronic timing and World Athletics officiating protocols.', photographer: 'EAF Technical Desk' },
      { id: 402, img: '/images/d5.jpg', title: 'Officials Practical Track Session', caption: 'Hands-on practical training with photo-finish cameras at the National Stadium.', photographer: 'EAF IT Dept' },
      { id: 403, img: '/images/logo.jpeg', title: 'Graduation & Certificate Handover', caption: 'Officials proudly receiving their World Athletics accredited certification diplomas.', photographer: 'EAF Media Unit' }
    ]
  },
  {
    id: 5,
    title: 'National Team Delegation Send-Off Ceremony',
    category: 'Ceremonies',
    img: '/images/d5.jpg',
    location: 'Skylight Hotel, Addis Ababa',
    date: 'May 2026',
    type: 'VIDEO',
    description: 'Official national banquet and flag handover ceremony honoring the athletes representing Ethiopia abroad.',
    captures: [
      { id: 501, img: '/images/d5.jpg', title: 'Ceremonial Flag Handover', caption: 'Government ministers and EAF President hand over the sacred Ethiopian flag to team captain.', photographer: 'EAF Communications' },
      { id: 502, img: '/images/d4.jpg', title: 'Keynote Address by Legends', caption: 'Olympic champions sharing wisdom and inspiring words of encouragement with the national squad.', photographer: 'Skylight Media' },
      { id: 503, img: '/images/a1.jpg', title: 'Official Squad Portrait', caption: 'The complete Ethiopian delegation of 42 athletes and coaches in their national tracksuits.', photographer: 'EAF Official Photo' }
    ]
  },
  {
    id: 6,
    title: 'Tigst Assefa Berlin World Record Moment',
    category: 'Marathons',
    img: '/images/a1.jpg',
    location: 'Berlin, Germany',
    date: 'September 2023',
    type: 'PHOTO',
    description: 'The monumental 2:11:53 world record that redefined women\'s marathon history forever.',
    captures: [
      { id: 601, img: '/images/a1.jpg', title: 'Brandenburg Gate Finish — 2:11:53', caption: 'Tigst Assefa crossing the line under the iconic Brandenburg Gate, shattering the world record by over two minutes.', photographer: 'Berlin Marathon / SCC Events' },
      { id: 602, img: '/images/runner_female.png', title: 'Flawless 30KM Pacing Rhythm', caption: 'Maintaining an astonishing 3:07 per kilometer pace through the tree-lined streets of Berlin.', photographer: 'World Athletics' },
      { id: 603, img: '/images/d2.jpeg', title: 'Post-Race Press Celebration', caption: 'Assefa pointing in triumph to the official Seiko timing board displaying the new 2:11:53 world mark.', photographer: 'Getty Images / Sport' },
      { id: 604, img: '/images/runner_marathon.png', title: 'Global Press Conference', caption: 'Tigst Assefa addressing international sports correspondents draped in the Ethiopian flag.', photographer: 'EAF Media International' }
    ]
  },
  {
    id: 7,
    title: 'Selemon Barega Olympic Gold Victory Lap',
    category: 'Championships',
    img: '/images/a2.jpg',
    location: 'Tokyo Olympic Stadium',
    date: 'August 2021',
    type: 'VIDEO',
    description: 'Electrifying 10,000m Olympic gold sprint and celebratory lap at the Tokyo Olympic Stadium.',
    captures: [
      { id: 701, img: '/images/a2.jpg', title: 'Tears of Joy on the Victory Lap', caption: 'Selemon Barega draped in the green, yellow, and red flag celebrating his dramatic 10,000m Olympic triumph.', photographer: 'IOC Media / Olympic Games' },
      { id: 702, img: '/images/athlete_haile.jpeg', title: 'Mentors & Coaching Staff Embrace', caption: 'Emotional embrace trackside with veteran Ethiopian coaching legends and technical advisors.', photographer: 'EAF Media Unit' },
      { id: 703, img: '/images/d1.jpg', title: 'Olympic Stadium Post-Race Ceremony', caption: 'Barega receiving his gold medal at the Tokyo Olympic podium ceremony.', photographer: 'World Athletics Photo' }
    ]
  },
  {
    id: 8,
    title: 'High Altitude Endurance Training in Sululta',
    category: 'Track & Field',
    img: '/images/runners_training.png',
    location: 'Sululta, Ethiopia',
    date: 'June 2026',
    type: 'PHOTO',
    description: 'Dawn endurance runs and hill strides at 2,800m altitude through the legendary eucalyptus trails of Sululta.',
    captures: [
      { id: 801, img: '/images/runners_training.png', title: 'Dawn Long Run through Eucalyptus Forest', caption: 'Elite athletes completing a 32km progression run at 2,800m altitude in misty Sululta dawn conditions.', photographer: 'EAF Training Camp Photo' },
      { id: 802, img: '/images/runner_marathon.png', title: 'Hill Repeat Intervals', caption: 'Power strides and hill sprints developing neuromuscular cadence and uphill power.', photographer: 'National Team Coach Desk' },
      { id: 803, img: '/images/runner_female.png', title: 'Hydration & Recovery Monitoring', caption: 'Sports science and medical staff recording heart rate recovery and hydration metrics post-interval session.', photographer: 'EAF Sports Science Lab' }
    ]
  },
  {
    id: 9,
    title: 'Addis Ababa International Grand Prix Warmup',
    category: 'Championships',
    img: '/images/banner_grand_prix.png',
    location: 'Addis Ababa National Stadium',
    date: 'August 2026',
    type: 'PHOTO',
    description: 'Intense warmup drills, starting block practice, and stadium preparations for the International Grand Prix.',
    captures: [
      { id: 901, img: '/images/banner_grand_prix.png', title: 'Starting Block Explosive Drills', caption: 'Sprinters fine-tuning reaction times and drive phase mechanics on the brand-new Mondo track surface.', photographer: 'EAF Grand Prix Media' },
      { id: 902, img: '/images/runners_training.png', title: 'Distance Athletes Warmup Strides', caption: '1,500m and 800m contenders pacing their rhythm under the gaze of federation scouts.', photographer: 'EAF Photography' },
      { id: 903, img: '/images/d1.jpg', title: 'Packed Grandstands at Kickoff', caption: 'Passionate Ethiopian athletics fans packing the historic stadium stands in full national colors.', photographer: 'Addis Stadium Media' }
    ]
  },
  {
    id: 10,
    title: 'Jan Meda National Cross-Country Olympic Trials',
    category: 'Track & Field',
    img: '/images/banner_jan_meda.png',
    location: 'Jan Meda Course, Addis Ababa',
    date: 'October 2026',
    type: 'VIDEO',
    description: 'High-stakes Olympic trials through the legendary mud, ditches, and uphill loops of Jan Meda.',
    captures: [
      { id: 1001, img: '/images/banner_jan_meda.png', title: 'Senior Men 10KM Uphill Charge', caption: 'Over 150 elite runners from 35 clubs storming up the iconic Jan Meda hill in the opening loop.', photographer: 'EAF Cross-Country Media' },
      { id: 1002, img: '/images/banner_youth_games.png', title: 'U20 Junior Division — Youth Prospects', caption: 'Young prospects battling through natural water ditches and rugged cross-country terrain at Jan Meda.', photographer: 'EAF Youth Academy' },
      { id: 1003, img: '/images/runners_training.png', title: 'Senior Women 10KM Lead Pack', caption: 'World-ranked marathon and 10k stars matching stride-for-stride along the outer Jan Meda circuit.', photographer: 'EAF Official' }
    ]
  }
];

const STRUCTURE_ITEMS = [
  {
    icon: <Users size={22} color="var(--primary)" />,
    title: 'General Assembly',
    amharic: 'ጠቅላላ ጉባኤ',
    description: 'The General Assembly is the supreme governing body of the Ethiopian Athletics Federation. It convenes at least once a year and comprises representatives from all affiliated regional federations and member clubs. It is responsible for electing the Executive Committee, approving the budget, and setting strategic policies for athletics development in Ethiopia.',
    members: '120+ delegates from 11 regional federations',
    meets: 'Annually (extraordinary sessions as needed)',
  },
  {
    icon: <Award size={22} color="var(--primary)" />,
    title: 'Executive Committee',
    amharic: 'ስራ አስፈጻሚ',
    description: 'The Executive Committee is elected by the General Assembly and handles the day-to-day administration of the federation. It implements General Assembly decisions, manages federation finances, appoints technical staff, and oversees national team selection and international relations with World Athletics (WA) and the African Athletics Confederation (AAC).',
    members: '11 elected officials: President, VP, Secretary General, Treasurer & 7 members',
    meets: 'Monthly (at least quarterly)',
  },
  {
    icon: <Activity size={22} color="var(--primary)" />,
    title: 'Technical Committee',
    amharic: 'ቴክኒካዊ ኮሚቴ',
    description: 'The Technical Committee oversees all sporting and competition matters. This includes drafting competition rules aligned with World Athletics standards, accrediting coaches and officials, managing athlete licensing, organizing national championships, and approving the national competition calendar for track, field, road, cross-country, and marathon events.',
    members: '7 technical experts: Head Coach, Chief Official, Medical Officer & specialists',
    meets: 'Bi-monthly and before all major national championships',
  },
  {
    icon: <BookOpen size={22} color="var(--primary)" />,
    title: 'Training & Research',
    amharic: 'ስልጠናና ምርምር',
    description: 'The Training & Research Department drives the scientific development of Ethiopian athletics. It designs national coaching education programs, conducts sports science research, provides nutritional and anti-doping guidance, coordinates with universities and sports institutes, and monitors the Long-Term Athlete Development (LTAD) pathway from youth to elite level.',
    members: 'Department Head, 4 senior coaches, 2 sports scientists, anti-doping officer',
    meets: 'Weekly (training camps) and quarterly (research reviews)',
  },
];


const QUICK_LINKS = [
  ['Home', 'ቅድመ ገፅ', '#home'],
  ['News', 'ዜና', '#news'],
  ['Competitions', 'ውድድሮች', '#competitions'],
  ['Results', 'ውጤት', '#competitions'],
  ['Athlete Profile', 'አትሌት ፕሮፋይል', '#athletes'],
  ['Gallery', 'ምስል', '#media'],
  ['Contact', 'ያግኙን', '#contact'],
];

const TAG_COLORS = {
  Championship: { bg: '#E0F2FE', color: '#0369A1' },
  Marathon: { bg: '#FEF3C7', color: '#B45309' },
  'Road Race': { bg: '#DCFCE7', color: '#15803D' },
  Training: { bg: '#F3E8FF', color: '#6B21A8' },
  'National Team': { bg: '#FEE2E2', color: '#B91C1C' },
};

/* ─────────────────────────────────────────────
   VECTOR ILLUSTRATION COMPONENTS
   ───────────────────────────────────────────── */
const VectorRunnerDecoration = () => (
  <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.15 }}>
    <path d="M40 240 Q 120 180, 200 220 T 320 160" stroke="var(--primary)" strokeWidth="6" strokeDasharray="8 8" fill="none" />
    <path d="M20 260 Q 100 200, 180 240 T 300 180" stroke="#38BDF8" strokeWidth="4" fill="none" />
    <circle cx="220" cy="80" r="35" fill="url(#grad1)" />
    <polygon points="120,40 140,80 180,90 150,120 160,160 120,140 80,160 90,120 60,90 100,80" fill="none" stroke="#F59E0B" strokeWidth="2" />
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
        <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity="0.0" />
      </linearGradient>
    </defs>
  </svg>
);

const VectorTrackLines = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
    <path d="M-50 180 C 200 80, 400 220, 850 40" stroke="var(--primary)" strokeWidth="8" />
    <path d="M-50 160 C 200 60, 400 200, 850 20" stroke="var(--primary)" strokeWidth="6" />
    <path d="M-50 140 C 200 40, 400 180, 850 0" stroke="#F59E0B" strokeWidth="6" />
  </svg>
);

interface LandingPageProps {
  onSelectRole: (role: string) => void;
  onRegister: (role: 'CLUB' | 'ATHLETE') => void;
  language?: string;
  publicSubPage?: string;
  onChangePublicSubPage: (page: string) => void;
  darkMode?: boolean;
  currentRole?: 'LANDING' | 'CLUB' | 'ATHLETE';
  currentAthlete?: any;
  onLoginSuccess?: (role: string, data: any) => void;
  navNonce?: number;
}

export default function LandingPage({ onSelectRole, onRegister, language = 'en', publicSubPage = 'HOME', onChangePublicSubPage, darkMode = false, currentRole = 'LANDING', currentAthlete, onLoginSuccess, navNonce }: LandingPageProps) {
  const { t: tr } = useI18n();
  const [selectedMeetId, setSelectedMeetId] = useState<string | null>(null);
  const [selectedAthleteModal, setSelectedAthleteModal] = useState<any>(null);
  const [selectedGalleryTab, setSelectedGalleryTab] = useState<string>('All');
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState<GalleryItem | null>(null);
  const [activeCaptureIndex, setActiveCaptureIndex] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem>(NEWS[0]);
  const [activeStructure, setActiveStructure] = useState<{ title: string; icon: any; amharic: string; description: string; members: string; meets: string } | null>(null);
  const [galleryExpanded, setGalleryExpanded] = useState<boolean>(false);
  const [expandedMeetCards, setExpandedMeetCards] = useState<Record<string, boolean>>({});
  const [expandedAthleteCards, setExpandedAthleteCards] = useState<Record<string, boolean>>({});
  const [viewportWidth, setViewportWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  // News modal state
  const [selectedNewsModal, setSelectedNewsModal] = useState<NewsItem | null>(null);
  const [newsShareCopied, setNewsShareCopied] = useState<boolean>(false);

  const filmstripRef = useRef<HTMLDivElement>(null);

  // Reset selected competition and scroll to top when publicSubPage or navNonce changes
  useEffect(() => {
    setSelectedMeetId(null);
    if (publicSubPage === 'HOME') {
      window.scrollTo(0, 0);
      setTimeout(() => { window.scrollTo(0, 0); }, 50);
      setTimeout(() => { window.scrollTo(0, 0); }, 150);
    }
  }, [publicSubPage, navNonce]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation for Lightbox and News Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxImg) {
        if (e.key === 'Escape') {
          setActiveLightboxImg(null);
        } else if (e.key === 'ArrowRight') {
          setActiveCaptureIndex(prev => {
            const captures = activeLightboxImg.captures || [];
            return prev < captures.length - 1 ? prev + 1 : prev;
          });
        } else if (e.key === 'ArrowLeft') {
          setActiveCaptureIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
      } else if (selectedNewsModal) {
        if (e.key === 'Escape') {
          setSelectedNewsModal(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxImg, selectedNewsModal]);

  // Scroll active thumbnail into view when capture changes
  useEffect(() => {
    if (filmstripRef.current && activeLightboxImg) {
      const activeEl = filmstripRef.current.children[activeCaptureIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCaptureIndex, activeLightboxImg]);

  const handleScrollFilmstrip = (direction: 'left' | 'right') => {
    if (filmstripRef.current) {
      const amount = direction === 'left' ? -240 : 240;
      filmstripRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleShareNews = (item: NewsItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#news - ${item.title}`);
    }
    setNewsShareCopied(true);
    setTimeout(() => setNewsShareCopied(false), 2500);
  };

  const handleNextArticle = () => {
    if (!selectedNewsModal) return;
    const currentIndex = NEWS.findIndex(n => n.id === selectedNewsModal.id);
    const nextIndex = (currentIndex + 1) % NEWS.length;
    setSelectedNewsModal(NEWS[nextIndex]);
  };

  const handlePrevArticle = () => {
    if (!selectedNewsModal) return;
    const currentIndex = NEWS.findIndex(n => n.id === selectedNewsModal.id);
    const prevIndex = (currentIndex - 1 + NEWS.length) % NEWS.length;
    setSelectedNewsModal(NEWS[prevIndex]);
  };

  // Switch album in lightbox
  const handleSwitchLightboxAlbum = (direction: 'prev' | 'next') => {
    if (!activeLightboxImg) return;
    const currentIdx = GALLERY_IMAGES.findIndex(g => g.id === activeLightboxImg.id);
    const targetIdx = direction === 'next'
      ? (currentIdx + 1) % GALLERY_IMAGES.length
      : (currentIdx - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    setActiveLightboxImg(GALLERY_IMAGES[targetIdx]);
    setActiveCaptureIndex(0);
  };

  // Search/Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortByDate, setSortByDate] = useState<string>('UPCOMING_FIRST');
  const [compPage, setCompPage] = useState<number>(0);
  const [showAllComps, setShowAllComps] = useState<boolean>(false);

  // Athletes filter states
  const [athleteSearchText, setAthleteSearchText] = useState<string>('');
  const [athleteEventFilter, setAthleteEventFilter] = useState<string>('ALL');

  // Contact form state
  const [contactForm, setContactForm] = useState<{ name: string; email: string; subject: string; message: string }>({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  const bannerScrollRef = useRef<HTMLDivElement>(null);
  const athleteScrollRef = useRef(null);
  const compScrollRef = useRef(null);

  const [isDraggingComp, setIsDraggingComp] = useState(false);
  const [activeCompIndex, setActiveCompIndex] = useState(0);
  const compDragStartX = useRef(0);
  const compDragScrollLeft = useRef(0);
  const compHasDragged = useRef(false);
  const isDraggingCompRef = useRef(false);

  useEffect(() => {
    isDraggingCompRef.current = isDraggingComp;
  }, [isDraggingComp]);

  const handleCompMouseDown = (e) => {
    const el = compScrollRef.current;
    if (!el) return;
    setIsDraggingComp(true);
    compHasDragged.current = false;
    compDragStartX.current = e.pageX - el.offsetLeft;
    compDragScrollLeft.current = el.scrollLeft;
  };

  const handleCompMouseMove = (e) => {
    if (!isDraggingCompRef.current) return;
    const el = compScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - compDragStartX.current) * 1.5;
    if (Math.abs(walk) > 6) {
      compHasDragged.current = true;
    }
    el.scrollLeft = compDragScrollLeft.current - walk;
  };

  const handleCompMouseUp = () => {
    setIsDraggingComp(false);
  };

  const isManualScrollingRef = useRef(false);
  const manualScrollTimeoutRef = useRef(null);

  const triggerManualScrollPause = () => {
    isManualScrollingRef.current = true;
    if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 2500);
  };

  // Auto-scroll competition cards
  useEffect(() => {
    const el = compScrollRef.current;
    if (!el) return;
    let frame;
    let paused = false;
    let speed = 0.75;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    const onTouchStart = () => { paused = true; };
    const onTouchEnd = () => {
      setTimeout(() => { paused = false; }, 2000);
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    const step = () => {
      if (!paused && !isDraggingCompRef.current && !isManualScrollingRef.current && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      if (el) {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, []);

  // Auto-scroll athlete cards
  useEffect(() => {
    const el = athleteScrollRef.current;
    if (!el) return;
    let frame;
    let paused = false;
    let speed = 0.8;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    const step = () => {
      if (!paused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleScrollBanners = (direction) => {
    const el = compScrollRef.current || bannerScrollRef.current;
    if (!el) return;

    triggerManualScrollPause();

    const cards = el.querySelectorAll('.landing-scroll-card');
    if (!cards || cards.length === 0) return;

    const containerLeft = el.scrollLeft;
    let targetCard = null;

    if (direction === 'right') {
      for (let i = 0; i < cards.length; i++) {
        const cardLeft = cards[i].offsetLeft - el.offsetLeft;
        if (cardLeft > containerLeft + 15) {
          targetCard = cards[i];
          break;
        }
      }
      if (!targetCard) {
        targetCard = cards[0];
      }
    } else {
      for (let i = cards.length - 1; i >= 0; i--) {
        const cardLeft = cards[i].offsetLeft - el.offsetLeft;
        if (cardLeft < containerLeft - 15) {
          targetCard = cards[i];
          break;
        }
      }
      if (!targetCard) {
        targetCard = cards[cards.length - 1];
      }
    }

    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - el.offsetLeft;
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  };

  const scrollToCompIndex = (index) => {
    const el = compScrollRef.current || bannerScrollRef.current;
    if (!el) return;
    triggerManualScrollPause();
    const cards = el.querySelectorAll('.landing-scroll-card');
    if (cards && cards[index]) {
      const targetLeft = cards[index].offsetLeft - el.offsetLeft;
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  };

  const toggleMeetCard = (cardKey) => {
    setExpandedMeetCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const toggleAthleteCard = (cardKey) => {
    setExpandedAthleteCards(prev => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactSuccess(false);
    }, 4000);
  };

  // Filter athletes
  const filteredAthletes = ATHLETES.filter(athlete => {
    if (athleteSearchText) {
      const q = athleteSearchText.toLowerCase();
      const matchName = athlete.name.toLowerCase().includes(q) || (athlete.amharicName && athlete.amharicName.includes(q));
      const matchClub = athlete.club.toLowerCase().includes(q);
      if (!matchName && !matchClub) return false;
    }
    if (athleteEventFilter !== 'ALL' && athlete.event !== athleteEventFilter) return false;
    return true;
  });

  // Get unique events from athletes
  const uniqueEvents = Array.from(new Set(ATHLETES.map(a => a.event)));

  // Localized string packs
  const loc = {
    heroTitle: tr('home.heroTitle'),
    heroSubtitle: tr('home.heroSubtitle'),
    btnPrimary: tr('home.btnRegister'),
    btnSecondary: tr('home.btnExplore'),
    searchPlaceholder: tr('home.searchPlaceholder'),
    regionLabel: tr('common.region'),
    statusLabel: tr('common.status'),
    startDateLabel: tr('home.startDate'),
    endDateLabel: tr('home.endDate'),
    sortLabel: tr('home.sortDate'),
    sortUpcoming: tr('home.upcomingFirst'),
    sortOldest: tr('home.oldestFirst'),

    all: tr('common.all'),
    regOpen: tr('home.regOpen'),
    regClosed: tr('home.regClosed'),
    live: tr('common.live'),
    upcoming: tr('common.upcoming'),
    seeMore: tr('common.seeMore'),
    seeLess: tr('common.seeLess'),

    newsTitle: tr('home.newsTitle'),
    competitionsTitle: tr('home.competitionsTitle'),
    athletesTitle: tr('home.athletesTitle'),
    aboutTitle: tr('home.aboutTitle'),
    structureTitle: tr('home.structureTitle'),
    partnersTitle: tr('home.partnersTitle'),
  };

  const filteredMeets = ENRICHED_MEETS.filter(meet => {
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchTitle = meet.title.toLowerCase().includes(q) || (meet.amharic && meet.amharic.toLowerCase().includes(q));
      const matchVenue = meet.venue.toLowerCase().includes(q);
      const matchEvent = meet.disciplines.some(d => d.toLowerCase().includes(q));
      if (!matchTitle && !matchVenue && !matchEvent) return false;
    }
    if (regionFilter !== 'ALL' && meet.region !== regionFilter) return false;
    if (statusFilter !== 'ALL' && meet.status !== statusFilter) return false;
    if (startDate && new Date(meet.date) < new Date(startDate)) return false;
    if (endDate && new Date(meet.date) > new Date(endDate)) return false;
    return true;
  });

  const sortedMeets = [...filteredMeets].sort((a, b) => {
    const dA = new Date(a.date);
    const dB = new Date(b.date);
    return sortByDate === 'UPCOMING_FIRST' ? dA.getTime() - dB.getTime() : dB.getTime() - dA.getTime();
  });

  // Responsive gallery: full grid on desktop (> 1185px), limited initial set on tablet/mobile
  const galleryLimit = viewportWidth > 1185
    ? GALLERY_IMAGES.length
    : viewportWidth <= 640 ? 4 : 6;
  const visibleGalleryImages = galleryExpanded ? GALLERY_IMAGES : GALLERY_IMAGES.slice(0, galleryLimit);
  const showGalleryToggle = GALLERY_IMAGES.length > galleryLimit;

  // Collapse back to the initial set whenever the visible-count breakpoint changes
  useEffect(() => {
    setGalleryExpanded(false);
  }, [galleryLimit]);

  if (selectedMeetId) {
    const meetObj = ENRICHED_MEETS.find(m => m.id === selectedMeetId);
    return (
      <CompetitionDetail
        meet={meetObj}
        onBack={() => setSelectedMeetId(null)}
        onRegister={onRegister}
        currentRole={currentRole}
        currentAthlete={currentAthlete}
        onLoginSuccess={onLoginSuccess}
      />
    );
  }

  // ── Theme tokens ── premium design tokens that make dark mode pop
  const t = {
    bg: darkMode ? '#090D16' : '#FFFFFF',
    bgAlt: darkMode ? '#0F1524' : '#F8FAFC',
    bgHero: darkMode ? 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(14, 165, 233, 0.18), rgba(9, 13, 22, 0))' : 'linear-gradient(180deg,#F0F9FF 0%,#E0F2FE 40%,#FFFFFF 100%)',
    surface: darkMode ? '#131B2E' : '#FFFFFF',
    surfaceRaised: darkMode ? '#1E294B' : '#F1F5F9',
    text: darkMode ? '#F8FAFC' : '#0F172A',
    textSub: darkMode ? '#CBD5E1' : '#475569',
    textMuted: darkMode ? '#94A3B8' : '#64748B',
    textLight: darkMode ? '#64748B' : '#94A3B8',
    border: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    borderSubtle: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#CBD5E1',
    inputBg: darkMode ? '#0A0F1D' : '#F8FAFC',
  };

  return (
    <div style={{ background: t.bg, minHeight: '100vh', overflowX: 'hidden', color: t.text, transition: 'background 0.3s, color 0.3s' }}>

      {/* ── 1. HERO SECTION WITH VECTOR GRAPHICS ── */}
      {publicSubPage === 'HOME' && (
        <section
          id="home"
          style={{
            position: 'relative',
            minHeight: '520px',
            background: t.bgHero,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px 70px',
            margin: '0',
            overflow: 'hidden'
          }}
        >
          {/* Vector decorative background accents */}
          <VectorTrackLines />
          <div style={{ position: 'absolute', right: '-40px', top: '20px', pointerEvents: 'none' }}>
            <VectorRunnerDecoration />
          </div>
          <div style={{ position: 'absolute', left: '-60px', bottom: '10px', pointerEvents: 'none', transform: 'scaleX(-1)' }}>
            <VectorRunnerDecoration />
          </div>

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '920px', margin: '0 auto' }}>

            <h1 style={{
              color: t.text,
              fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: '18px',
              letterSpacing: '-0.025em',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.25em 0.35em'
            }}>
              {(() => {
                const heroWords = tr('home.heroTitle').split(' ');
                const heroColors = [t.text, 'var(--primary)', t.text, darkMode ? '#38BDF8' : '#0284C7', '#D97706'];
                return heroWords.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.75,
                      delay: 0.12 + index * 0.13,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{
                      color: heroColors[index % heroColors.length],
                      display: 'inline-block'
                    }}
                  >
                    {word}
                  </motion.span>
                ));
              })()}
            </h1>

            <p style={{
              color: t.textSub,
              fontSize: 'clamp(1rem, 2vw, 1.18rem)',
              maxWidth: '720px',
              margin: '0 auto 36px',
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              {loc.heroSubtitle}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              {/* Primary CTA */}
              <button
                onClick={() => onRegister('ATHLETE')}
                className="btn-accent"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(2, 132, 199, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.25s ease'
                }}
              >
                <CheckCircle size={20} />
                {loc.btnPrimary}
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => {
                  const el = document.getElementById('competitions');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: t.surface,
                  border: '1px solid ' + t.borderSubtle,
                  color: t.text,
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  padding: '16px 32px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.bgAlt; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.transform = 'none'; }}
              >
                <Trophy size={20} color="var(--primary)" />
                {loc.btnSecondary}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. COMPETITIONS HUB WITH EMBEDDED SEARCH & FILTERS + AUTO-SCROLL CAROUSEL ── */}
      {(publicSubPage === "HOME" || publicSubPage === "COMPETITIONS") && (
        <section id="competitions" style={{ background: t.bgAlt, padding: '60px 24px', borderTop: '1px solid ' + t.border }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: t.text, marginBottom: 4 }}>
                  {loc.competitionsTitle}
                </h2>
                <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {tr('home.competitionsSub')}
                </p>
              </div>

              {/* Carousel Navigation & Progress Dots */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                {sortedMeets.length > 1 && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} aria-label="Carousel pagination">
                    {sortedMeets.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => scrollToCompIndex(dotIdx)}
                        className={`carousel-dot${activeCompIndex % sortedMeets.length === dotIdx ? ' active' : ''}`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleScrollBanners('left')}
                    className="carousel-nav-btn"
                    aria-label="Previous competitions"
                    title="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => handleScrollBanners('right')}
                    className="carousel-nav-btn"
                    aria-label="Next competitions"
                    title="Next"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* EMBEDDED SEARCH & FILTER WIDGET INSIDE COMPETITIONS HUB */}
            <div
              style={{
                background: t.surface,
                border: '1px solid ' + t.border,
                borderRadius: '20px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
                padding: '24px',
                marginBottom: '28px',
                color: t.text,
              }}
            >
              {/* Free-text Search */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search
                  size={20}
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}
                />
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder={loc.searchPlaceholder}
                  style={{
                    width: '100%',
                    background: t.inputBg,
                    border: '1px solid ' + t.borderSubtle,
                    borderRadius: '14px',
                    padding: '14px 14px 14px 48px',
                    color: t.text,
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>

              {/* Filter Widgets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: t.textSub, fontSize: '0.8rem', fontWeight: 700 }}>{loc.regionLabel}</label>
                  <select
                    className="form-select"
                    value={regionFilter}
                    onChange={e => setRegionFilter(e.target.value)}
                    style={{ background: t.inputBg, border: '1px solid ' + t.borderSubtle, color: t.text, borderRadius: '12px', padding: '10px 12px' }}
                  >
                    <option value="ALL">{tr('home.allRegions')}</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Oromia">Oromia</option>
                    <option value="Amhara">Amhara</option>
                    <option value="Sidama">Sidama</option>
                    <option value="Tigray">Tigray</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: t.textSub, fontSize: '0.8rem', fontWeight: 700 }}>{loc.statusLabel}</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ background: t.inputBg, border: '1px solid ' + t.borderSubtle, color: t.text, borderRadius: '12px', padding: '10px 12px' }}
                  >
                    <option value="ALL">{loc.all}</option>
                    <option value="REGISTRATION_OPEN">{loc.regOpen}</option>
                    <option value="REGISTRATION_CLOSED">{loc.regClosed}</option>
                    <option value="LIVE">{loc.live}</option>
                    <option value="UPCOMING">{loc.upcoming}</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: t.textSub, fontSize: '0.8rem', fontWeight: 700 }}>{loc.startDateLabel}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ background: t.inputBg, border: '1px solid ' + t.borderSubtle, color: t.text, borderRadius: '12px', width: '100%', padding: '10px 12px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: t.textSub, fontSize: '0.8rem', fontWeight: 700 }}>{loc.endDateLabel}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ background: t.inputBg, border: '1px solid ' + t.borderSubtle, color: t.text, borderRadius: '12px', width: '100%', padding: '10px 12px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: t.textSub, fontSize: '0.8rem', fontWeight: 700 }}>{loc.sortLabel}</label>
                  <select
                    className="form-select"
                    value={sortByDate}
                    onChange={e => setSortByDate(e.target.value)}
                    style={{ background: t.inputBg, border: '1px solid ' + t.borderSubtle, color: t.text, borderRadius: '12px', padding: '10px 12px' }}
                  >
                    <option value="UPCOMING_FIRST">{loc.sortUpcoming}</option>
                    <option value="OLDEST_FIRST">{loc.sortOldest}</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Scrollable Horizontal Carousel of Competition Banner Cards */}
            {sortedMeets.length === 0 ? (
              <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '20px', padding: '48px', textAlign: 'center', color: t.textMuted }}>
                <Trophy size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <h4 style={{ fontWeight: 800 }}>{tr('home.noCompetitions')}</h4>
              </div>
            ) : (
              <div
                tabIndex={0}
                aria-label="Competitions and Championship Hub Carousel"
                ref={(el) => {
                  compScrollRef.current = el;
                  bannerScrollRef.current = el;
                }}
                className={`landing-scroll-row${isDraggingComp ? ' is-dragging' : ''}`}
                onMouseDown={handleCompMouseDown}
                onMouseMove={handleCompMouseMove}
                onMouseUp={handleCompMouseUp}
                onMouseLeave={handleCompMouseUp}
                onScroll={() => {
                  const el = compScrollRef.current;
                  if (el && sortedMeets.length > 0) {
                    const cards = el.querySelectorAll('.landing-scroll-card');
                    if (cards.length > 0) {
                      const containerLeft = el.scrollLeft;
                      let closestIdx = 0;
                      let minDiff = Infinity;
                      cards.forEach((card, i) => {
                        const diff = Math.abs((card.offsetLeft - el.offsetLeft) - containerLeft);
                        if (diff < minDiff) {
                          minDiff = diff;
                          closestIdx = i;
                        }
                      });
                      setActiveCompIndex(closestIdx % sortedMeets.length);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') handleScrollBanners('left');
                  if (e.key === 'ArrowRight') handleScrollBanners('right');
                }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  overflowX: 'auto',
                  paddingBottom: '20px',
                  paddingTop: '8px',
                  outline: 'none',
                  cursor: isDraggingComp ? 'grabbing' : 'grab'
                }}
              >
                {[...sortedMeets, ...sortedMeets, ...sortedMeets].map((meet, idx) => {
                  const cardKey = `${meet.id}-${idx}`;
                  const isCardExpanded = !!expandedMeetCards[cardKey];
                  const badgeColor = meet.status === 'REGISTRATION_OPEN' ? 'var(--primary)' : meet.status === 'LIVE' ? '#EF4444' : meet.status === 'UPCOMING' ? '#F59E0B' : '#64748B';
                  const statusName = meet.status === 'REGISTRATION_OPEN' ? loc.regOpen : meet.status === 'LIVE' ? loc.live : meet.status === 'UPCOMING' ? loc.upcoming : loc.regClosed;

                  return (
                    <div
                      key={cardKey}
                      className={`landing-scroll-card${isCardExpanded ? ' meet-card-expanded' : ''}`}
                      onClick={() => {
                        if (compHasDragged.current) {
                          compHasDragged.current = false;
                          return;
                        }
                        setSelectedMeetId(meet.id);
                      }}
                      style={{
                        minWidth: 'min(100%, 360px)',
                        maxWidth: '380px',
                        flexShrink: 0,
                        scrollSnapAlign: 'start',
                        position: 'relative',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        minHeight: '360px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)',
                        border: '1px solid rgba(226, 232, 240, 0.8)'
                      }}
                    >
                      <div className="comp-card-bg-img" style={{ backgroundImage: `url(${meet.img})` }} />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.65) 50%, rgba(15,23,42,0.15) 100%)'
                      }} />

                      <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{
                            background: badgeColor,
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            boxShadow: meet.status === 'LIVE' ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none'
                          }}>
                            {meet.status === 'LIVE' && <span className="status-pulse-dot" />}
                            {statusName}
                          </span>

                          <span style={{
                            background: 'rgba(255, 255, 255, 0.18)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.25)'
                          }}>
                            📍 {meet.region}
                          </span>
                        </div>

                        <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, marginBottom: '12px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                          {language === 'am' ? meet.amharic || meet.title : meet.title}
                        </h3>

                        <div className="meet-card-extra">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#FDE047', fontWeight: 700 }}>
                              <MapPin size={14} style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meet.venue}</span>
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>
                              <Calendar size={14} style={{ flexShrink: 0 }} />
                              <span>{meet.dateString}</span>
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '12px' }}>
                            <span style={{ color: '#38BDF8', fontSize: '0.88rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'gap 0.2s ease' }}>
                              {tr('home.viewDetails')} <ChevronRight size={16} />
                            </span>
                          </div>
                        </div>

                        <button
                          className="meet-card-toggle-btn"
                          onClick={(e) => { e.stopPropagation(); toggleMeetCard(cardKey); }}
                          style={{
                            marginTop: '14px',
                            background: 'rgba(255, 255, 255, 0.16)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            padding: '8px 16px',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isCardExpanded ? loc.seeLess : loc.seeMore}
                          {isCardExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MORE COMPETITIONS BUTTON */}
            {publicSubPage === 'HOME' && (
              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <button
                  className="btn-accent"
                  style={{
                    padding: '14px 36px',
                    borderRadius: '14px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#FFF',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={() => onChangePublicSubPage('COMPETITIONS')}
                >
                  <Trophy size={18} />
                  {tr('home.viewAllCompetitions')} ({ENRICHED_MEETS.length}) →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 4. FEATURED ATHLETES SPOTLIGHT (PLACED ABOVE NEWS SECTION AS REQUESTED!) ── */}
      {(publicSubPage === "HOME" || publicSubPage === "ATHLETES") && (
        <section id="athletes" style={{ background: t.bg, padding: '60px 24px', borderTop: '1px solid ' + t.border }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: t.text }}>{loc.athletesTitle}</h2>
                <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
                  Click on any athlete card to view full  competition profile details
                </p>
              </div>

              {publicSubPage === 'HOME' && (
                <button
                  className="btn-gov-secondary"
                  onClick={() => onChangePublicSubPage('ATHLETES')}
                  style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 800 }}
                >
                  View All Athletes →
                </button>
              )}
            </div>

            <div
              ref={athleteScrollRef}
              className="landing-scroll-row"
              style={{ display: 'flex', gap: '24px', overflowX: 'hidden', paddingBottom: '8px', cursor: 'grab' }}
            >
              {[...ATHLETES, ...ATHLETES, ...ATHLETES].map((athlete, idx) => {
                const cardKey = `${athlete.id}-${idx}`;
                const isCardExpanded = !!expandedAthleteCards[cardKey];
                return (
                  <div
                    key={cardKey}
                    className={`hover-lift${isCardExpanded ? ' athlete-card-expanded' : ''}`}
                    onClick={() => setSelectedAthleteModal(athlete)}
                    style={{
                      position: 'relative',
                      minWidth: 'min(100%, 380px)',
                      maxWidth: '400px',
                      minHeight: '360px',
                      flexShrink: 0,
                      borderRadius: 24,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${athlete.img})`,
                      backgroundSize: 'cover', backgroundPosition: 'center top',
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.35) 55%, transparent 100%)' }} />

                    {/* Fayda Badge */}
                    <div style={{
                      position: 'absolute', top: 16, right: 16, zIndex: 3,
                      background: 'rgba(16, 185, 129, 0.95)', color: '#FFFFFF',
                      fontSize: '0.72rem', fontWeight: 800,
                      padding: '4px 10px', borderRadius: 8,
                      display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      <ShieldCheck size={14} /> Fayda Verified
                    </div>

                    <div style={{ position: 'relative', zIndex: 2, padding: '24px' }}>
                      <h3 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, lineHeight: 1.2 }}>
                        {athlete.name}
                      </h3>
                      <div style={{ color: '#38BDF8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>
                        {athlete.amharicName}
                      </div>

                      <div className="athlete-card-extra">
                        <span style={{ color: '#FDE047', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                          {athlete.achievement}
                        </span>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{
                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#FFF',
                            borderRadius: 8, padding: '4px 10px',
                            fontSize: '0.75rem', fontWeight: 800,
                          }}>{athlete.event}</span>
                          <span style={{ color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600 }}>
                            {athlete.club}
                          </span>
                        </div>

                        <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', color: '#FDE047', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View Full Athlete Profile & PB Stats <ChevronRight size={14} />
                        </div>
                      </div>

                      <button
                        className="athlete-card-toggle-btn"
                        onClick={(e) => { e.stopPropagation(); toggleAthleteCard(cardKey); }}
                        style={{
                          marginTop: '12px',
                          background: 'rgba(255, 255, 255, 0.16)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          padding: '8px 16px',
                          borderRadius: '999px',
                          cursor: 'pointer',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isCardExpanded ? loc.seeLess : loc.seeMore}
                        {isCardExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. NEWS TICKER & LATEST NEWS ── */}
      {(publicSubPage === "HOME" || publicSubPage === "UPDATES") && (
        <>
          {/* Live Ticker Bar */}
          <div style={{
            background: '#0F172A', color: '#FFF', height: 44,
            display: 'flex', alignItems: 'center', overflow: 'hidden',
            borderTop: '2px solid var(--primary)', borderBottom: '2px solid var(--primary)',
          }}>
            <div style={{
              flexShrink: 0, padding: '0 20px',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--primary)', color: '#FFF', height: '100%',
              fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.06em',
              whiteSpace: 'nowrap', zIndex: 1,
            }}>
              <span>🔴</span>
              {tr('home.liveTicker')}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <style>{`
                @keyframes ticker-scroll {
                  0%   { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .ticker-inner {
                  display: inline-block;
                  white-space: nowrap;
                  animation: ticker-scroll 32s linear infinite;
                  font-size: 0.88rem;
                  font-weight: 600;
                  padding-left: 40px;
                }
              `}</style>
              <span className="ticker-inner">
                {tr('home.tickerText')}
              </span>
            </div>
          </div>

          {/* Latest News Section */}
          <section id="news" style={{ background: t.bgAlt, padding: '60px 24px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto' }}>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: t.text }}>{loc.newsTitle}</h2>
                <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
                  {tr('home.newsSub')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Featured Main News — driven by selectedNews state */}
                <div
                  onClick={() => setSelectedNewsModal(selectedNews)}
                  style={{
                    flex: '1.5 1 340px',
                    backgroundImage: `url(${selectedNews.img})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    minHeight: 420, borderRadius: 24, overflow: 'hidden',
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    justifyContent: 'flex-end', cursor: 'pointer',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)',
                    transition: 'all 0.35s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(1, 64, 167, 0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(15, 23, 42, 0.1)';
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.45) 55%, transparent 100%)' }} />
                  <div style={{ position: 'relative', zIndex: 1, padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'var(--primary)', color: '#FFF',
                        borderRadius: 8, padding: '4px 12px',
                        fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em',
                        display: 'inline-block',
                      }}>{selectedNews.tag || tr('home.latestAnnouncement')}</span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#F1F5F9', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ⏱️ {selectedNews.readTime || '3 min read'}
                      </span>
                    </div>

                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: 8, fontWeight: 600 }}>
                      🗓️ {selectedNews.date} · 📍 {selectedNews.location || 'Addis Ababa'}
                    </div>

                    <h3 style={{ color: '#FFFFFF', fontSize: '1.6rem', fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>
                      {selectedNews.title}
                    </h3>
                    {selectedNews.amharicTitle && (
                      <div style={{ color: '#FDE047', fontSize: '0.98rem', fontWeight: 700, marginBottom: 12 }}>
                        {selectedNews.amharicTitle}
                      </div>
                    )}
                    {selectedNews.summary && (
                      <ResponsiveSeeMoreText
                        key={selectedNews.id}
                        text={selectedNews.summary}
                        maxLength={90}
                        lines={2}
                        style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}
                      />
                    )}
                    <span style={{ color: '#38BDF8', fontWeight: 800, fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {tr('home.readFullArticle')} →
                    </span>
                  </div>
                </div>

                {/* Side Stack — all items except the currently featured one */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {NEWS.filter(item => item.id !== selectedNews.id).map(item => {
                    const tc = TAG_COLORS[item.tag] || { bg: '#F1F5F9', color: '#475569' };
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedNews(item)}
                        style={{
                          display: 'flex', background: t.surface, borderRadius: 16,
                          overflow: 'hidden', border: '1px solid ' + t.border, cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(1,64,167,0.12)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                      >
                        <img src={item.img} alt={item.title}
                          style={{ width: 95, height: 95, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ padding: '10px 14px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ color: t.textMuted, fontSize: '0.72rem', marginBottom: 4, fontWeight: 600 }}>{item.date}</div>
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', lineHeight: 1.3, marginBottom: 6, color: t.text }}>
                              {item.title}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{
                              background: tc.bg, color: tc.color,
                              borderRadius: 6, padding: '2px 8px',
                              fontSize: '0.70rem', fontWeight: 800,
                            }}>{item.tag}</span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNewsModal(item);
                              }}
                              style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 4, background: darkMode ? 'rgba(14, 165, 233, 0.1)' : '#F0F9FF' }}
                            >
                              <Eye size={12} /> Read Story
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 6. ABOUT & FEDERATION GOVERNANCE ── */}
      {publicSubPage === 'HOME' && (
        <section id="about" style={{ background: t.bg, padding: '60px 24px', borderTop: '1px solid ' + t.border }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 360px' }}>
              <h2 style={{ color: t.text, fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>
                {loc.aboutTitle}
              </h2>
              <ResponsiveSeeMoreText
                text="The Ethiopian Athletics Federation (EAF) is the national governing body for athletics in Ethiopia, officially recognized by World Athletics (WA) and a member of the African Athletics Confederation (AAC). Founded in 1964, EAF governs all track and field, road, cross-country, and marathon events in Ethiopia. EAF oversees the licensing of athletes and clubs through Fayda digital IDs, organizes national championships, selects national teams for international competitions, and develops grassroots talent across all Ethiopian regional states."
                maxLength={180}
                style={{ color: t.textSub, lineHeight: 1.8, marginBottom: 24, fontSize: '0.95rem' }}
              />
              <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Founded', value: '1964' },
                  { label: 'Licensed Clubs', value: '48 Clubs' },
                  { label: 'World Athletics', value: 'Member ✓' },
                  { label: 'African Athletics', value: 'Member ✓' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: t.bgAlt, borderRadius: 14,
                    padding: '16px 18px', textAlign: 'center',
                    border: '1px solid ' + t.border,
                    borderTop: '3px solid var(--primary)',
                  }}>
                    <div style={{ color: t.text, fontSize: '1.1rem', fontWeight: 900 }}>{s.value}</div>
                    <div style={{ color: t.textMuted, fontSize: '0.78rem', fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 320px' }}>
              <h3 style={{ color: t.text, fontSize: '1.4rem', fontWeight: 900, marginBottom: 24 }}>
                {loc.structureTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {STRUCTURE_ITEMS.map(item => {
                  const isActive = activeStructure?.title === item.title;
                  return (
                    <div key={item.title}>
                      {/* Header row */}
                      <div
                        onClick={() => setActiveStructure(isActive ? null : item)}
                        style={{
                          background: isActive
                            ? (darkMode ? 'rgba(14, 165, 233, 0.15)' : 'var(--primary-light)')
                            : t.bgAlt,
                          border: isActive ? '1px solid var(--primary)' : '1px solid ' + t.border,
                          borderRadius: isActive ? '14px 14px 0 0' : 14,
                          padding: '18px 20px',
                          display: 'flex', alignItems: 'center', gap: 16,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = darkMode ? 'rgba(14, 165, 233, 0.1)' : '#F0F9FF';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = t.bgAlt;
                            e.currentTarget.style.borderColor = t.border;
                          }
                        }}
                      >
                        {item.icon}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: t.text, fontWeight: 800, fontSize: '0.98rem' }}>{item.title}</div>
                          <div style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: 2, fontWeight: 700 }}>{item.amharic}</div>
                        </div>
                        <ChevronRight
                          size={18}
                          color={isActive ? 'var(--primary)' : '#94A3B8'}
                          style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                        />
                      </div>

                      {/* Expanded detail panel */}
                      {isActive && (
                        <div style={{
                          background: t.surface,
                          border: '1px solid var(--primary)',
                          borderTop: 'none',
                          borderRadius: '0 0 14px 14px',
                          padding: '18px 22px 20px',
                        }}>
                          <p style={{ color: t.textSub, fontSize: '0.88rem', lineHeight: 1.75, marginBottom: 14 }}>
                            {item.description}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span style={{
                                background: darkMode ? 'rgba(14, 165, 233, 0.15)' : 'var(--primary-light)',
                                color: darkMode ? '#38BDF8' : 'var(--primary)',
                                borderRadius: 6, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0
                              }}>
                                Members
                              </span>
                              <span style={{ color: t.textSub, fontSize: '0.85rem', fontWeight: 600 }}>{item.members}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span style={{
                                background: darkMode ? 'rgba(14, 165, 233, 0.15)' : 'var(--primary-light)',
                                color: darkMode ? '#38BDF8' : 'var(--primary)',
                                borderRadius: 6, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0
                              }}>
                                Meets
                              </span>
                              <span style={{ color: t.textSub, fontSize: '0.85rem', fontWeight: 600 }}>{item.meets}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. SPONSORS & PARTNERS (IN ORIGINAL OWN COLOR & INFINITE HORIZONTAL MARQUEE SCROLL) ── */}
      {publicSubPage === 'HOME' && (
        <section style={{ background: t.bgAlt, padding: '56px 24px', textAlign: 'center', borderTop: '1px solid ' + t.border, overflow: 'hidden' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', marginBottom: 28 }}>
            <h3 style={{ color: t.text, fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {loc.partnersTitle}
            </h3>
            <p style={{ color: t.textMuted, fontSize: '0.88rem', marginTop: 4 }}>Supporting Ethiopian athletics excellence across global arenas</p>
          </div>

          <style>{`
            @keyframes sponsor-marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .sponsor-track {
              display: flex;
              align-items: center;
              gap: 60px;
              width: max-content;
              animation: sponsor-marquee 24s linear infinite;
            }
            .sponsor-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div style={{ overflow: 'hidden', position: 'relative', width: '100%', padding: '10px 0' }}>
            <div className="sponsor-track">
              {[
                { src: '/images/800px-Adidas_Logo.svg_.png', alt: 'Adidas', h: 46 },
                { src: '/images/ETHIO-TELECOM-1200px-logo-1-1024x269.jpg', alt: 'Ethio Telecom', h: 48 },
                { src: '/images/TeleBirr-Logo-1024x468.png', alt: 'Telebirr', h: 46 },
                { src: '/images/Cocacola-logo.jpg', alt: 'Coca-Cola', h: 52 },
                { src: '/images/OROMIA-1024x279.jpg', alt: 'Oromia Bank', h: 46 },
                { src: '/images/800px-Adidas_Logo.svg_.png', alt: 'Adidas 2', h: 46 },
                { src: '/images/ETHIO-TELECOM-1200px-logo-1-1024x269.jpg', alt: 'Ethio Telecom 2', h: 48 },
                { src: '/images/TeleBirr-Logo-1024x468.png', alt: 'Telebirr 2', h: 46 },
                { src: '/images/Cocacola-logo.jpg', alt: 'Coca-Cola 2', h: 52 },
                { src: '/images/OROMIA-1024x279.jpg', alt: 'Oromia Bank 2', h: 46 },
              ].map((s, idx) => (
                <div key={idx} style={{ background: t.surface, padding: '12px 28px', borderRadius: '16px', border: '1px solid ' + t.border, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: darkMode ? 'brightness(0.9) contrast(1.1)' : 'none' }}>
                  <img
                    src={s.src}
                    alt={s.alt}
                    style={{
                      height: s.h,
                      objectFit: 'contain',
                      maxWidth: '180px',
                      filter: 'none',
                      opacity: 1,
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. MEDIA & PHOTO/VIDEO GALLERY COLLECTION — RESPONSIVE MOSAIC GRID ── */}
      {(publicSubPage === 'HOME' || publicSubPage === 'MEDIA') && (
        <section id="media" style={{ padding: '60px 24px', background: t.bgAlt, borderTop: '1px solid ' + t.border }}>
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E0F2FE', color: 'var(--primary-dark)', padding: '6px 16px', borderRadius: '30px', fontWeight: 800, fontSize: '0.82rem', marginBottom: '12px' }}>
                <Image size={16} /> EAF OFFICIAL MEDIA COLLECTION
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: t.text }}>High-Resolution Photo &amp; Video Gallery</h2>
              <p style={{ color: t.textMuted, marginTop: '8px', fontSize: '1rem', maxWidth: '600px', margin: '8px auto 0' }}>
                Explore historic championship moments, marathon victories, send-off ceremonies, and athlete training sessions
              </p>
            </div>

            {/* Asymmetric Dense Mosaic Grid Layout Collection */}
            <div className="media-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gridAutoRows: '240px',
              gridAutoFlow: 'dense',
              gap: '20px'
            }}>
              {visibleGalleryImages.map((item, idx) => {
                const isHero = idx === 0;
                const isTall = idx === 1 || idx === 6;
                const isWide = idx === 3 || idx === 8;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.4, delay: (idx % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="hover-lift media-grid-card"
                    onClick={() => {
                      setActiveLightboxImg(item);
                      setActiveCaptureIndex(0);
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      gridColumn: isHero ? 'span 2' : isWide ? 'span 2' : 'span 1',
                      gridRow: isHero ? 'span 2' : isTall ? 'span 2' : 'span 1',
                      cursor: 'pointer',
                      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                      border: '1px solid #E2E8F0',
                      minHeight: isTall || isHero ? '480px' : '240px'
                    }}
                  >
                    <motion.img
                      src={item.img}
                      alt={item.title}
                      className="media-card-img"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5 }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)' }} />

                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'var(--primary)', color: '#FFF', padding: '4px 12px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      {item.type === 'VIDEO' ? (
                        <span style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#FFF', padding: '4px 10px', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Play size={12} fill="#FFF" /> HD Video
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#FFF', padding: '4px 10px', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          📸 Photo
                        </span>
                      )}
                    </div>

                    {/* Bottom Content */}
                    <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#FFF', zIndex: 2 }}>
                      <h4 style={{ fontSize: isHero ? '1.5rem' : '1.1rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '6px' }}>{item.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>📍 {item.location}</span>
                        <span>🗓️ {item.date}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {showGalleryToggle && (
              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <button
                  onClick={() => setGalleryExpanded(prev => !prev)}
                  className="btn-accent"
                  style={{
                    padding: '12px 32px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: '#FFF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  {galleryExpanded ? loc.seeLess : loc.seeMore}
                  {galleryExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 8.5 FAQ SECTION ── */}
      <section style={{ background: t.bg, padding: '60px 24px', borderTop: '1px solid ' + t.border }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: t.text }}>Frequently Asked Questions</h2>
            <p style={{ color: t.textMuted, marginTop: '8px', fontSize: '1rem' }}>Find answers about registration, Fayda IDs, and club licensing.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'How do I verify my Fayda ID?', a: 'Enter your 12-digit Fayda FIN on the registration screen. The system will automatically fetch your profile from the national database.' },
              { q: 'Can I register a new club online?', a: 'Yes. Switch to the Club Admin role and follow the club registration workflow. You will need your official club details and manager information.' },
              { q: 'When are the results updated?', a: 'Results for live competitions are updated in real-time by the technical committee directly from the venue.' }
            ].map((faq, idx) => (
              <div key={idx} style={{ border: '1px solid ' + t.border, borderRadius: '16px', background: t.bgAlt, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 500, color: t.text, fontSize: '1.02rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                    <HelpCircle size={20} color="var(--primary)" />
                    {faq.q}
                  </span>
                  {openFaq === idx ? <Minus size={20} color="#64748B" /> : <Plus size={20} color="#64748B" />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 20px 20px 52px', color: t.textSub, fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8.6 CONTACT FORM SECTION ── */}
      <section id="contact-form" style={{ background: darkMode ? '#0D1117' : '#F0F9FF', padding: '60px 24px', borderTop: '1px solid ' + t.border }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: t.surface, padding: '40px', borderRadius: '24px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.05)', border: '1px solid ' + t.border }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: t.text }}>Contact the Federation</h2>
            <p style={{ color: t.textMuted, marginTop: '8px', fontSize: '1rem' }}>Get in touch with EAF licensing, event directors or media team.</p>
          </div>

          {contactSuccess ? (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', borderRadius: '12px', padding: '20px', textAlign: 'center', fontSize: '1rem', fontWeight: 800 }}>
              ✓ Message Sent Successfully! Our team will respond shortly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  style={{ padding: '14px', borderRadius: '12px', border: '1px solid ' + t.borderSubtle, fontSize: '0.95rem', background: t.inputBg, color: t.text }}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  style={{ padding: '14px', borderRadius: '12px', border: '1px solid ' + t.borderSubtle, fontSize: '0.95rem', background: t.inputBg, color: t.text }}
                />
              </div>
              <input
                type="text"
                placeholder="Subject / Concern"
                value={contactForm.subject}
                onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                required
                style={{ padding: '14px', borderRadius: '12px', border: '1px solid ' + t.borderSubtle, fontSize: '0.95rem', background: t.inputBg, color: t.text }}
              />
              <textarea
                placeholder="Message Details..."
                rows={4}
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                required
                style={{ padding: '14px', borderRadius: '12px', border: '1px solid ' + t.borderSubtle, fontSize: '0.95rem', resize: 'vertical', background: t.inputBg, color: t.text }}
              />
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', fontWeight: 900, border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)' }}
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── 9. FOOTER — AppColors.primary background ── */}
      <footer style={{ background: 'linear-gradient(160deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFFFFF', padding: '60px 24px 30px', borderTop: '4px solid rgba(255,255,255,0.15)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, marginBottom: 48 }}>
            {/* Col 1: Logo & Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFFFF', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/images/logo.jpeg"
                    alt="EAF Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>
                    Ethiopian Athletics Federation
                  </div>
                  <div style={{ color: '#FEF08A', fontSize: '0.78rem', fontWeight: 800 }}>
                    የኢትዮጵያ አትሌቲክስ ፌዴሬሽን
                  </div>
                </div>
              </div>
              <p style={{ color: '#E0F2FE', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                The official national governing body for track, field, road, cross-country and marathon athletics in Ethiopia since 1964.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { id: 'facebook', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> },
                  { id: 'twitter', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg> },
                  { id: 'instagram', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
                  { id: 'youtube', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> },
                  { id: 'tiktok', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg> }
                ].map(social => (
                  <a key={social.id} href="#social"
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.2)', color: '#FFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 style={{ color: '#FEF08A', fontWeight: 900, fontSize: '1rem', marginBottom: 20, letterSpacing: '0.04em' }}>
                Quick Links / ፈጣን አገናኞች
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUICK_LINKS.map(([en, am, href]) => (
                  <a
                    key={en}
                    href={href}
                    onClick={(e) => {
                      if (href === '#media') { e.preventDefault(); onChangePublicSubPage('MEDIA'); }
                      else if (href === '#competitions') { e.preventDefault(); onChangePublicSubPage('COMPETITIONS'); }
                      else if (href === '#athletes') { e.preventDefault(); onChangePublicSubPage('ATHLETES'); }
                      else if (href === '#home') { e.preventDefault(); onChangePublicSubPage('HOME'); }
                    }}
                    style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
                  >
                    {en} / {am}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 3: Direct Contact Details */}
            <div>
              <h4 style={{ color: '#FEF08A', fontWeight: 900, fontSize: '1rem', marginBottom: 20, letterSpacing: '0.04em' }}>
                Federation HQ / ያናግሩን
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <Phone size={18} />, text: '+251 11 551 7777' },
                  { icon: <Mail size={18} />, text: 'info@eaf.org.et' },
                  { icon: <Globe size={18} />, text: 'www.eaf.org.et' },
                  { icon: <MapPin size={18} />, text: 'Addis Ababa National Stadium Compound, Ethiopia' },
                ].map(c => (
                  <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span style={{ color: '#FEF08A', flexShrink: 0 }}>{c.icon}</span>
                    {c.text}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600 }}>
              © 2026 Ethiopian Athletics Federation — የኢትዮጵያ አትሌቲክስ ፌዴሬሽን. All rights reserved.
            </p>
            <p style={{ color: '#FEF08A', fontSize: '0.82rem', fontWeight: 800 }}>
              EOSCRMS Government Portal System v4.2
            </p>
          </div>
        </div>
      </footer>

      {/* ── ATHLETE DETAIL MODAL ── */}
      {selectedAthleteModal && (
        <div className="modal-backdrop" onClick={() => setSelectedAthleteModal(null)} style={{ zIndex: 9999, padding: '24px 16px' }}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ padding: '40px 44px', maxWidth: '820px', width: '95%', margin: '20px auto', borderRadius: '24px', boxShadow: '0 32px 64px rgba(15, 23, 42, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img
                  src={selectedAthleteModal.img}
                  alt={selectedAthleteModal.name}
                  style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                />
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                    <ShieldCheck size={14} /> Fayda Verified ({selectedAthleteModal.faydaFin})
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3, marginBottom: '2px' }}>
                    {selectedAthleteModal.name}
                  </h3>
                  <div style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {selectedAthleteModal.amharicName}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAthleteModal(null)} style={{ background: '#F1F5F9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            {/* Athlete Bio & Stats Table */}
            <div style={{ background: t.bgAlt, padding: '20px', borderRadius: '18px', marginBottom: '24px', border: '1px solid ' + t.border, overflowX: 'auto' }}>
              <table className="gov-table" style={{ margin: 0 }}>
                <tbody>
                  <tr><td style={{ width: '40%', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Primary Event</td><td style={{ fontWeight: 800, color: '#0F172A' }}>{selectedAthleteModal.event}</td></tr>
                  <tr><td style={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Club Affiliation</td><td style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedAthleteModal.club}</td></tr>
                  <tr><td style={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Personal Best</td><td style={{ fontWeight: 800, color: '#D97706' }}>{selectedAthleteModal.pb}</td></tr>
                  <tr><td style={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Age Division</td><td style={{ fontWeight: 800, color: '#15803D' }}>{selectedAthleteModal.ageTier}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Athlete Quote */}
            {selectedAthleteModal.quote && (
              <div style={{ background: '#F0F9FF', borderLeft: '4px solid var(--primary)', padding: '16px 20px', borderRadius: '12px', fontStyle: 'italic', color: '#0369A1', marginBottom: '24px', fontWeight: 600 }}>
                "{selectedAthleteModal.quote}"
              </div>
            )}

            {/* Medals & Honors */}
            <div>
              <h4 style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.1rem', marginBottom: '12px' }}>Career Honors & Medal Achievements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedAthleteModal.medals ? selectedAthleteModal.medals.map((m, idx) => (
                  <div key={idx} style={{ background: t.surface, border: '1px solid ' + t.border, padding: '12px 16px', borderRadius: '12px', fontWeight: 800, color: t.text, fontSize: '0.9rem' }}>
                    {m}
                  </div>
                )) : (
                  <div style={{ color: '#64748B' }}>National team elite record holder</div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedAthleteModal(null)}
              className="btn-accent"
              style={{ width: '100%', marginTop: '28px', padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              Close Profile View
            </button>
          </div>
        </div>
      )}

      {/* ── NEWS ARTICLE READER MODAL ── */}
      {selectedNewsModal && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedNewsModal(null)}
          style={{ zIndex: 99999, background: 'rgba(7, 12, 24, 0.85)', backdropFilter: 'blur(8px)', padding: '24px 16px' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              padding: '36px 40px',
              maxWidth: '880px',
              width: '95%',
              margin: '20px auto',
              borderRadius: '24px',
              boxShadow: '0 32px 72px rgba(0, 0, 0, 0.45)',
              background: t.surface,
              color: t.text,
              border: '1px solid ' + t.border,
            }}
          >
            {/* Top Bar with Badge, Read Time, Share, and Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {selectedNewsModal.tag}
                </span>
                <span style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9', color: t.textMuted, padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                  ⏱️ {selectedNewsModal.readTime || '3 min read'}
                </span>
                <span style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9', color: t.textMuted, padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                  📍 {selectedNewsModal.location}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handleShareNews(selectedNewsModal)}
                  title="Share Article"
                  style={{
                    background: newsShareCopied ? '#DCFCE7' : (darkMode ? '#1E293B' : '#F1F5F9'),
                    color: newsShareCopied ? '#15803D' : t.text,
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                  }}
                >
                  {newsShareCopied ? <Check size={16} /> : <Share2 size={16} />}
                  {newsShareCopied ? 'Link Copied!' : 'Share'}
                </button>
                <button
                  onClick={() => setSelectedNewsModal(null)}
                  style={{
                    background: darkMode ? '#1E293B' : '#F1F5F9',
                    border: 'none',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.textMuted,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#FFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = darkMode ? '#1E293B' : '#F1F5F9'; e.currentTarget.style.color = t.textMuted; }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '18px', overflow: 'hidden', marginBottom: '24px', background: '#0F172A' }}>
              <img
                src={selectedNewsModal.img}
                alt={selectedNewsModal.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>📷 Ethiopian Athletics Federation Official Media</span>
                <span>🗓️ {selectedNewsModal.date}</span>
              </div>
            </div>

            {/* Article Headline & Metadata */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: t.text, lineHeight: 1.3, marginBottom: '8px' }}>
                {selectedNewsModal.title}
              </h2>
              {selectedNewsModal.amharicTitle && (
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {selectedNewsModal.amharicTitle}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: '16px', borderBottom: '1px solid ' + t.border, color: t.textMuted, fontSize: '0.86rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✍️ <strong style={{ color: t.text }}>{selectedNewsModal.author}</strong>
                </span>
                <span>•</span>
                <span>🏛️ Addis Ababa Headquarters</span>
              </div>
            </div>

            {/* Lead Summary Paragraph */}
            {selectedNewsModal.summary && (
              <div style={{
                background: darkMode ? 'rgba(14, 165, 233, 0.1)' : '#F0F9FF',
                borderLeft: '4px solid var(--primary)',
                padding: '16px 20px',
                borderRadius: '0 14px 14px 0',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                fontWeight: 600,
                color: darkMode ? '#BAE6FD' : '#0369A1',
                marginBottom: '24px'
              }}>
                {selectedNewsModal.summary}
              </div>
            )}

            {/* Main Article Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {selectedNewsModal.paragraphs ? selectedNewsModal.paragraphs.map((p, idx) => (
                <p key={idx} style={{ color: t.textSub, fontSize: '0.98rem', lineHeight: 1.8 }}>
                  {p}
                </p>
              )) : (
                <p style={{ color: t.textSub, fontSize: '0.98rem', lineHeight: 1.8 }}>
                  {selectedNewsModal.summary}
                </p>
              )}
            </div>

            {/* Key Quote Callout */}
            {selectedNewsModal.quote && (
              <div style={{
                background: t.bgAlt,
                border: '1px solid ' + t.border,
                borderTop: '4px solid #F59E0B',
                padding: '22px 24px',
                borderRadius: '16px',
                marginBottom: '28px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '1.08rem', fontStyle: 'italic', lineHeight: 1.7, color: t.text, fontWeight: 600, marginBottom: '12px' }}>
                  "{selectedNewsModal.quote.text}"
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  — {selectedNewsModal.quote.author}
                </div>
              </div>
            )}

            {/* Key Statistics / Highlights Breakdown */}
            {selectedNewsModal.stats && selectedNewsModal.stats.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: t.text, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                  📊 Event Highlights & Metrics
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {selectedNewsModal.stats.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: t.bgAlt,
                        border: '1px solid ' + t.border,
                        borderRadius: '14px',
                        padding: '14px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.textMuted, marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Story Gallery Thumbnails */}
            {selectedNewsModal.gallery && selectedNewsModal.gallery.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: t.text, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                  📸 Press Gallery Shots
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {selectedNewsModal.gallery.map((imgSrc, idx) => (
                    <div key={idx} style={{ height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid ' + t.border }}>
                      <img src={imgSrc} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Story Navigation & Close */}
            <div style={{ borderTop: '1px solid ' + t.border, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handlePrevArticle}
                  style={{
                    background: t.bgAlt,
                    border: '1px solid ' + t.border,
                    color: t.text,
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ChevronLeft size={16} /> Previous Story
                </button>
                <button
                  onClick={handleNextArticle}
                  style={{
                    background: t.bgAlt,
                    border: '1px solid ' + t.border,
                    color: t.text,
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Next Story <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={() => setSelectedNewsModal(null)}
                className="btn-accent"
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.92rem'
                }}
              >
                Close Article Reader
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL FOR GALLERY IMAGES (WITH HORIZONTAL EVENT CAPTURE SCROLL) ── */}
      {activeLightboxImg && (() => {
        const captures = activeLightboxImg.captures && activeLightboxImg.captures.length > 0
          ? activeLightboxImg.captures
          : [{ id: 1, img: activeLightboxImg.img, title: activeLightboxImg.title, caption: activeLightboxImg.description || 'EAF High-Resolution Press Photography' }];
        const activeCapture = captures[activeCaptureIndex] || captures[0];

        return (
          <div
            className="modal-backdrop"
            onClick={() => setActiveLightboxImg(null)}
            style={{ zIndex: 99999, background: 'rgba(3, 7, 18, 0.94)', backdropFilter: 'blur(16px)', padding: '16px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0F172A',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                maxWidth: '1040px',
                width: '95%',
                maxHeight: '94vh',
                overflowY: 'auto',
                borderRadius: '24px',
                padding: '24px 28px',
                color: '#FFFFFF'
              }}
            >
              {/* Lightbox Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ background: 'rgba(14, 165, 233, 0.25)', color: '#38BDF8', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {activeLightboxImg.category}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>
                      📍 {activeLightboxImg.location} · 🗓️ {activeLightboxImg.date}
                    </span>
                  </div>
                  <h3 style={{ color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.3 }}>
                    {activeLightboxImg.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FEF08A',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Camera size={14} /> Photo {activeCaptureIndex + 1} of {captures.length}
                  </span>
                  <button
                    onClick={() => setActiveLightboxImg(null)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: 'none',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main Viewport Stage for Selected Capture */}
              <div style={{
                position: 'relative',
                height: 'min(50vh, 440px)',
                background: '#020617',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)'
              }}>
                <img
                  key={activeCapture.id}
                  src={activeCapture.img}
                  alt={activeCapture.title}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />

                {/* Floating Left/Right Prev/Next Buttons */}
                {captures.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCaptureIndex(prev => prev > 0 ? prev - 1 : captures.length - 1);
                      }}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        zIndex: 10
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCaptureIndex(prev => (prev + 1) % captures.length);
                      }}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FFFFFF',
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        zIndex: 10
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Bottom Overlay with Caption */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.6) 60%, transparent 100%)',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 8
                }}>
                  <div style={{ maxWidth: '80%' }}>
                    <div style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>
                      {activeCapture.title}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.4 }}>
                      {activeCapture.caption}
                    </div>
                  </div>
                  {activeCapture.photographer && (
                    <div style={{ color: '#38BDF8', fontSize: '0.78rem', fontWeight: 700 }}>
                      📷 {activeCapture.photographer}
                    </div>
                  )}
                </div>
              </div>

              {/* ── HORIZONTAL SCROLLABLE FILMSTRIP TRACK OF ALL EVENT CAPTURES ── */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Image size={16} color="#38BDF8" /> All Images Captured at this Event (Scroll Horizontally):
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleScrollFilmstrip('left')}
                      title="Scroll Left"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFF',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 800
                      }}
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => handleScrollFilmstrip('right')}
                      title="Scroll Right"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFF',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 800
                      }}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* Horizontal Scroll Track */}
                <div
                  ref={filmstripRef}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    padding: '8px 4px 14px',
                    scrollBehavior: 'smooth',
                  }}
                >
                  {captures.map((capture, idx) => {
                    const isSelected = idx === activeCaptureIndex;
                    return (
                      <div
                        key={capture.id}
                        onClick={() => setActiveCaptureIndex(idx)}
                        style={{
                          minWidth: '150px',
                          maxWidth: '160px',
                          height: '95px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative',
                          flexShrink: 0,
                          scrollSnapAlign: 'start',
                          border: isSelected ? '3px solid #38BDF8' : '2px solid rgba(255, 255, 255, 0.15)',
                          boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.5)' : 'none',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          opacity: isSelected ? 1 : 0.65
                        }}
                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; } }}
                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
                      >
                        <img
                          src={capture.img}
                          alt={capture.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Number Badge */}
                        <div style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          background: isSelected ? '#0284C7' : 'rgba(0,0,0,0.65)',
                          color: '#FFFFFF',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 800
                        }}>
                          #{idx + 1}
                        </div>
                        {/* Title Overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                          padding: '4px 6px',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {capture.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Footer Bar with Album Switching & Close Button */}
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleSwitchLightboxAlbum('prev')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <ChevronLeft size={16} /> Previous Event
                  </button>
                  <button
                    onClick={() => handleSwitchLightboxAlbum('next')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    Next Event <ChevronRight size={16} />
                  </button>
                </div>

                <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>
                  Tip: Use <kbd style={{ background: '#1E293B', padding: '2px 6px', borderRadius: 4, color: '#FFF' }}>←</kbd> <kbd style={{ background: '#1E293B', padding: '2px 6px', borderRadius: 4, color: '#FFF' }}>→</kbd> to navigate, <kbd style={{ background: '#1E293B', padding: '2px 6px', borderRadius: 4, color: '#FFF' }}>Esc</kbd> to exit
                </div>

                <button
                  onClick={() => setActiveLightboxImg(null)}
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(255,255,255,0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  ✕ Close Gallery
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

    </div>
  );
}
