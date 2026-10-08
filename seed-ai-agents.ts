/**
 * Seeds AI agents into the database so the AI Agents view shows real data
 * instead of the hardcoded AGENT_DEFINITIONS in the view file.
 *
 * Usage:  bunx tsx prisma/seed-ai-agents.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGENTS = [
  { name: 'SEO Optimizer', type: 'seo_agent', description: 'Analyzes content and suggests SEO improvements — meta tags, headings, keywords.', category: 'Optimization' },
  { name: 'Content Writer', type: 'content_writer', description: 'Generates blog posts, social copy, and ad creatives in your brand voice.', category: 'Content' },
  { name: 'LinkedIn Curator', type: 'social_curator', description: 'Schedules and publishes LinkedIn posts; auto-engages with relevant industry content.', category: 'Social' },
  { name: 'Lead Qualifier', type: 'lead_scorer', description: 'Scores new leads based on firmographics + behavior; routes hot leads to sales.', category: 'Sales' },
  { name: 'Funnel Analyst', type: 'analytics_agent', description: 'Monitors conversion funnels; flags drop-offs; suggests A/B test hypotheses.', category: 'Analytics' },
  { name: 'Email Drip Composer', type: 'email_automation', description: 'Builds multi-step email drip campaigns; auto-personalizes subject lines.', category: 'Email' },
  { name: 'Image Generator', type: 'image_generator', description: 'Creates on-brand social graphics and ad creatives from text prompts.', category: 'Media' },
  { name: 'Strategy Advisor', type: 'strategy_advisor', description: 'Reviews weekly metrics; proposes marketing strategy pivots.', category: 'Strategy' },
  { name: 'Support Triage', type: 'support_triage', description: 'Auto-categorizes incoming tickets; suggests replies; escalates critical issues.', category: 'Messaging' },
];

async function main() {
  console.log('🤖 Seeding AI agents...');
  const owner = await prisma.companyUser.findFirst({
    where: { role: 'company_owner' },
    include: { company: true },
  });
  if (!owner) throw new Error('No company_owner found — run prisma/seed.ts first');
  const companyId = owner.companyId;

  let created = 0;
  for (const a of AGENTS) {
    // Check if already exists by name
    const existing = await prisma.aiAgent.findFirst({ where: { name: a.name, companyId } });
    if (existing) {
      console.log(`  ↺ ${a.name} already exists, skipping`);
      continue;
    }
    await prisma.aiAgent.create({
      data: {
        name: a.name,
        type: a.type,
        description: a.description,
        config: JSON.stringify({
          category: a.category,
          tasksCompleted: Math.floor(Math.random() * 50) + 5,
          model: 'balanced',
        }),
        isEnabled: created < 5, // Enable the first 5 by default
        companyId,
      },
    });
    console.log(`  ✓ ${a.name}`);
    created++;
  }

  console.log(`\n✅ AI agents seed complete: ${created} created`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
