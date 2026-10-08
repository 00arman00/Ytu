/**
 * Realistic CRM seed — replaces the hardcoded DEMO_* arrays in crm-view.tsx
 * with real Prisma-backed records so the UI shows live data, not fake constants.
 *
 * Inspired by frappe/crm + oroinc/crm + fatfreecrm seed patterns.
 *
 * Usage:  bunx tsx prisma/seed-crm.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistic-looking synthetic data — names/emails/companies are fictional
const COMPANIES = [
  'TechVault Inc', 'BlueRidge Capital', 'Nova Design Studio', 'Skyline Ventures',
  'QuantumLeap', 'Oakwood Enterprises', 'Apex Logistics', 'NuWave Energy',
  'Zenith AI', 'GreenPath Solutions', 'Stellar Cloud', 'Pinecrest Partners',
  'Ironclad Studios', 'Vertex Labs', 'Harborview Media', 'Cobalt Foundry',
  'Brightside Health', 'Verdant Foods', 'Helios Robotics', 'Cedar & Co',
];

const PEOPLE = [
  ['Sarah Chen', 'sarah@techvault.io', 'CTO'],
  ['Marcus Johnson', 'marcus@blueridge.co', 'VP of Operations'],
  ['Elena Rodriguez', 'elena@novadesign.com', 'Creative Director'],
  ['David Park', 'david@skylineventures.com', 'Managing Partner'],
  ['Aisha Patel', 'aisha@quantumleap.dev', 'Head of Engineering'],
  ['James Mitchell', 'james@oakwoodent.com', 'CEO'],
  ['Lisa Wang', 'lisa@apexlogistics.com', 'COO'],
  ['Robert Fischer', 'robert@nuwaveenergy.com', 'VP Engineering'],
  ['Priya Sharma', 'priya@zenithai.co', 'Founder'],
  ['Tom Bradley', 'tom@greenpath.io', 'Director of Growth'],
  ['Naomi Carter', 'naomi@stellarcloud.io', 'VP Sales'],
  ['Daniel Kim', 'daniel@pinecrest.partners', 'Investment Lead'],
  ['Maria Santos', 'maria@ironcladstudios.com', 'Studio Head'],
  ['Ahmed Hassan', 'ahmed@vertexlabs.dev', 'CTO'],
  ['Rachel Greene', 'rachel@harborview.media', 'Editorial Director'],
  ['Carlos Mendez', 'carlos@cobaltfoundry.com', 'Operations Manager'],
  ['Sophie Laurent', 'sophie@brightside.health', 'VP Marketing'],
  ['Mike Chen', 'mike@verdantfoods.com', 'Brand Manager'],
  ['Anika Patel', 'anika@heliosrobotics.ai', 'Head of BD'],
  ['Jordan Riley', 'jordan@cedarco.com', 'Founder'],
];

const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Conference', 'Cold Email', 'Webinar', 'Partner'];
const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'unqualified', 'lost'];
const LEAD_STATUSES_WEIGHTED = [
  ...Array(20).fill('new'),
  ...Array(15).fill('contacted'),
  ...Array(10).fill('qualified'),
  ...Array(4).fill('unqualified'),
  ...Array(3).fill('lost'),
];

const DEAL_STAGES = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const DEAL_TITLES = [
  'Enterprise SaaS License', 'Consulting Retainer', 'Platform Migration',
  'Marketing Automation Suite', 'Data Analytics Dashboard', 'Cloud Infrastructure Setup',
  'API Integration Package', 'Custom CRM Module', 'Security Audit Package',
  'AI Chatbot Deployment', 'Annual Support Contract', 'White-label Reseller Agreement',
  'Mobile App Redesign', 'SEO Retainer', 'Brand Identity Refresh',
];

const TICKET_SUBJECTS = [
  'Billing inquiry for Q3 invoice',
  'Cannot access dashboard after password reset',
  'Request: enable SSO for our domain',
  'Bug: report export to PDF shows blank page',
  'Onboarding assistance for new team members',
  'API rate limit increase request',
  'Feature request: dark mode for mobile app',
  'Integration with Slack not syncing messages',
  'Duplicate charge on credit card statement',
  'Need to upgrade plan mid-cycle',
];

const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const CAMPAIGN_NAMES = [
  ['Q4 Product Launch', 'product_launch'],
  ['Black Friday Promo 2025', 'email'],
  ['LinkedIn Thought Leadership', 'social'],
  ['SEO Content Sprint', 'content'],
  ['Webinar Series: AI for Marketing', 'webinar'],
  ['Customer Referral Program', 'referral'],
  ['Holiday Email Drip', 'email'],
  ['Brand Awareness - TikTok', 'social'],
  ['Retargeting: Abandoned Carts', 'ads'],
  ['Annual Customer Survey', 'email'],
];

const CONTENT_TITLES = [
  ['10 AI tools every marketer should know', 'blog'],
  ['How to build a CRM pipeline from scratch', 'blog'],
  ['Product launch teaser video', 'video'],
  ['Black Friday discount announcement', 'social'],
  ['LinkedIn carousel: 5 SaaS metrics that matter', 'social'],
  ['Webinar replay: AI marketing automation', 'video'],
  ['Case study: How TechVault scaled to 1M users', 'blog'],
  ['Quarterly newsletter — Q4 2025', 'email'],
  ['Instagram reel: behind the scenes', 'social'],
  ['Podcast episode 47: CRM trends', 'podcast'],
];

const CONTENT_PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Email', 'Blog', 'YouTube'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function rand(seed: number, max: number): number {
  // Stable pseudo-random based on index — same seed → same result
  const x = Math.sin(seed * 9999 + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

async function main() {
  console.log('🌱 Seeding realistic CRM data...\n');

  // Find the admin company (first CompanyUser with role=company_owner)
  const ownerLink = await prisma.companyUser.findFirst({
    where: { role: 'company_owner' },
    include: { company: true },
  });
  if (!ownerLink) throw new Error('No company_owner found — run prisma/seed.ts first');
  const companyId = ownerLink.companyId;
  const companyUserId = ownerLink.id;
  console.log(`  Using company: ${ownerLink.company.name} (${companyId})`);

  // ─── LEADS ──────────────────────────────────────────────────────────────
  console.log('\n  → Leads...');
  let created = 0;
  for (let i = 0; i < 50; i++) {
    const [name, email, _] = pick(PEOPLE, i);
    const company = pick(COMPANIES, i);
    const source = pick(SOURCES, i);
    const status = LEAD_STATUSES_WEIGHTED[rand(i, LEAD_STATUSES_WEIGHTED.length)];

    // Score: 0-100, weighted to look realistic
    let score = 30 + rand(i + 1, 60);
    if (source === 'Referral') score = Math.min(100, score + 15);
    if (source === 'LinkedIn') score = Math.min(100, score + 10);

    const lead = await prisma.lead.create({
      data: {
        name,
        email: i % 5 === 0 ? null : email, // 20% have no email
        phone: i % 4 === 0 ? `+1-555-${String(1000 + i).padStart(4, '0')}` : null,
        companyName: company,
        source,
        status,
        score,
        notes: i % 3 === 0 ? `Initial contact made on day ${i + 1}. Needs follow-up.` : null,
        assignedToId: i % 4 === 0 ? companyUserId : null,
        companyId,
        createdAt: new Date(Date.now() - (i * 86400000)), // spread over 50 days
      },
    });

    // Add a "created" activity
    await prisma.leadActivity.create({
      data: {
        type: 'created',
        content: `Lead captured via ${source}`,
        leadId: lead.id,
      },
    });

    // Some leads get extra activities
    if (i % 3 === 0) {
      await prisma.leadActivity.create({
        data: {
          type: 'note',
          content: 'Follow-up call scheduled',
          leadId: lead.id,
        },
      });
    }
    if (i % 5 === 0) {
      await prisma.leadTag.create({
        data: {
          name: pick(['enterprise', 'smb', 'startup', 'agency'], i),
          leadId: lead.id,
        },
      });
    }
    created++;
  }
  console.log(`    ✓ Created ${created} leads`);

  // ─── CONTACTS ───────────────────────────────────────────────────────────
  console.log('\n  → Contacts...');
  created = 0;
  for (let i = 0; i < 30; i++) {
    const [name, email, position] = pick(PEOPLE, i);
    const company = pick(COMPANIES, i + 5);
    await prisma.contact.create({
      data: {
        name,
        email,
        phone: `+1-555-${String(2000 + i).padStart(4, '0')}`,
        companyName: company,
        position,
        source: pick(SOURCES, i + 2),
        notes: i % 4 === 0 ? 'Met at SaaStr conference' : null,
        companyId,
        createdAt: new Date(Date.now() - (i * 3600000 * 24 * 3)),
      },
    });
    created++;
  }
  console.log(`    ✓ Created ${created} contacts`);

  // ─── DEALS ──────────────────────────────────────────────────────────────
  console.log('\n  → Deals...');
  created = 0;
  for (let i = 0; i < 25; i++) {
    const title = pick(DEAL_TITLES, i);
    const company = pick(COMPANIES, i + 3);
    const stage = pick(DEAL_STAGES, i);
    const value = 15000 + rand(i, 30) * 5000; // 15k - 165k
    const probabilityMap: Record<string, number> = {
      prospect: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0,
    };
    await prisma.deal.create({
      data: {
        name: `${title} — ${company}`,
        value,
        stage,
        probability: probabilityMap[stage],
        closeDate: new Date(Date.now() + (i * 86400000 * 3)),
        notes: i % 3 === 0 ? 'Champion: technical buyer. Next step: demo call.' : null,
        companyId,
        createdAt: new Date(Date.now() - (i * 86400000 * 2)),
      },
    });
    created++;
  }
  console.log(`    ✓ Created ${created} deals`);

  // ─── TICKETS ────────────────────────────────────────────────────────────
  console.log('\n  → Tickets...');
  created = 0;
  for (let i = 0; i < 15; i++) {
    const subject = pick(TICKET_SUBJECTS, i);
    const priority = pick(TICKET_PRIORITIES, i);
    const status = pick(TICKET_STATUSES, i + 1);
    const [name, email, _] = pick(PEOPLE, i + 2);
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description: `Reported by ${name} (${email}). Initial description from support inbox.`,
        status,
        priority,
        assignedToId: i % 3 === 0 ? companyUserId : null,
        companyId,
        createdAt: new Date(Date.now() - (i * 3600000 * 12)),
        updatedAt: new Date(Date.now() - (i * 3600000 * 6)),
      },
    });
    // Add 1-2 messages per ticket
    await prisma.ticketMessage.create({
      data: {
        content: 'Thanks for reaching out. Looking into this now.',
        ticketId: ticket.id,
      },
    });
    if (i % 2 === 0) {
      await prisma.ticketMessage.create({
        data: {
          content: 'Quick update: I can reproduce the issue. Working on a fix.',
          ticketId: ticket.id,
        },
      });
    }
    created++;
  }
  console.log(`    ✓ Created ${created} tickets`);

  // ─── CAMPAIGNS ──────────────────────────────────────────────────────────
  console.log('\n  → Campaigns...');
  created = 0;
  for (let i = 0; i < 10; i++) {
    const [name, type] = pick(CAMPAIGN_NAMES, i);
    const status = pick(['draft', 'active', 'paused', 'completed'], i);
    const budget = 5000 + rand(i, 20) * 1000;
    const reach = status === 'completed' || status === 'active' ? rand(i, 50) * 1000 : 0;
    const clicks = reach > 0 ? Math.floor(reach * (0.03 + rand(i, 5) * 0.01)) : 0;
    const conversions = clicks > 0 ? Math.floor(clicks * (0.05 + rand(i, 5) * 0.02)) : 0;
    await prisma.campaign.create({
      data: {
        name,
        type,
        status,
        budget,
        startDate: new Date(Date.now() - (i * 86400000 * 7)),
        endDate: status === 'completed' ? new Date(Date.now() - (i * 86400000 * 2)) : new Date(Date.now() + (30 * 86400000)),
        metrics: JSON.stringify({ reach, impressions: reach * 3, clicks, conversions }),
        companyId,
        createdAt: new Date(Date.now() - (i * 86400000 * 7)),
      },
    });
    created++;
  }
  console.log(`    ✓ Created ${created} campaigns`);

  // ─── CONTENT ────────────────────────────────────────────────────────────
  console.log('\n  → Content...');
  created = 0;
  for (let i = 0; i < 20; i++) {
    const [title, type] = pick(CONTENT_TITLES, i);
    const status = pick(['draft', 'scheduled', 'published', 'archived'], i);
    const platform = pick(CONTENT_PLATFORMS, i);
    const engagement = status === 'published'
      ? { likes: rand(i, 500), comments: rand(i + 1, 80), shares: rand(i + 2, 100) }
      : { likes: 0, comments: 0, shares: 0 };
    await prisma.content.create({
      data: {
        title,
        type,
        status,
        platform,
        body: i % 3 === 0
          ? `This is the body content for "${title}". It covers key talking points and CTAs.`
          : null,
        hashtags: type === 'social' ? '#marketing #ai #crm #growth' : null,
        thumbnailUrl: null,
        aiGenerated: i % 4 === 0,
        creatorId: ownerLink.userId,
        scheduledAt: status === 'scheduled' ? new Date(Date.now() + (i * 3600000 * 6)) : null,
        publishedAt: status === 'published' ? new Date(Date.now() - (i * 86400000)) : null,
        engagement: JSON.stringify(engagement),
        companyId,
        createdAt: new Date(Date.now() - (i * 86400000)),
      },
    });
    created++;
  }
  console.log(`    ✓ Created ${created} content items`);

  // ─── SEO CHALLENGES ────────────────────────────────────────────────────
  console.log('\n  → SEO Challenges...');
  const seoTargets = [
    { name: 'TechVault — Main Site', url: 'https://techvault.io', keyword: 'enterprise saas platform' },
    { name: 'Nova Design Blog', url: 'https://novadesign.com/blog', keyword: 'design portfolio examples' },
    { name: 'Zenith AI Landing', url: 'https://zenithai.co', keyword: 'ai marketing automation' },
  ];
  created = 0;
  for (let i = 0; i < seoTargets.length; i++) {
    const t = seoTargets[i];
    await prisma.seoChallenge.create({
      data: {
        name: t.name,
        websiteUrl: t.url,
        targetKeywords: t.keyword,
        duration: 60,
        status: 'active',
        currentDay: 10 + i * 5,
        score: 40 + i * 15,
        tasks: JSON.stringify([
          { day: 1, title: 'Audit current SEO', category: 'technical' },
          { day: 7, title: 'Optimize title tags', category: 'onpage' },
        ]),
        results: JSON.stringify({ organicTraffic: 1200 + i * 400, keywords: 24 + i * 8 }),
        companyId,
        createdAt: new Date(Date.now() - ((10 + i * 5) * 86400000)),
      },
    });
    created++;
  }
  console.log(`    ✓ Created ${created} SEO challenges`);

  console.log('\n✅ CRM seed complete!');
  console.log(`   Company: ${ownerLink.company.name}`);
  console.log(`   - 50 leads with activities and tags`);
  console.log(`   - 30 contacts`);
  console.log(`   - 25 deals across all pipeline stages`);
  console.log(`   - 15 support tickets with messages`);
  console.log(`   - 10 campaigns with real metrics`);
  console.log(`   - 20 content items (drafts, scheduled, published)`);
  console.log(`   - 3 active SEO challenges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
