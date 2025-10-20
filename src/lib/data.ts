
export type Announcement = {
  id: string;
  title: string;
  date: string;
  snippet: string;
  content: string;
  isCondolence?: boolean;
  condolences?: { user: string; message: string; approved: boolean }[];
};

export type DownloadableFile = {
  id: string;
  name: string;
  description: string;
  url: string;
  isFeatured?: boolean;
};

export type Member = {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Pending';
    contributions: 'Paid' | 'Overdue';
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  familyMembers: string[];
};

export type Contribution = {
  totalMonths: number;
  paidMonths: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
};


export const announcements: Announcement[] = [
  {
    id: "1",
    title: "የማህበር ወርሃዊ ስብሰባ",
    date: "August 25, 2024",
    snippet: "የነሐሴ ወር የማህበራችን ስብሰባ በ25ኛው ቀን ይካሄዳል።",
    content: "የተከበራችሁ የማህበራችን አባላት፣ የነሐሴ ወር መደበኛ ስብሰባችን እሁድ ነሐሴ 25 ቀን 2024 ዓ.ም ከቀኑ 8፡00 ጀምሮ በማህበራችን አዳራሽ ይካሄዳል። በስብሰባው ላይ ስለ ማህበሩ የፋይናንስ ሁኔታ፣ ስለ ቀጣይ እቅዶች እና አዳዲስ አባላት ጉዳይ ላይ ውይይት ይደረጋል። ሁላችሁም በሰዓቱ እንድትገኙ እናሳስባለን።",
  },
  {
    id: "2",
    title: "የአባል የሀዘን መግለጫ",
    date: "August 22, 2024",
    snippet: "የማህበራችን አባል የሆኑት የአቶ አለሙ በቀለ እናት ከዚህ አለም በሞት ተለይተዋል።",
    content: "የማህበራችን አባል የሆኑት የአቶ አለሙ በቀለ እናት ወ/ሮ ጥሩወርቅ ከበደ ከዚህ አለም በሞት በመለየታቸው ጥልቅ ሀዘናችንን እንገልፃለን። የቀብር ስነስርዓቱ ነሐሴ 23 ቀን 2024 ዓ.ም በቅዱስ ገብርኤል ቤተክርስቲያን ይፈጸማል። ለማህበራችን አባልና ለቤተሰቦቻቸው መፅናናትን እንመኛለን።",
    isCondolence: true,
    condolences: [
        { user: 'Tesfaye G.', message: 'መፅናናቱን ይስጣችሁ።', approved: true},
        { user: 'Anonymous', message: 'May they rest in peace.', approved: false},
        { user: 'Maria S.', message: 'Mein Beileid.', approved: true},
    ]
  },
  {
    id: "3",
    title: "Community Picnic Day",
    date: "July 30, 2024",
    snippet: "Join us for a fun-filled community picnic at the English Garden!",
    content: "We are excited to announce our annual community picnic, which will be held on Saturday, August 10, 2024, at the English Garden. The event will start at 12:00 PM. There will be food, games, and music for all ages. Please bring your families and let's have a wonderful time together. RSVP by August 5th.",
  },
];

export const downloadableFiles: DownloadableFile[] = [
    { id: '1', name: 'Membership Application Form', description: 'Download and fill out this form to apply for membership.', url: '/forms/membership-form.pdf', isFeatured: true},
    { id: '2', name: 'Kalkidan e.V. Bylaws', description: 'Read the official rules and regulations of our association.', url: '/forms/bylaws.pdf' },
    { id: '3', name: 'Website Usage Guide', description: 'A helpful guide on how to use the features of this website.', url: '/forms/website-guide.pdf', isFeatured: true},
    { id: '4', name: 'Event Contribution Form', description: 'Form for members to contribute to upcoming community events.', url: '/forms/event-contribution.pdf' },
];

export const members: Member[] = [
    { id: '1', name: 'Abebe Kebede', email: 'abebe.k@example.com', status: 'Active', contributions: 'Paid'},
    { id: '2', name: 'Tigist Alemu', email: 'tigist.a@example.com', status: 'Active', contributions: 'Overdue'},
    { id: '3', name: 'Yosef Tadesse', email: 'yosef.t@example.com', status: 'Pending', contributions: 'Paid'},
    { id: '4', name: 'Freweini Gebru', email: 'freweini.g@example.com', status: 'Active', contributions: 'Paid'},
];

export const userProfile: UserProfile = {
  id: '1',
  name: 'Abebe Kebede',
  email: 'abebe.k@example.com',
  phone: '+49 123 456 7890',
  address: '123 Community Lane, 80331 Munich, Germany',
  familyMembers: ['Tigist Kebede (Spouse)', 'Samuel Abebe (Son)'],
};

export const userContribution: Contribution = {
  totalMonths: 12,
  paidMonths: 10,
};

export const userAchievements: Achievement[] = [
    { id: '1', name: 'Community Pillar', description: 'Logged in 10 times.' },
    { id: '2', name: 'Active Voice', description: 'Viewed 5 announcements.'},
];
