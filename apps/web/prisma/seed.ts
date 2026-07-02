import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const leads = [
  {
    id: "lead_demo_001",
    name: "Dalbeer Designs",
    email: "yashnandanshrivastava@gmail.com", // Injected for demo
    phone: "+919741987028",
    company: "Dalbeer Designs",
    source: "LinkedIn",
    category: "E-commerce Development",
    title: "Premium Shopify Web Developer (Fashion / Lifestyle)",
    signalContext: "Seeking recommendations for an experienced Shopify web developer to build premium e-commerce websites, with a strong preference for fashion or lifestyle brands.",
    role: "Premium Shopify Web Developer",
    taskScope: "Shopify development expertise for premium stores, modern, elegant, high-converting designs.",
    mustHave: "Strong experience in fashion or lifestyle e-commerce, full builds or redesigns.",
    nicheBonus: "Attention to detail in visuals, navigation, and shopping experience.",
    buyerType: "Agency / Brand Owner",
    urgency: "high",
    winProb: "high",
    nicheTags: ["Shopify", "E-commerce", "Fashion", "Web Dev"],
    niches: ["Development", "Web Dev", "Design"],
    hashtags: ["#shopify", "#ecommerce", "#fashiontech"],
    replyProbability: 84,
    accent: "mint"
  },
  {
    id: "lead_demo_002",
    name: "Mohd Maktoob Ahmad Saad",
    email: "saadiskhan@gmail.com",
    phone: null,
    company: "Independent Client",
    source: "Upwork",
    category: "UI/UX Design",
    title: "Premium Web/UI-UX Designer for Website Redesign",
    signalContext: "Looking for a talented freelance Web Designer / UI-UX Designer to redesign and elevate the frontend of his existing website into a more premium, cinematic experience.",
    role: "Frontend UI/UX Designer",
    taskScope: "Transform existing site into something visually premium and cinematic, expand pages, collaborate with backend dev.",
    mustHave: "Modern, premium, cinematic UI/UX redesign, elevated aesthetics.",
    nicheBonus: "Cinematic typography, premium brand focus, mobile-first UX.",
    buyerType: "Founder / Solopreneur",
    urgency: "high",
    winProb: "high",
    nicheTags: ["UI/UX", "Web Design", "Frontend"],
    niches: ["Design", "Web Design"],
    hashtags: ["#uiux", "#webdesign", "#frontend"],
    replyProbability: 86,
    accent: "purple"
  },
  {
    id: "lead_demo_003",
    name: "Karan Chandane",
    email: "hr@onlinebiz.co.in",
    phone: "7666220333",
    company: "OnlineBiz",
    source: "LinkedIn Jobs",
    category: "Mobile & Web Dev",
    title: "Freelance Developers (Android, iOS, Laravel, React JS)",
    signalContext: "Actively hiring freelance and project-based developers across four key roles: Android Native, iOS Native, Laravel, and React JS Frontend.",
    role: "Native App Developer / Fullstack",
    taskScope: "Build production-ready solutions on flexible project basis across multiple stacks.",
    mustHave: "Strong Android Native, iOS Native, Laravel, or React JS experience.",
    nicheBonus: "Proven project-based delivery, independent execution.",
    buyerType: "HR / Tech Agency",
    urgency: "medium",
    winProb: "high",
    nicheTags: ["React", "Laravel", "iOS", "Android"],
    niches: ["Development", "Web Dev"],
    hashtags: ["#reactjs", "#laravel", "#mobiledev"],
    replyProbability: 82,
    accent: "cyan"
  },
  {
    id: "lead_demo_004",
    name: "Tushar Ghosh",
    email: "tushar.ghosh@astrolokal.com",
    phone: null,
    company: "Astrolokal",
    source: "LinkedIn",
    category: "Performance Marketing",
    title: "Creative Production Agency for High-Performing Ad Creatives",
    signalContext: "Actively looking for creative production agencies to create high-performing ad creatives across multiple formats (UGC, podcast-style, vox pop).",
    role: "Performance Creative Partner",
    taskScope: "High-volume authentic ad production, direct response content for Meta/Google.",
    mustHave: "Performance marketing ad experience, UGC, street interview styles.",
    nicheBonus: "Astrology/wellness/lifestyle brand experience.",
    buyerType: "Marketing Director",
    urgency: "high",
    winProb: "high",
    nicheTags: ["Video Production", "UGC", "Performance Ads"],
    niches: ["Marketing", "Design"],
    hashtags: ["#ugc", "#adcreative", "#performance"],
    replyProbability: 85,
    accent: "pink"
  },
  {
    id: "lead_demo_005",
    name: "Katreenah Hayes Wood",
    email: "khayeswood@gmail.com",
    phone: "+16235616838",
    company: "Online Learning Platform",
    source: "Upwork",
    category: "Web Development",
    title: "WordPress + MemberPress Developer for Online Learning Portal",
    signalContext: "Looking for an experienced WordPress & MemberPress freelancer to design and build a professional membership portal for an online learning platform.",
    role: "WordPress & MemberPress Specialist",
    taskScope: "Create clean member experience, organize courses/videos, design UI.",
    mustHave: "Strong WordPress and MemberPress setup experience.",
    nicheBonus: "Graphic design, email integrations, learning platform setup.",
    buyerType: "EdTech Founder",
    urgency: "high",
    winProb: "high",
    nicheTags: ["WordPress", "MemberPress", "LMS"],
    niches: ["Development", "Web Dev"],
    hashtags: ["#wordpress", "#elearning", "#memberpress"],
    replyProbability: 87,
    accent: "orange"
  },
  {
    id: "lead_demo_006",
    name: "Hardik Bothra",
    email: "bothrahardik@gmail.com",
    phone: "+918334803486",
    company: "Ethnic Wear B2B Brand",
    source: "Direct Request",
    category: "Content Production",
    title: "Kolkata-Based Content Studio for B2B Fashion Brand",
    signalContext: "Looking for a Kolkata-based content studio to create authentic, cinematic storytelling for his B2B ethnic wear brand.",
    role: "Cinematic Content Creator",
    taskScope: "Professional content production (photos+videos), documentary-style storytelling, B2B focus.",
    mustHave: "Kolkata base, authentic storytelling, no generic templates.",
    nicheBonus: "Experience shooting ethnic wear with narrative focus.",
    buyerType: "Brand Founder",
    urgency: "medium",
    winProb: "high",
    nicheTags: ["Cinematography", "B2B", "Fashion Content"],
    niches: ["Marketing", "Design"],
    hashtags: ["#fashion", "#contentstudio", "#kolkata"],
    replyProbability: 88,
    accent: "mint"
  },
  {
    id: "lead_demo_007",
    name: "Rajendra Jain",
    email: "official.chaskafoods@gmail.com",
    phone: "+918104291855",
    company: "Tska Foods",
    source: "Direct Request",
    category: "E-commerce Development",
    title: "WordPress + WooCommerce Dev for Food Brand",
    signalContext: "Looking for a skilled freelance or agency WordPress + WooCommerce developer to build a complete professional e-commerce website for a food brand.",
    role: "Food Brand E-commerce Specialist",
    taskScope: "Complete WooCommerce build, catalog setup, payment gateways, WhatsApp integration.",
    mustHave: "DTC food brand experience, mobile-first design, fast performance.",
    nicheBonus: "WhatsApp integration, Indian payment gateway experience.",
    buyerType: "DTC Founder",
    urgency: "high",
    winProb: "high",
    nicheTags: ["WooCommerce", "WordPress", "DTC"],
    niches: ["Development", "Web Dev"],
    hashtags: ["#woocommerce", "#dtc", "#wordpress"],
    replyProbability: 86,
    accent: "cyan"
  },
  {
    id: "lead_demo_008",
    name: "Resham Agarwal",
    email: "resham.agarwal01@livspace.com",
    phone: null,
    company: "Livspace",
    source: "LinkedIn",
    category: "Performance Marketing",
    title: "Performance Marketing Creative Production Agency",
    signalContext: "Looking for a creative agency to produce high-volume, performance-first Instagram-native creatives with a focus on creator-led content.",
    role: "High-Volume Performance Creative Partner",
    taskScope: "High-volume creator-first content systems, fast iteration, UGC ad formats.",
    mustHave: "Meta ad campaigns with proven performance, scalable production.",
    nicheBonus: "Creator network, scripting to editing full cycle.",
    buyerType: "Marketing Director",
    urgency: "high",
    winProb: "high",
    nicheTags: ["Performance Ads", "UGC", "Meta Ads"],
    niches: ["Marketing", "Design"],
    hashtags: ["#ugc", "#metaads", "#performance"],
    replyProbability: 89,
    accent: "purple"
  }
];

async function main() {
  console.log('Seeding initial presentation leads...')
  
  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: lead.id },
      update: {
        niches: lead.niches || [],
        phone: lead.phone,
      },
      create: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        category: lead.category,
        title: lead.title,
        signalContext: lead.signalContext,
        role: lead.role,
        taskScope: lead.taskScope,
        mustHave: lead.mustHave,
        nicheBonus: lead.nicheBonus,
        buyerType: lead.buyerType,
        urgency: lead.urgency,
        winProb: lead.winProb,
        nicheTags: lead.nicheTags,
        niches: lead.niches || [],
        hashtags: lead.hashtags,
        replyProbability: lead.replyProbability,
        accent: lead.accent,
      }
    })
  }
  
  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
