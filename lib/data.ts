export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  photoUrl: string;
  about: string;
  consultationFee: string;
  consultationType: string;
  available: boolean;
  nextSlot?: string;
  category: 'Gynecologist' | 'IVF Specialist' | 'Fertility Expert';
}

export interface Program {
  id: string;
  title: string;
  duration: string;
  category: 'Fertility' | 'PCOS' | 'Pregnancy' | 'Menopause';
  imageUrl: string;
  popular?: boolean;
  description: string;
}

export interface WellnessSession {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  type: 'live' | 'self-paced';
  scheduledAt?: string;
  thumbnailUrl: string;
  category: 'Yoga' | 'Meditation' | 'Breathing' | 'Fitness';
}

export interface Article {
  id: string;
  title: string;
  readTime: string;
  imageUrl: string;
  category: string;
  excerpt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  location: string;
  timeAgo: string;
  likes: number;
  comments: number;
  avatarUrl: string;
  topic: 'Pregnancy' | 'PCOS' | 'IVF' | 'Motherhood' | 'General';
}

export interface HealthRecord {
  id: string;
  type: string;
  date: string;
  icon: 'file' | 'droplet' | 'pill';
}

// ─── Doctors ───────────────────────────────────────────────────────────────

export const doctors: Doctor[] = [
  {
    id: 'deepa',
    name: 'Dr. Deepa Madhavan',
    specialty: 'Gynecologist & IVF Specialist',
    experience: '15+ Years Experience',
    languages: ['English', 'Malayalam'],
    rating: 4.9,
    reviewCount: 312,
    photoUrl: 'https://images.pexels.com/photos/5441150/pexels-photo-5441150.jpeg?auto=compress&cs=tinysrgb&w=400',
    about:
      'Experienced Gynecologist & IVF Specialist providing compassionate care for women at every stage of life. Trained at AIIMS with specialization in reproductive medicine and minimally invasive gynecologic surgery.',
    consultationFee: 'Included in Membership',
    consultationType: 'Video Consultation',
    available: true,
    nextSlot: '20 May 2025 · 10:30 AM',
    category: 'Gynecologist',
  },
  {
    id: 'deva',
    name: 'Dr. Deva Al',
    specialty: 'Gynecologist & IVF Specialist',
    experience: '13+ Years Experience',
    languages: ['English', 'Tamil'],
    rating: 4.8,
    reviewCount: 198,
    photoUrl: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=400',
    about:
      'Dedicated IVF and Gynecology expert with a focus on fertility treatments and women\'s reproductive health. Known for a patient-centered approach and high success rates in IVF cycles.',
    consultationFee: 'Included in Membership',
    consultationType: 'Video Consultation',
    available: true,
    nextSlot: 'Today · 3:30 PM',
    category: 'IVF Specialist',
  },
  {
    id: 'shama',
    name: 'Dr. Shama Al Mulla',
    specialty: 'IVF Specialist',
    experience: '10+ Years Experience',
    languages: ['English', 'Arabic'],
    rating: 4.7,
    reviewCount: 145,
    photoUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
    about:
      'Specialist in IVF and advanced fertility treatments. Dedicated to supporting women through their fertility journey with evidence-based care and emotional support.',
    consultationFee: 'Included in Membership',
    consultationType: 'Video Consultation',
    available: false,
    nextSlot: 'Tomorrow · 9:00 AM',
    category: 'Fertility Expert',
  },
];

// ─── Programs ──────────────────────────────────────────────────────────────

export const programs: Program[] = [
  {
    id: 'pcos-care',
    title: 'PCOS Care Program',
    duration: '8 Weeks Program',
    category: 'PCOS',
    imageUrl: 'https://images.pexels.com/photos/5473187/pexels-photo-5473187.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true,
    description: 'A comprehensive program to manage PCOS symptoms through diet, exercise, and lifestyle changes.',
  },
  {
    id: 'fertility-support',
    title: 'Fertility Support Program',
    duration: '12 Weeks Program',
    category: 'Fertility',
    imageUrl: 'https://images.pexels.com/photos/3845454/pexels-photo-3845454.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Evidence-based fertility support combining nutrition, yoga, and expert consultations.',
  },
  {
    id: 'preconception-nutrition',
    title: 'Preconception Nutrition',
    duration: '6 Weeks Program',
    category: 'Pregnancy',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Optimize your nutrition before conception for a healthy pregnancy.',
  },
  {
    id: 'postpartum-recovery',
    title: 'Postpartum Recovery',
    duration: '8 Weeks Program',
    category: 'Pregnancy',
    imageUrl: 'https://images.pexels.com/photos/3662622/pexels-photo-3662622.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Gentle recovery program for new mothers covering physical healing and emotional well-being.',
  },
  {
    id: 'menopause-wellness',
    title: 'Menopause Wellness',
    duration: '10 Weeks Program',
    category: 'Menopause',
    imageUrl: 'https://images.pexels.com/photos/7414038/pexels-photo-7414038.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Navigate menopause with confidence through expert guidance, lifestyle adjustments, and wellness practices.',
  },
];

// ─── Wellness Sessions ──────────────────────────────────────────────────────

export const wellnessSessions: WellnessSession[] = [
  {
    id: 'prenatal-yoga',
    title: 'Prenatal Yoga',
    subtitle: 'For a healthy pregnancy',
    duration: '45 min',
    type: 'live',
    scheduledAt: 'Tomorrow, 7:00 AM',
    thumbnailUrl: 'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Yoga',
  },
  {
    id: 'pcos-yoga',
    title: 'Yoga for PCOS',
    subtitle: 'Balance hormones naturally',
    duration: '40 min',
    type: 'live',
    scheduledAt: 'Today, 6:30 PM',
    thumbnailUrl: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Yoga',
  },
  {
    id: 'morning-yoga',
    title: 'Morning Yoga Flow',
    subtitle: 'Energize your day',
    duration: '20 min',
    type: 'self-paced',
    thumbnailUrl: 'https://images.pexels.com/photos/4834183/pexels-photo-4834183.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Yoga',
  },
  {
    id: 'stress-meditation',
    title: 'Stress Relief Meditation',
    subtitle: 'Calm your mind',
    duration: '15 min',
    type: 'self-paced',
    thumbnailUrl: 'https://images.pexels.com/photos/3822864/pexels-photo-3822864.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Meditation',
  },
  {
    id: 'breathing-exercises',
    title: 'Breathing Exercises',
    subtitle: 'Pranayama for hormonal balance',
    duration: '10 min',
    type: 'self-paced',
    thumbnailUrl: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Breathing',
  },
  {
    id: 'fitness-core',
    title: 'Core Strength Training',
    subtitle: 'Build strength safely',
    duration: '30 min',
    type: 'self-paced',
    thumbnailUrl: 'https://images.pexels.com/photos/6922163/pexels-photo-6922163.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Fitness',
  },
];

// ─── Articles ──────────────────────────────────────────────────────────────

export const articles: Article[] = [
  {
    id: 'understanding-pcos',
    title: 'Understanding PCOS',
    readTime: '5 min read',
    imageUrl: 'https://images.pexels.com/photos/7089394/pexels-photo-7089394.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'PCOS',
    excerpt: 'What is PCOS, how it affects your cycle, and the most effective ways to manage symptoms naturally.',
  },
  {
    id: 'nutrition-fertility',
    title: 'Nutrition Tips for Fertility',
    readTime: '4 min read',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Fertility',
    excerpt: 'Key nutrients and foods that support reproductive health and improve your chances of conception.',
  },
  {
    id: 'pregnancy-symptoms',
    title: 'Pregnancy Symptoms Week by Week',
    readTime: '6 min read',
    imageUrl: 'https://images.pexels.com/photos/3662622/pexels-photo-3662622.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Pregnancy',
    excerpt: 'A week-by-week guide to what your body experiences during the first trimester and how to cope.',
  },
  {
    id: 'menstrual-health',
    title: 'Tracking Your Menstrual Health',
    readTime: '3 min read',
    imageUrl: 'https://images.pexels.com/photos/5473187/pexels-photo-5473187.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Cycle',
    excerpt: 'Why tracking your cycle matters and the key patterns to watch for irregular periods.',
  },
];

// ─── Community Posts ───────────────────────────────────────────────────────

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'Tips to improve egg quality naturally?',
    author: 'Nuzhat',
    location: 'Dubai',
    timeAgo: '2h ago',
    likes: 12,
    comments: 8,
    avatarUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=128',
    topic: 'IVF',
  },
  {
    id: '2',
    title: 'IVF Success Stories — Need some positivity!',
    author: 'Heena',
    location: 'Abu Dhabi',
    timeAgo: '5h ago',
    likes: 24,
    comments: 12,
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128',
    topic: 'IVF',
  },
  {
    id: '3',
    title: 'Healthy diet during pregnancy',
    author: 'Sara',
    location: 'Qatar',
    timeAgo: '1d ago',
    likes: 18,
    comments: 6,
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=128',
    topic: 'Pregnancy',
  },
  {
    id: '4',
    title: 'Managing PCOS without medication — my journey',
    author: 'Fatima',
    location: 'Dubai',
    timeAgo: '2d ago',
    likes: 31,
    comments: 14,
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=128',
    topic: 'PCOS',
  },
  {
    id: '5',
    title: 'Breastfeeding tips for first-time moms',
    author: 'Aisha',
    location: 'Riyadh',
    timeAgo: '3d ago',
    likes: 22,
    comments: 9,
    avatarUrl: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=128',
    topic: 'Motherhood',
  },
];

// ─── Health Records ─────────────────────────────────────────────────────────

export const healthRecords: HealthRecord[] = [
  { id: '1', type: 'Ultrasound Report', date: '15 May 2025', icon: 'file' },
  { id: '2', type: 'Blood Test',         date: '10 May 2025', icon: 'droplet' },
  { id: '3', type: 'Prescription',       date: '05 May 2025', icon: 'pill' },
];

// ─── Chat messages ─────────────────────────────────────────────────────────

export interface ChatMsg {
  id: string;
  content: string;
  sender: 'user' | 'doctor';
  time: string;
}

export const chatHistory: ChatMsg[] = [
  { id: '1', content: 'Hello Doctor, I need advice on irregular periods.', sender: 'user', time: '10:30 AM' },
  { id: '2', content: 'Hello Sara, I\'m here to help you.', sender: 'doctor', time: '10:31 AM' },
  { id: '3', content: 'I have been experiencing irregular cycles and mild acne.', sender: 'user', time: '10:32 AM' },
  { id: '4', content: 'Thank you for sharing. Let me ask you a few questions.', sender: 'doctor', time: '10:33 AM' },
];
