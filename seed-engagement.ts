/**
 * Seeds notifications, announcements, activity feed, and sample messages.
 * Run after seed-crm.ts so events have realistic context.
 *
 * Usage:  bunx tsx prisma/seed-engagement.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔔 Seeding engagement data (notifications, announcements, activity, messages)...\n');

  const owner = await prisma.companyUser.findFirst({
    where: { role: 'company_owner' },
    include: { company: true, user: true },
  });
  if (!owner) throw new Error('No company_owner found — run prisma/seed.ts first');

  const companyId = owner.companyId;
  const adminUser = owner.user;

  // Get all team members for distributing notifications + messages
  const teamMembers = await prisma.companyUser.findMany({
    where: { companyId },
    include: { user: true },
  });

  // ─── ANNOUNCEMENTS ────────────────────────────────────────────────────
  console.log('  → Announcements...');
  const announcements = [
    {
      title: 'Welcome to Kexsio MarketingOS 🎉',
      content: 'Your AI-powered marketing operating system is ready. Check the dashboard for an overview of leads, deals, and campaigns. Press Ctrl+K (or Cmd+K on Mac) anytime to open the command palette.',
      priority: 'high',
      targetRoles: 'all',
      isActive: true,
    },
    {
      title: 'Q1 2026 Marketing Goals',
      content: 'Focus on B2B SaaS companies with $5M+ ARR. Target 500 qualified leads/month and 40% improvement in organic search rankings. Use the CRM kanban to track deals through the pipeline.',
      priority: 'normal',
      targetRoles: 'all',
      isActive: true,
    },
    {
      title: 'New AI Agents Deployed',
      content: 'SEO Optimizer, Content Writer, and Lead Qualifier agents are now active. Toggle them in the AI Agents view. Each agent runs 24/7 in the background.',
      priority: 'normal',
      targetRoles: 'admin,manager',
      isActive: true,
    },
    {
      title: 'Webhook integration available',
      content: 'You can now register webhook URLs in Settings → API to receive real-time POST callbacks on events like lead.created, deal.won, ticket.created, and more. Check the API tab.',
      priority: 'low',
      targetRoles: 'all',
      isActive: false, // archived example
    },
  ];

  let created = 0;
  for (const a of announcements) {
    const exists = await prisma.announcement.findFirst({ where: { title: a.title, companyId } });
    if (exists) {
      console.log(`  ↺ "${a.title}" already exists`);
      continue;
    }
    await prisma.announcement.create({
      data: {
        ...a,
        createdBy: adminUser.id,
        companyId,
      },
    });
    console.log(`  ✓ "${a.title}"`);
    created++;
  }
  console.log(`    ${created} announcements created`);

  // ─── ACTIVITY FEED ────────────────────────────────────────────────────
  console.log('\n  → Activity feed...');
  const leads = await prisma.lead.findMany({
    where: { companyId },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });
  const deals = await prisma.deal.findMany({
    where: { companyId },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  const tickets = await prisma.ticket.findMany({
    where: { companyId },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  const activities = [
    ...leads.map((l, i) => ({
      companyId,
      userId: adminUser.id,
      type: 'lead.created',
      description: `Lead "${l.name}" from ${l.companyName || 'Unknown'} was created (source: ${l.source})`,
      resourceType: 'lead',
      resourceId: l.id,
      metadata: JSON.stringify({ name: l.name, source: l.source }),
      createdAt: new Date(Date.now() - i * 3600000 * 3),
    })),
    ...deals.map((d, i) => ({
      companyId,
      userId: adminUser.id,
      type: d.stage === 'won' ? 'deal.won' : d.stage === 'lost' ? 'deal.lost' : 'deal.created',
      description: `Deal "${d.name}" — $${d.value} (${d.stage})`,
      resourceType: 'deal',
      resourceId: d.id,
      metadata: JSON.stringify({ name: d.name, value: d.value, stage: d.stage }),
      createdAt: new Date(Date.now() - i * 3600000 * 5 - 3600000),
    })),
    ...tickets.map((t, i) => ({
      companyId,
      userId: adminUser.id,
      type: 'ticket.created',
      description: `Ticket "${t.subject}" opened (${t.priority} priority)`,
      resourceType: 'ticket',
      resourceId: t.id,
      metadata: JSON.stringify({ subject: t.subject, priority: t.priority }),
      createdAt: new Date(Date.now() - i * 3600000 * 7 - 7200000),
    })),
    {
      companyId,
      userId: adminUser.id,
      type: 'system',
      description: 'Kexsio MarketingOS platform initialized — 120 integrations, 2000 AI employees, 9 AI agents ready',
      resourceType: null,
      resourceId: null,
      metadata: JSON.stringify({ version: '1.0.0' }),
      createdAt: new Date(Date.now() - 86400000 * 7),
    },
  ];

  // Sort by createdAt desc
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  for (const a of activities) {
    // Skip duplicates — check if exists
    const exists = await prisma.activity.findFirst({
      where: { companyId, type: a.type, description: a.description },
    });
    if (exists) continue;
    await prisma.activity.create({ data: a });
  }
  console.log(`    ✓ ${activities.length} activity entries added`);

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────
  console.log('\n  → Notifications...');
  // Send a welcome notification to each team member
  for (const member of teamMembers) {
    const exists = await prisma.notification.findFirst({
      where: { userId: member.userId, type: 'system', title: 'Welcome to Kexsio MarketingOS' },
    });
    if (exists) continue;

    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: 'system',
        title: 'Welcome to Kexsio MarketingOS 👋',
        message: 'Your AI-powered marketing command center is ready. Check the dashboard to see your latest metrics.',
        link: '/dashboard',
        isRead: false,
        metadata: JSON.stringify({}),
      },
    });

    // Add a "deal.won" sample notification
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: 'deal.won',
        title: '🎉 Deal won!',
        message: 'Enterprise SaaS License — Nova Design Studio closed for $125,000',
        link: '/crm',
        isRead: false,
        metadata: JSON.stringify({ dealName: 'Enterprise SaaS License', value: 125000 }),
      },
    });

    // Add a lead notification
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: 'lead.created',
        title: 'New high-priority lead',
        message: 'Sarah Chen from TechVault Inc submitted a contact form (score: 81)',
        link: '/crm',
        isRead: false,
        metadata: JSON.stringify({ leadName: 'Sarah Chen', score: 81 }),
      },
    });
  }
  console.log(`    ✓ ${teamMembers.length * 3} notifications created`);

  // ─── MESSAGES (sample conversation threads) ───────────────────────────
  console.log('\n  → Messages...');
  if (teamMembers.length >= 2) {
    const [m1, m2] = teamMembers;
    // m2 sends a message to m1 (admin)
    const exists = await prisma.message.findFirst({
      where: { senderId: m2.userId, recipientId: m1.userId },
    });
    if (!exists) {
      await prisma.message.create({
        data: {
          content: 'Hi! I just reviewed the new Q1 campaign. Looks great — let\'s sync about the budget tomorrow.',
          senderId: m2.userId,
          recipientId: m1.userId,
          isRead: false,
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
      });
      await prisma.message.create({
        data: {
          content: 'Also, the SEO content push is performing well — 29K reach this week!',
          senderId: m2.userId,
          recipientId: m1.userId,
          isRead: false,
          createdAt: new Date(Date.now() - 3600000),
        },
      });
      // m1 reply (read)
      await prisma.message.create({
        data: {
          content: 'Thanks for the update. Let\'s schedule a call at 10am tomorrow.',
          senderId: m1.userId,
          recipientId: m2.userId,
          isRead: true,
          createdAt: new Date(Date.now() - 1800000),
        },
      });
      console.log(`    ✓ Sample thread between ${m1.user.name} and ${m2.user.name}`);
    } else {
      console.log('    ↺ Sample thread already exists');
    }
  }

  console.log('\n✅ Engagement seed complete!');
  console.log(`   Company: ${owner.company.name}`);
  console.log(`   - ${created} announcements (3 active, 1 archived)`);
  console.log(`   - ${activities.length} activity feed entries`);
  console.log(`   - ${teamMembers.length * 3} notifications across ${teamMembers.length} users`);
  console.log(`   - 1 sample message thread`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
