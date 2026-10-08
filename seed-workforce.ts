import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== NAME DATA ====================
const FIRST_NAMES = [
  'James','Emma','Liam','Olivia','Noah','Ava','Ethan','Sophia','Mason','Isabella',
  'William','Mia','Alexander','Charlotte','Benjamin','Amelia','Lucas','Harper','Henry','Evelyn',
  'Daniel','Abigail','Michael','Emily','Sebastian','Elizabeth','Jack','Sofia','Aiden','Avery',
  'Owen','Ella','Samuel','Scarlett','Ryan','Grace','Nathan','Lily','Caleb','Chloe',
  'Marcus','Zara','Devon','Aria','Kai','Luna','Finn','Nova','Jax','Maya',
  'Adrian','Elena','Theo','Iris','Leo','Nora','Miles','Sage','Axel','Ruby',
  'Hugo','Ivy','Silas','Quinn','Felix','Wren','Jasper','Cleo','Dante','Freya',
  'Ravi','Priya','Chen','Wei','Yuki','Hana','Arjun','Ananya','Kenji','Mei',
  'Omar','Fatima','Ali','Zara','Hassan','Leila','Amir','Nadia','Yusuf','Aisha',
  'Carlos','Maria','Diego','Sofia','Pablo','Elena','Mateo','Isabella','Andres','Camila',
  'Lars','Ingrid','Sven','Astrid','Erik','Freya','Nils','Sigrid','Bjorn','Helga',
  'Dmitri','Anastasia','Ivan','Katya','Alexei','Natalia','Sergei','Olga','Viktor','Mila',
  'Kofi','Amara','Kwame','Zuri','Jabari','Nia','Chidi','Imani','Obi','Tariq'
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
  'Patel','Kim','Singh','Wang','Li','Zhang','Liu','Chen','Tanaka','Yamamoto',
  'Muhammad','Hassan','Ali','Ahmed','Khan','Sharma','Gupta','Das','Krishnan','Rao'
];

// ==================== DEPARTMENT DEFINITIONS ====================
interface DeptDef {
  name: string; code: string; level: number; parentId?: string;
  icon: string; color: string; description: string; sortOrder: number;
}

const DEPARTMENTS: DeptDef[] = [
  // Level 0 - Executive
  { name:'Executive Office', code:'EXE', level:0, icon:'Crown', color:'#f59e0b', description:'Strategic leadership and company-wide decision making', sortOrder:1 },
  { name:'Marketing', code:'MKT', level:0, icon:'Megaphone', color:'#ef4444', description:'Brand awareness, lead generation, and customer acquisition', sortOrder:2 },
  { name:'Sales', code:'SAL', level:0, icon:'DollarSign', color:'#22c55e', description:'Revenue generation and deal closing', sortOrder:3 },
  { name:'Finance', code:'FIN', level:0, icon:'Calculator', color:'#6366f1', description:'Financial planning, accounting, and compliance', sortOrder:4 },
  { name:'Engineering', code:'ENG', level:0, icon:'Code2', color:'#0ea5e9', description:'Software development and technical infrastructure', sortOrder:5 },
  { name:'Operations', code:'OPS', level:0, icon:'Settings', color:'#8b5cf6', description:'Business operations and process optimization', sortOrder:6 },
  { name:'Human Resources', code:'HR', level:0, icon:'Users', color:'#ec4899', description:'Talent acquisition, development, and employee relations', sortOrder:7 },
  { name:'Customer Experience', code:'CX', level:0, icon:'Heart', color:'#f97316', description:'Customer satisfaction, support, and success', sortOrder:8 },
  { name:'Product', code:'PRD', level:0, icon:'Package', color:'#14b8a6', description:'Product strategy, design, and lifecycle management', sortOrder:9 },
  { name:'Data & Analytics', code:'DAT', level:0, icon:'BarChart3', color:'#06b6d4', description:'Data infrastructure, analytics, and business intelligence', sortOrder:10 },
  { name:'Creative', code:'CRE', level:0, icon:'Palette', color:'#d946ef', description:'Visual design, video production, and creative assets', sortOrder:11 },
  { name:'Legal & Compliance', code:'LEG', level:0, icon:'Shield', color:'#64748b', description:'Legal affairs, regulatory compliance, and risk management', sortOrder:12 },

  // Level 1-2 - Marketing sub-departments
  { name:'Content Marketing', code:'MKT-CNT', level:2, parentId:'MKT', icon:'FileText', color:'#f87171', description:'Blog posts, articles, whitepapers, and long-form content', sortOrder:1 },
  { name:'Social Media Marketing', code:'MKT-SOC', level:2, parentId:'MKT', icon:'Share2', color:'#fb923c', description:'Social media strategy, posting, and community management', sortOrder:2 },
  { name:'SEO & SEM', code:'MKT-SEO', level:2, parentId:'MKT', icon:'Search', color:'#a3e635', description:'Search engine optimization and paid search', sortOrder:3 },
  { name:'Email Marketing', code:'MKT-EML', level:2, parentId:'MKT', icon:'Mail', color:'#fbbf24', description:'Email campaigns, automation, and deliverability', sortOrder:4 },
  { name:'Performance Marketing', code:'MKT-PER', level:2, parentId:'MKT', icon:'Target', color:'#34d399', description:'Paid advertising, ROAS optimization, and attribution', sortOrder:5 },
  { name:'Brand Strategy', code:'MKT-BRN', level:2, parentId:'MKT', icon:'Sparkles', color:'#c084fc', description:'Brand positioning, guidelines, and identity', sortOrder:6 },
  { name:'Growth Marketing', code:'MKT-GRW', level:2, parentId:'MKT', icon:'TrendingUp', color:'#2dd4bf', description:'Growth experiments, viral loops, and funnel optimization', sortOrder:7 },
  { name:'Partnership Marketing', code:'MKT-PAR', level:2, parentId:'MKT', icon:'Handshake', color:'#818cf8', description:'Co-marketing, affiliate programs, and strategic partnerships', sortOrder:8 },

  // Level 3 - Marketing teams
  { name:'Blog Writing Team', code:'MKT-CNT-BLG', level:3, parentId:'MKT-CNT', icon:'PenTool', color:'#fca5a5', description:'Blog content creation and editorial calendar', sortOrder:1 },
  { name:'Content SEO Team', code:'MKT-CNT-SEO', level:3, parentId:'MKT-CNT', icon:'FileSearch', color:'#fdba74', description:'SEO-optimized content and keyword strategy', sortOrder:2 },
  { name:'Social Content Team', code:'MKT-SOC-CNT', level:3, parentId:'MKT-SOC', icon:'ImagePlus', color:'#fde68a', description:'Social media content creation and curation', sortOrder:1 },
  { name:'Community Management', code:'MKT-SOC-COM', level:3, parentId:'MKT-SOC', icon:'MessageCircle', color:'#d9f99d', description:'Community engagement and social listening', sortOrder:2 },
  { name:'Technical SEO Team', code:'MKT-SEO-TEC', level:3, parentId:'MKT-SEO', icon:'Code', color:'#86efac', description:'Technical SEO audits and implementation', sortOrder:1 },
  { name:'Link Building Team', code:'MKT-SEO-LNK', level:3, parentId:'MKT-SEO', icon:'Link', color:'#bbf7d0', description:'Backlink acquisition and link strategy', sortOrder:2 },
  { name:'Email Design Team', code:'MKT-EML-DSN', level:3, parentId:'MKT-EML', icon:'LayoutTemplate', color:'#fcd34d', description:'Email template design and HTML production', sortOrder:1 },
  { name:'Email Automation Team', code:'MKT-EML-AUT', level:3, parentId:'MKT-EML', icon:'Zap', color:'#fef08a', description:'Drip campaigns, triggers, and automation flows', sortOrder:2 },

  // Sales sub-departments
  { name:'Inside Sales', code:'SAL-INS', level:2, parentId:'SAL', icon:'Phone', color:'#4ade80', description:'Inbound lead qualification and closing', sortOrder:1 },
  { name:'Enterprise Sales', code:'SAL-ENT', level:2, parentId:'SAL', icon:'Building2', color:'#22c55e', description:'Enterprise deal management and strategic accounts', sortOrder:2 },
  { name:'Sales Development', code:'SAL-SDR', level:2, parentId:'SAL', icon:'UserPlus', color:'#16a34a', description:'Outbound prospecting and initial outreach', sortOrder:3 },
  { name:'Sales Operations', code:'SAL-OPS', level:2, parentId:'SAL', icon:'PieChart', color:'#15803d', description:'Sales processes, tools, and analytics', sortOrder:4 },

  // Finance sub-departments
  { name:'Accounting', code:'FIN-ACC', level:2, parentId:'FIN', icon:'Receipt', color:'#818cf8', description:'Financial reporting, AP/AR, and reconciliation', sortOrder:1 },
  { name:'FP&A', code:'FIN-FPA', level:2, parentId:'FIN', icon:'TrendingUp', color:'#6366f1', description:'Financial planning, budgeting, and forecasting', sortOrder:2 },
  { name:'Treasury', code:'FIN-TRS', level:2, parentId:'FIN', icon:'Vault', color:'#4f46e5', description:'Cash management and treasury operations', sortOrder:3 },

  // Engineering sub-departments
  { name:'Frontend', code:'ENG-FE', level:2, parentId:'ENG', icon:'Monitor', color:'#38bdf8', description:'UI/UX implementation and client-side applications', sortOrder:1 },
  { name:'Backend', code:'ENG-BE', level:2, parentId:'ENG', icon:'Server', color:'#0ea5e9', description:'Server-side development and APIs', sortOrder:2 },
  { name:'DevOps', code:'ENG-OPS', level:2, parentId:'ENG', icon:'Container', color:'#0284c7', description:'Infrastructure, CI/CD, and deployment', sortOrder:3 },
  { name:'AI/ML', code:'ENG-AI', level:2, parentId:'ENG', icon:'Brain', color:'#0369a1', description:'Machine learning models and AI systems', sortOrder:4 },
  { name:'QA', code:'ENG-QA', level:2, parentId:'ENG', icon:'CheckCircle', color:'#075985', description:'Quality assurance and testing', sortOrder:5 },

  // Operations sub-departments
  { name:'Project Management', code:'OPS-PM', level:2, parentId:'OPS', icon:'Kanban', color:'#a78bfa', description:'Project planning, execution, and delivery', sortOrder:1 },
  { name:'Supply Chain', code:'OPS-SC', level:2, parentId:'OPS', icon:'Truck', color:'#8b5cf6', description:'Supply chain management and logistics', sortOrder:2 },

  // CX sub-departments
  { name:'Customer Support', code:'CX-SUP', level:2, parentId:'CX', icon:'Headphones', color:'#fb923c', description:'Customer issue resolution and support', sortOrder:1 },
  { name:'Customer Success', code:'CX-SUC', level:2, parentId:'CX', icon:'Award', color:'#f97316', description:'Onboarding, adoption, and retention', sortOrder:2 },

  // Product sub-departments
  { name:'Product Design', code:'PRD-DES', level:2, parentId:'PRD', icon:'Figma', color:'#2dd4bf', description:'UX research and product design', sortOrder:1 },
  { name:'Product Management', code:'PRD-PM', level:2, parentId:'PRD', icon:'ClipboardList', color:'#14b8a6', description:'Product roadmap and feature prioritization', sortOrder:2 },

  // Data sub-departments
  { name:'Business Intelligence', code:'DAT-BI', level:2, parentId:'DAT', icon:'LineChart', color:'#22d3ee', description:'Dashboards, reporting, and insights', sortOrder:1 },
  { name:'Data Engineering', code:'DAT-DE', level:2, parentId:'DAT', icon:'Database', color:'#06b6d4', description:'Data pipelines, warehousing, and ETL', sortOrder:2 },

  // Creative sub-departments
  { name:'Graphic Design', code:'CRE-GFX', level:2, parentId:'CRE', icon:'Paintbrush', color:'#e879f9', description:'Visual design, branding, and print assets', sortOrder:1 },
  { name:'Video Production', code:'CRE-VID', level:2, parentId:'CRE', icon:'Video', color:'#d946ef', description:'Video creation, editing, and motion graphics', sortOrder:2 },

  // HR sub-departments
  { name:'Talent Acquisition', code:'HR-TAL', level:2, parentId:'HR', icon:'UserCheck', color:'#f472b6', description:'Recruiting, interviewing, and hiring', sortOrder:1 },
  { name:'Learning & Development', code:'HR-LND', level:2, parentId:'HR', icon:'GraduationCap', color:'#ec4899', description:'Training, upskilling, and career development', sortOrder:2 },

  // Legal sub-departments
  { name:'Corporate Legal', code:'LEG-COR', level:2, parentId:'LEG', icon:'Scale', color:'#94a3b8', description:'Contracts, corporate governance, and IP', sortOrder:1 },
  { name:'Compliance', code:'LEG-CMP', level:2, parentId:'LEG', icon:'ShieldCheck', color:'#64748b', description:'Regulatory compliance and audit', sortOrder:2 },
];

// ==================== ROLE TEMPLATES BY DEPARTMENT ====================
const DEPT_ROLE_CONFIG: Record<string, {
  titles: Record<string, string[]>;
  missions: Record<string, string[]>;
  constitutions: string[];
  skills: Record<string, string[]>;
  capabilities: string[];
  tools: string[];
  kpis: string[];
}> = {
  'MKT': {
    titles: {
      executive: ['Chief Marketing Officer', 'VP of Marketing'],
      director: ['Marketing Director', 'Director of Digital Marketing'],
      manager: ['Marketing Manager', 'Digital Marketing Manager', 'Content Strategy Manager'],
      supervisor: ['Marketing Team Lead', 'Campaign Supervisor', 'Channel Lead'],
      specialist: ['SEO Specialist', 'Content Strategist', 'Social Media Specialist', 'Email Marketing Specialist', 'PPC Specialist', 'Brand Strategist', 'Growth Hacker', 'Marketing Analyst'],
      worker: ['Content Writer', 'Social Media Coordinator', 'Link Builder', 'Email Coordinator', 'Ad Operations Specialist', 'SEO Associate', 'Copywriter', 'Marketing Assistant'],
    },
    missions: {
      executive: ['Drive company-wide marketing strategy and brand positioning', 'Oversee all marketing operations and ensure ROI alignment with business goals'],
      director: ['Lead marketing department initiatives and team performance', 'Develop and execute multi-channel marketing strategies'],
      manager: ['Manage marketing campaigns and team deliverables', 'Optimize marketing channels for maximum performance'],
      supervisor: ['Coordinate daily marketing operations and team output', 'Ensure campaign quality and deadline adherence'],
      specialist: ['Execute specialized marketing tasks with expertise', 'Drive measurable results in assigned marketing domain'],
      worker: ['Support marketing operations with focused task execution', 'Produce marketing assets and coordinate activities'],
    },
    constitutions: [
      'Always maintain brand voice consistency across all channels',
      'Never publish content without proper review and approval workflow',
      'All campaigns must include measurable KPIs and tracking',
      'Customer data privacy must be respected in all marketing activities',
      'A/B test hypotheses before scaling marketing spend',
    ],
    skills: {
      specialist: ['SEO Analysis', 'Content Strategy', 'Social Media Management', 'Email Marketing', 'PPC Advertising', 'Analytics', 'Copywriting', 'Brand Management', 'Marketing Automation', 'Conversion Optimization'],
      worker: ['Content Writing', 'Social Posting', 'Data Entry', 'Scheduling', 'Basic SEO', 'Email Setup', 'Ad Copy Writing', 'Research', 'Canva', 'Spreadsheet Management'],
    },
    capabilities: ['create_campaign', 'analyze_performance', 'generate_content', 'optimize_keywords', 'manage_social_accounts', 'run_a_b_tests', 'track_roi', 'competitor_analysis'],
    tools: ['Google Analytics', 'SEMrush', 'Ahrefs', 'Hootsuite', 'Mailchimp', 'Google Ads', 'Facebook Ads Manager', 'HubSpot', 'Canva', 'Buffer', 'Sprout Social'],
    kpis: ['campaign_roi', 'lead_quality_score', 'content_engagement_rate', 'channel_growth_rate', 'conversion_rate', 'cost_per_acquisition'],
  },
  'SAL': {
    titles: {
      executive: ['Chief Revenue Officer', 'VP of Sales'],
      director: ['Sales Director', 'Director of Revenue'],
      manager: ['Sales Manager', 'Account Manager', 'Regional Sales Manager'],
      supervisor: ['Sales Team Lead', 'Territory Lead', 'SDR Supervisor'],
      specialist: ['Account Executive', 'Business Development Rep', 'Sales Engineer', 'Solutions Consultant', 'Proposal Writer'],
      worker: ['Sales Development Rep', 'Lead Qualifier', 'Sales Coordinator', 'CRM Data Entry Specialist', 'Proposal Assistant'],
    },
    missions: {
      executive: ['Maximize revenue growth and sales team performance', 'Define sales strategy and expand market reach'],
      director: ['Drive department revenue targets and sales process improvement', 'Manage key accounts and strategic partnerships'],
      manager: ['Achieve team quota and develop sales talent', 'Optimize sales pipeline and forecasting accuracy'],
      supervisor: ['Coach team members and manage daily sales activities', 'Ensure CRM hygiene and process compliance'],
      specialist: ['Close deals and build customer relationships', 'Generate qualified opportunities through expert outreach'],
      worker: ['Qualify leads and support the sales pipeline', 'Maintain CRM data and coordinate sales activities'],
    },
    constitutions: ['Never misrepresent product capabilities to close deals', 'All pricing must follow approved discount matrices', 'Customer relationships are long-term assets', 'Document all customer interactions in CRM'],
    skills: { specialist: ['Consultative Selling', 'Negotiation', 'CRM Management', 'Pipeline Management', 'Forecasting', 'Account Planning', 'Solution Design', 'Objection Handling'], worker: ['Lead Qualification', 'Cold Calling', 'Email Outreach', 'CRM Data Entry', 'Research', 'Scheduling', 'Proposal Formatting'] },
    capabilities: ['qualify_lead', 'create_proposal', 'manage_pipeline', 'forecast_revenue', 'negotiate_deal', 'update_crm', 'generate_contract'],
    tools: ['Salesforce', 'HubSpot CRM', 'LinkedIn Sales Navigator', 'Outreach', 'Calendly', 'DocuSign', 'Zoom', 'Gong', 'Slack'],
    kpis: ['quota_attainment', 'pipeline_value', 'deal_close_rate', 'average_deal_size', 'sales_cycle_length', 'customer_acquisition_cost'],
  },
  'FIN': {
    titles: { executive: ['Chief Financial Officer', 'VP of Finance'], director: ['Finance Director', 'Controller'], manager: ['Finance Manager', 'Accounting Manager'], supervisor: ['Senior Accountant', 'Finance Team Lead'], specialist: ['Financial Analyst', 'Tax Specialist', 'Audit Specialist', 'Treasury Analyst'], worker: ['Accountant', 'Bookkeeper', 'Accounts Payable Clerk', 'Payroll Specialist'] },
    missions: { executive: ['Ensure financial health and strategic capital allocation', 'Oversee compliance and financial reporting'], director: ['Manage financial operations and reporting accuracy', 'Drive cost optimization and financial planning'], manager: ['Supervise accounting operations and team performance', 'Ensure timely and accurate financial close'], supervisor: ['Review financial transactions and ensure compliance', 'Mentor junior finance staff'], specialist: ['Perform financial analysis and reporting', 'Ensure tax compliance and optimization'], worker: ['Process financial transactions accurately', 'Maintain financial records and documentation'] },
    constitutions: ['Never bypass financial controls or approval workflows', 'All financial data must be accurate and verifiable', 'Compliance with GAAP/IFRS standards is mandatory'],
    skills: { specialist: ['Financial Modeling', 'Variance Analysis', 'Tax Planning', 'Audit Management', 'Forecasting', 'Budgeting', 'Risk Assessment'], worker: ['Bookkeeping', 'Data Entry', 'Reconciliation', 'Invoice Processing', 'Payroll Processing', 'Report Generation'] },
    capabilities: ['create_financial_report', 'analyze_budget', 'process_invoice', 'run_payroll', 'forecast_revenue', 'assess_risk', 'prepare_tax_filing'],
    tools: ['QuickBooks', 'SAP', 'Excel', 'Tableau', 'Bloomberg Terminal', 'Workday', 'Oracle Financials'],
    kpis: ['budget_variance', 'days_sales_outstanding', 'financial_close_timeliness', 'audit_findings_count', 'cost_savings_achieved'],
  },
  'ENG': {
    titles: { executive: ['Chief Technology Officer', 'VP of Engineering'], director: ['Engineering Director', 'Director of Architecture'], manager: ['Engineering Manager', 'Tech Lead Manager'], supervisor: ['Senior Engineer', 'Team Lead', 'Squad Lead'], specialist: ['Software Engineer', 'ML Engineer', 'DevOps Engineer', 'Frontend Engineer', 'Backend Engineer', 'QA Engineer', 'Security Engineer'], worker: ['Junior Developer', 'QA Tester', 'DevOps Associate', 'Technical Writer', 'Code Reviewer'] },
    missions: { executive: ['Drive technology strategy and engineering excellence', 'Ensure scalable and secure technical infrastructure'], director: ['Lead engineering teams and technical architecture decisions', 'Oversee delivery quality and engineering standards'], manager: ['Deliver engineering projects on time with quality', 'Develop engineering talent and team capabilities'], supervisor: ['Guide technical decisions and mentor team members', 'Ensure code quality and best practices'], specialist: ['Build and maintain high-quality software systems', 'Solve complex technical problems with expertise'], worker: ['Support development tasks and learn from senior engineers', 'Execute testing, documentation, and development assistance'] },
    constitutions: ['All code must pass review before merging to main', 'Security vulnerabilities must be patched within SLA', 'Technical debt must be tracked and prioritized'],
    skills: { specialist: ['System Design', 'API Development', 'Database Design', 'Cloud Architecture', 'Machine Learning', 'CI/CD', 'Security Best Practices', 'Performance Optimization'], worker: ['Coding', 'Testing', 'Bug Fixing', 'Documentation', 'Git', 'Basic Debugging', 'Code Review'] },
    capabilities: ['write_code', 'review_code', 'deploy_service', 'run_tests', 'design_system', 'optimize_performance', 'fix_bug', 'create_api'],
    tools: ['GitHub', 'VS Code', 'Docker', 'Kubernetes', 'AWS', 'Jira', 'Datadog', 'Postman', 'Terraform', 'Jenkins'],
    kpis: ['deployment_frequency', 'code_quality_score', 'bug_resolution_time', 'system_uptime', 'technical_debt_ratio', 'sprint_velocity'],
  },
  'OPS': {
    titles: { executive: ['Chief Operations Officer', 'VP of Operations'], director: ['Operations Director', 'Director of Process Improvement'], manager: ['Operations Manager', 'Project Manager'], supervisor: ['Operations Team Lead', 'Scrum Master'], specialist: ['Process Analyst', 'Supply Chain Analyst', 'Operations Analyst', 'Project Coordinator'], worker: ['Operations Associate', 'Logistics Coordinator', 'Data Entry Specialist', 'Administrative Assistant'] },
    missions: { executive: ['Optimize operational efficiency and scalability', 'Drive process innovation across the organization'], director: ['Improve operational processes and reduce costs', 'Ensure operational excellence and compliance'], manager: ['Manage team operations and project delivery', 'Implement process improvements and best practices'], supervisor: ['Coordinate daily operations and team activities', 'Monitor operational KPIs and escalate issues'], specialist: ['Analyze and optimize operational processes', 'Manage specific operational functions'], worker: ['Execute operational tasks and support processes', 'Maintain records and coordinate logistics'] },
    constitutions: ['Process documentation must be kept current', 'Operational changes require impact assessment'],
    skills: { specialist: ['Process Optimization', 'Project Management', 'Supply Chain Management', 'Lean/Six Sigma', 'Risk Management', 'Vendor Management'], worker: ['Scheduling', 'Data Entry', 'Documentation', 'Coordination', 'Basic Analysis', 'Communication'] },
    capabilities: ['optimize_process', 'manage_project', 'analyze_operations', 'coordinate_logistics', 'generate_report', 'manage_vendor'],
    tools: ['Jira', 'Asana', 'Monday.com', 'Slack', 'Notion', 'Google Workspace', 'Salesforce'],
    kpis: ['process_efficiency', 'project_on_time_rate', 'cost_reduction', 'customer_satisfaction', 'employee_productivity'],
  },
  'HR': {
    titles: { executive: ['Chief People Officer', 'VP of Human Resources'], director: ['HR Director', 'Director of Talent'], manager: ['HR Manager', 'Recruiting Manager'], supervisor: ['HR Team Lead', 'Senior Recruiter'], specialist: ['HR Business Partner', 'Recruiter', 'Compensation Analyst', 'Training Specialist', 'HRIS Specialist'], worker: ['HR Coordinator', 'Recruiting Coordinator', 'Payroll Assistant', 'Onboarding Specialist'] },
    missions: { executive: ['Build and maintain a world-class workforce', 'Drive culture and employee experience'], director: ['Lead HR strategy and talent management', 'Ensure compliance with labor regulations'], manager: ['Manage HR operations and team deliverables', 'Drive talent acquisition and retention'], supervisor: ['Guide HR processes and support team members', 'Ensure HR service quality'], specialist: ['Execute specialized HR functions', 'Support employee development and relations'], worker: ['Support HR operations and administrative tasks', 'Maintain HR records and coordination'] },
    constitutions: ['Employee confidentiality must always be maintained', 'All hiring decisions must follow EEO guidelines'],
    skills: { specialist: ['Talent Acquisition', 'Compensation Analysis', 'Employee Relations', 'Training Design', 'HR Compliance', 'Performance Management'], worker: ['Resume Screening', 'Interview Scheduling', 'Onboarding', 'Data Entry', 'File Management', 'Communication'] },
    capabilities: ['screen_candidate', 'schedule_interview', 'process_payroll', 'manage_onboarding', 'create_training', 'analyze_compensation'],
    tools: ['Workday', 'Greenhouse', 'Lever', 'BambooHR', 'Gusto', 'LinkedIn Recruiter', 'Slack'],
    kpis: ['time_to_hire', 'employee_retention', 'training_completion_rate', 'employee_satisfaction_score', 'diversity_metrics'],
  },
  'CX': {
    titles: { executive: ['Chief Customer Officer', 'VP of Customer Experience'], director: ['CX Director', 'Director of Support'], manager: ['Support Manager', 'Customer Success Manager'], supervisor: ['Support Team Lead', 'Senior Support Agent'], specialist: ['Customer Success Specialist', 'Support Agent', 'Technical Support', 'Onboarding Specialist'], worker: ['Support Associate', 'Customer Service Rep', 'Ticket Router', 'Feedback Collector'] },
    missions: { executive: ['Drive customer satisfaction and loyalty', 'Build scalable customer experience systems'], director: ['Lead customer experience strategy and improvements', 'Manage support operations and quality'], manager: ['Ensure team meets SLA and satisfaction targets', 'Develop customer success processes'], supervisor: ['Guide support team and handle escalations', 'Monitor quality and coach agents'], specialist: ['Resolve customer issues with expertise', 'Drive customer adoption and success'], worker: ['Handle customer inquiries and support requests', 'Route tickets and collect feedback'] },
    constitutions: ['Customer satisfaction always takes priority', 'Escalate issues beyond authority immediately'],
    skills: { specialist: ['Problem Solving', 'Customer Communication', 'Product Expertise', 'Conflict Resolution', 'Account Management', 'Technical Troubleshooting'], worker: ['Customer Service', 'Ticket Management', 'Basic Troubleshooting', 'Communication', 'Documentation'] },
    capabilities: ['resolve_ticket', 'escalate_issue', 'create_knowledge_article', 'analyze_sentiment', 'manage_account', 'collect_feedback'],
    tools: ['Zendesk', 'Intercom', 'Freshdesk', 'Salesforce Service Cloud', 'HubSpot Service Hub'],
    kpis: ['customer_satisfaction_score', 'first_response_time', 'resolution_time', 'net_promoter_score', 'ticket_backlog', 'customer_retention'],
  },
  'PRD': {
    titles: { executive: ['Chief Product Officer', 'VP of Product'], director: ['Product Director', 'Director of Product Design'], manager: ['Product Manager', 'Senior Product Manager'], supervisor: ['Product Team Lead', 'Design Lead'], specialist: ['Product Designer', 'UX Researcher', 'UI Designer', 'Product Analyst', 'Content Strategist'], worker: ['Junior Product Manager', 'UI Developer', 'Design Intern', 'Product Coordinator'] },
    missions: { executive: ['Define product vision and strategy', 'Ensure product-market fit and growth'], director: ['Lead product development and design excellence', 'Manage product portfolio and roadmap'], manager: ['Own product roadmap and feature prioritization', 'Drive product discovery and delivery'], supervisor: ['Coordinate product team and design execution', 'Ensure design quality and consistency'], specialist: ['Design user experiences and interfaces', 'Conduct research and analyze user needs'], worker: ['Support product and design tasks', 'Create design assets and prototypes'] },
    constitutions: ['User needs drive all product decisions', 'Accessibility is not optional'],
    skills: { specialist: ['User Research', 'Interaction Design', 'Prototyping', 'A/B Testing', 'Product Analytics', 'Roadmap Planning', 'Wireframing'], worker: ['Wireframing', 'Design Tools', 'User Testing', 'Documentation', 'Prototyping'] },
    capabilities: ['design_feature', 'conduct_research', 'create_prototype', 'analyze_user_behavior', 'prioritize_backlog', 'write_specification'],
    tools: ['Figma', 'Miro', 'Jira', 'Amplitude', 'Mixpanel', 'Maze', 'Hotjar'],
    kpis: ['feature_adoption_rate', 'user_satisfaction', 'time_to_market', 'product_usage', 'design_system_adoption'],
  },
  'DAT': {
    titles: { executive: ['Chief Data Officer', 'VP of Data'], director: ['Data Director', 'Director of Analytics'], manager: ['Data Manager', 'Analytics Manager'], supervisor: ['Senior Data Analyst', 'Data Team Lead'], specialist: ['Data Analyst', 'Data Engineer', 'Data Scientist', 'BI Developer', 'ML Engineer'], worker: ['Junior Data Analyst', 'Data Entry Specialist', 'Report Builder', 'ETL Developer'] },
    missions: { executive: ['Build data-driven culture and infrastructure', 'Ensure data quality, governance, and security'], director: ['Lead data strategy and analytics capabilities', 'Oversee data platform and team development'], manager: ['Deliver data insights and analytics products', 'Manage data team and project delivery'], supervisor: ['Guide data analysis quality and methodology', 'Mentor analysts on best practices'], specialist: ['Analyze data and generate actionable insights', 'Build and maintain data pipelines'], worker: ['Support data operations and report generation', 'Process data and maintain data quality'] },
    constitutions: ['Data accuracy is non-negotiable', 'All data access must follow governance policies'],
    skills: { specialist: ['SQL', 'Python', 'Statistical Analysis', 'Data Visualization', 'Machine Learning', 'ETL', 'Data Modeling', 'A/B Testing'], worker: ['SQL Basics', 'Excel', 'Data Entry', 'Report Formatting', 'Basic Statistics', 'Dashboard Creation'] },
    capabilities: ['analyze_data', 'build_dashboard', 'create_pipeline', 'train_model', 'generate_report', 'data_quality_check'],
    tools: ['Python', 'SQL', 'Tableau', 'Power BI', 'dbt', 'Snowflake', 'Apache Spark', 'Jupyter'],
    kpis: ['data_accuracy', 'report_delivery_time', 'insight_adoption_rate', 'pipeline_reliability', 'query_performance'],
  },
  'CRE': {
    titles: { executive: ['Chief Creative Officer', 'VP of Creative'], director: ['Creative Director', 'Director of Brand Design'], manager: ['Creative Manager', 'Art Director'], supervisor: ['Senior Designer', 'Creative Team Lead'], specialist: ['Graphic Designer', 'Video Editor', 'Motion Designer', 'Copywriter', 'Creative Strategist'], worker: ['Junior Designer', 'Video Assistant', 'Production Coordinator', 'Asset Manager'] },
    missions: { executive: ['Drive creative vision and brand excellence', 'Ensure creative output aligns with business goals'], director: ['Lead creative strategy and team direction', 'Maintain brand consistency across all touchpoints'], manager: ['Manage creative projects and team output', 'Balance creative quality with business deadlines'], supervisor: ['Guide creative execution and team development', 'Review and approve creative deliverables'], specialist: ['Create compelling visual and written content', 'Execute creative projects with excellence'], worker: ['Support creative production and asset management', 'Prepare files and assist with production'] },
    constitutions: ['Brand guidelines must be followed precisely', 'All creative must be reviewed before publication'],
    skills: { specialist: ['Adobe Creative Suite', 'Video Production', 'Motion Graphics', 'Typography', 'Color Theory', 'Brand Design', 'Storytelling', 'Art Direction'], worker: ['Adobe Photoshop', 'Canva', 'Video Editing Basics', 'File Preparation', 'Asset Organization', 'Color Correction'] },
    capabilities: ['create_design', 'edit_video', 'design_brand_asset', 'write_copy', 'create_mockup', 'animate_motion'],
    tools: ['Adobe Creative Suite', 'Figma', 'Canva', 'Final Cut Pro', 'After Effects', 'Premiere Pro'],
    kpis: ['creative_output_volume', 'brand_consistency_score', 'asset_reuse_rate', 'project_delivery_time', 'stakeholder_satisfaction'],
  },
  'LEG': {
    titles: { executive: ['General Counsel', 'VP of Legal'], director: ['Legal Director', 'Director of Compliance'], manager: ['Legal Manager', 'Compliance Manager'], supervisor: ['Senior Legal Counsel', 'Compliance Team Lead'], specialist: ['Corporate Lawyer', 'Compliance Specialist', 'Contract Specialist', 'IP Lawyer', 'Risk Analyst'], worker: ['Legal Assistant', 'Paralegal', 'Compliance Coordinator', 'Document Specialist'] },
    missions: { executive: ['Protect company legal interests and ensure compliance', 'Advise on legal strategy and risk mitigation'], director: ['Lead legal operations and compliance programs', 'Manage external counsel and legal budget'], manager: ['Oversee legal processes and team performance', 'Ensure timely contract review and compliance'], supervisor: ['Guide legal research and document quality', 'Review and approve legal work'], specialist: ['Provide expert legal advice and analysis', 'Draft and review legal documents'], worker: ['Support legal operations and documentation', 'Maintain legal files and records'] },
    constitutions: ['Attorney-client privilege must be maintained', 'All regulatory requirements must be met'],
    skills: { specialist: ['Contract Law', 'Corporate Governance', 'IP Law', 'Regulatory Compliance', 'Risk Assessment', 'Legal Research', 'Negotiation'], worker: ['Document Management', 'Legal Research', 'Filing', 'Scheduling', 'Data Entry', 'Communication'] },
    capabilities: ['draft_contract', 'review_agreement', 'assess_compliance', 'conduct_legal_research', 'manage_risk', 'file_regulation'],
    tools: ['ContractPodAi', 'Ironclad', 'LegalZoom', 'Westlaw', 'SharePoint', 'Microsoft 365'],
    kpis: ['contract_turnaround_time', 'compliance_audit_score', 'legal_cost_savings', 'risk_incidents_count', 'regulatory_filing_accuracy'],
  },
  'EXE': {
    titles: { executive: ['Chief Executive Officer', 'Chief Operating Officer', 'Chief Strategy Officer', 'President', 'Managing Director'], director: ['Executive Director', 'Chief of Staff'], manager: ['Strategic Program Manager'], supervisor: ['Senior Strategist'], specialist: ['Strategy Analyst', 'Executive Assistant'], worker: ['Executive Coordinator', 'Strategy Associate'] },
    missions: { executive: ['Lead the company vision and overall strategy', 'Make high-stakes decisions that shape company direction'], director: ['Coordinate cross-functional initiatives and executive priorities', 'Support executive decision-making with analysis'], manager: ['Execute strategic programs and initiatives', 'Bridge strategy and operations'], supervisor: ['Drive strategic analysis and planning', 'Ensure program execution quality'], specialist: ['Provide strategic analysis and recommendations', 'Support executive operations and communications'], worker: ['Support strategic operations and coordination', 'Manage executive communications and scheduling'] },
    constitutions: ['Company-wide impact decisions require board awareness', 'Cross-department alignment is mandatory for major initiatives'],
    skills: { specialist: ['Strategic Planning', 'Business Analysis', 'Stakeholder Management', 'Executive Communication', 'Market Analysis', 'Financial Acumen'], worker: ['Scheduling', 'Communication', 'Research', 'Presentation Preparation', 'Meeting Coordination'] },
    capabilities: ['set_strategy', 'analyze_market', 'make_decision', 'coordinate_initiative', 'review_performance', 'communicate_vision'],
    tools: ['Bloomberg', 'McKinsey Frameworks', 'PowerPoint', 'Excel', 'Slack', 'Notion'],
    kpis: ['revenue_growth', 'market_share', 'employee_satisfaction', 'strategic_initiative_completion', 'stakeholder_satisfaction'],
  },
};

// ==================== MODEL CONFIGS ====================
const MODEL_CONFIGS = [
  { name: 'gpt-4o-mini', provider: 'openai', tier: 'fast', capabilities: '["text","function_calling"]', maxTokens: 4096, costPer1kInput: 0.00015, costPer1kOutput: 0.0006, avgLatencyMs: 300, qualityScore: 72, sortOrder: 1 },
  { name: 'claude-3-haiku', provider: 'anthropic', tier: 'fast', capabilities: '["text","function_calling"]', maxTokens: 4096, costPer1kInput: 0.00025, costPer1kOutput: 0.00125, avgLatencyMs: 250, qualityScore: 75, sortOrder: 2 },
  { name: 'gpt-4o', provider: 'openai', tier: 'balanced', capabilities: '["text","vision","function_calling"]', maxTokens: 8192, costPer1kInput: 0.005, costPer1kOutput: 0.015, avgLatencyMs: 800, qualityScore: 88, sortOrder: 3 },
  { name: 'claude-3.5-sonnet', provider: 'anthropic', tier: 'balanced', capabilities: '["text","vision","function_calling"]', maxTokens: 8192, costPer1kInput: 0.003, costPer1kOutput: 0.015, avgLatencyMs: 700, qualityScore: 90, sortOrder: 4 },
  { name: 'o1-preview', provider: 'openai', tier: 'reasoning', capabilities: '["text","reasoning","function_calling"]', maxTokens: 32768, costPer1kInput: 0.015, costPer1kOutput: 0.06, avgLatencyMs: 5000, qualityScore: 95, sortOrder: 5 },
  { name: 'claude-3.5-opus', provider: 'anthropic', tier: 'reasoning', capabilities: '["text","vision","reasoning","function_calling"]', maxTokens: 16384, costPer1kInput: 0.015, costPer1kOutput: 0.075, avgLatencyMs: 4000, qualityScore: 96, sortOrder: 6 },
  { name: 'claude-3.5-sonnet-code', provider: 'anthropic', tier: 'coding', capabilities: '["text","code_generation","function_calling"]', maxTokens: 8192, costPer1kInput: 0.003, costPer1kOutput: 0.015, avgLatencyMs: 900, qualityScore: 92, sortOrder: 7 },
  { name: 'gpt-4o-vision', provider: 'openai', tier: 'vision', capabilities: '["text","vision","image_understanding"]', maxTokens: 8192, costPer1kInput: 0.005, costPer1kOutput: 0.015, avgLatencyMs: 1200, qualityScore: 89, sortOrder: 8 },
  { name: 'text-embedding-3-small', provider: 'openai', tier: 'embedding', capabilities: '["embedding"]', maxTokens: 8192, costPer1kInput: 0.00002, costPer1kOutput: 0, avgLatencyMs: 100, qualityScore: 85, sortOrder: 9 },
  { name: 'gpt-4o-specialized', provider: 'openai', tier: 'specialized', capabilities: '["text","vision","function_calling","specialized_knowledge"]', maxTokens: 16384, costPer1kInput: 0.01, costPer1kOutput: 0.03, avgLatencyMs: 2000, qualityScore: 93, sortOrder: 10 },
];

// ==================== HELPER FUNCTIONS ====================
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getDeptRoot(code: string): string {
  return code.split('-')[0];
}

function getStatus(): string {
  const r = Math.random();
  if (r < 0.70) return 'idle';
  if (r < 0.85) return 'working';
  if (r < 0.95) return 'busy';
  return 'offline';
}

function getModelTier(level: string): string {
  switch (level) {
    case 'executive': return 'reasoning';
    case 'director': return 'reasoning';
    case 'manager': return 'balanced';
    case 'supervisor': return 'balanced';
    case 'specialist': return 'balanced';
    default: return 'fast';
  }
}

function getPreferredModel(tier: string): string {
  const models: Record<string, string> = {
    fast: 'gpt-4o-mini',
    balanced: 'claude-3.5-sonnet',
    reasoning: 'o1-preview',
    coding: 'claude-3.5-sonnet-code',
    vision: 'gpt-4o-vision',
    embedding: 'text-embedding-3-small',
    specialized: 'gpt-4o-specialized',
  };
  return models[tier] || 'gpt-4o';
}

// ==================== MAIN SEED FUNCTION ====================
async function main() {
  console.log('🚀 Starting AI Workforce Seeding...');
  console.log('=' .repeat(60));

  // 1. Get or create company
  let company = await prisma.company.findFirst({ where: { slug: 'demo' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Demo Company',
        slug: 'demo',
        industry: 'Technology',
        marketingGoals: 'Increase brand awareness, generate quality leads, improve customer retention',
        targetAudience: 'B2B SaaS companies, marketing professionals, growth teams',
      },
    });
    console.log('✅ Created demo company');
  } else {
    console.log('✅ Found existing demo company');
  }
  const companyId = company.id;

  // 2. Seed Model Configs
  console.log('\n📦 Seeding Model Configs...');
  for (const mc of MODEL_CONFIGS) {
    await prisma.modelConfig.upsert({
      where: { id: `model-${mc.name}` },
      update: {},
      create: { id: `model-${mc.name}`, ...mc, isEnabled: true, isFallback: false, config: '{}' },
    });
  }
  console.log(`✅ Seeded ${MODEL_CONFIGS.length} model configs`);

  // 3. Seed Departments
  console.log('\n🏢 Seeding Departments...');
  const deptMap: Record<string, string> = {}; // code → id
  for (const d of DEPARTMENTS) {
    const existing = await prisma.department.findFirst({ where: { code: d.code, companyId } });
    if (existing) {
      deptMap[d.code] = existing.id;
      continue;
    }
    const data: any = {
      name: d.name, code: d.code, description: d.description,
      level: d.level, sortOrder: d.sortOrder, icon: d.icon, color: d.color, companyId,
    };
    if (d.parentId && deptMap[d.parentId]) {
      data.parentId = deptMap[d.parentId];
    }
    const created = await prisma.department.create({ data });
    deptMap[d.code] = created.id;
  }
  console.log(`✅ Seeded ${Object.keys(deptMap).length} departments`);

  // 4. Seed 2,000 Employees
  console.log('\n👥 Seeding 2,000 AI Employees...');

  // Count existing
  const existingCount = await prisma.employee.count({ where: { companyId } });
  if (existingCount >= 2000) {
    console.log(`✅ Already have ${existingCount} employees, skipping`);
  } else {
    // Clear existing employees for clean seed
    if (existingCount > 0) {
      await prisma.taskExecution.deleteMany({ where: { companyId } });
      await prisma.employeeMemory.deleteMany({});
      await prisma.workforceConversation.deleteMany({ where: { companyId } });
      await prisma.employee.deleteMany({ where: { companyId } });
      console.log('🗑️  Cleared existing workforce data');
    }

    // Get all departments for distribution
    const allDepts = await prisma.department.findMany({ where: { companyId } });
    const deptCodes = allDepts.map(d => d.code);
    const levelDepts = allDepts.filter(d => d.level >= 2); // Departments at level 2+ for employee assignment

    // Employee distribution
    const levelDistribution = [
      { level: 'executive', count: 5 },
      { level: 'director', count: 20 },
      { level: 'manager', count: 80 },
      { level: 'supervisor', count: 200 },
      { level: 'specialist', count: 700 },
      { level: 'worker', count: 995 },
    ];

    // Department weight distribution (Marketing gets ~25%)
    const deptWeights: Record<string, number> = {
      'MKT': 25, 'SAL': 15, 'ENG': 12, 'DAT': 8, 'CX': 8, 'OPS': 7,
      'FIN': 5, 'PRD': 5, 'CRE': 5, 'HR': 4, 'LEG': 3, 'EXE': 3,
    };

    // Build weighted department pool
    const weightedDepts: { code: string; id: string; rootCode: string }[] = [];
    for (const d of levelDepts) {
      const root = getDeptRoot(d.code);
      const weight = deptWeights[root] || 5;
      for (let i = 0; i < weight; i++) {
        weightedDepts.push({ code: d.code, id: d.id, rootCode: root });
      }
    }

    let employeeIndex = 0;
    const BATCH_SIZE = 100;
    let batch: any[] = [];
    const reportsToMap: Record<string, string> = {}; // level → employee id (for hierarchy)
    const levelEmployeeIds: Record<string, string[]> = { executive: [], director: [], manager: [], supervisor: [], specialist: [], worker: [] };

    const usedNames = new Set<string>();
    function getUniqueName(): string {
      let name: string;
      let attempts = 0;
      do {
        name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
        attempts++;
      } while (usedNames.has(name) && attempts < 100);
      usedNames.add(name);
      return name;
    }

    for (const { level, count } of levelDistribution) {
      console.log(`  📋 Creating ${count} ${level} employees...`);

      for (let i = 0; i < count; i++) {
        employeeIndex++;
        const empNum = String(employeeIndex).padStart(4, '0');
        const name = getUniqueName();
        const status = getStatus();
        const modelTier = getModelTier(level);
        const preferredModel = getPreferredModel(modelTier);

        // Pick department based on weighted distribution
        const deptChoice = pick(weightedDepts);
        const deptId = deptChoice.id;
        const rootCode = deptChoice.rootCode;
        const config = DEPT_ROLE_CONFIG[rootCode] || DEPT_ROLE_CONFIG['EXE'];

        // Pick title, mission based on level
        const titles = config.titles[level] || config.titles.worker;
        const title = pick(titles);
        const missions = config.missions[level] || config.missions.worker;
        const mission = pick(missions);
        const constitution = pickN(config.constitutions, 2).join('. ');

        // Skills
        const skillPool = config.skills[level] || config.skills.worker || [];
        const skills = pickN(skillPool, rand(3, Math.min(8, skillPool.length)));

        // Capabilities
        const capabilities = pickN(config.capabilities, rand(2, Math.min(5, config.capabilities.length)));

        // Tools
        const tools = pickN(config.tools, rand(3, Math.min(8, config.tools.length)));

        // KPIs
        const kpiDefs = pickN(config.kpis, rand(2, Math.min(4, config.kpis.length)));
        const currentKpis: Record<string, number> = {};
        for (const kpi of kpiDefs) {
          currentKpis[kpi] = Math.round((Math.random() * 40 + 60) * 100) / 100; // 60-100
        }

        // Performance stats based on level
        const totalTasks = level === 'executive' ? rand(5, 30) :
          level === 'director' ? rand(20, 100) :
          level === 'manager' ? rand(50, 200) :
          level === 'supervisor' ? rand(100, 400) :
          level === 'specialist' ? rand(100, 600) :
          rand(50, 300);
        const successRate = level === 'executive' ? rand(92, 99) / 100 :
          level === 'director' ? rand(88, 97) / 100 :
          level === 'manager' ? rand(82, 96) / 100 :
          rand(75, 95) / 100;
        const completedTasks = Math.floor(totalTasks * successRate);
        const failedTasks = Math.floor(totalTasks * (1 - successRate));
        const avgLatency = modelTier === 'fast' ? rand(200, 800) :
          modelTier === 'balanced' ? rand(500, 2000) :
          rand(2000, 6000);

        // Authority & permissions based on level
        const authority = JSON.stringify({
          canApprove: level === 'executive' || level === 'director' || level === 'manager',
          canAuthorize: level === 'executive' || level === 'director',
          maxBudget: level === 'executive' ? 1000000 : level === 'director' ? 100000 : level === 'manager' ? 10000 : level === 'supervisor' ? 1000 : 0,
          canHire: level === 'executive' || level === 'director' || level === 'manager',
          canFire: level === 'executive' || level === 'director',
        });
        const permissions = JSON.stringify({
          readCompany: true,
          writeCompany: level === 'executive' || level === 'director',
          manageTeam: level !== 'worker' && level !== 'specialist',
          approveContent: level === 'supervisor' || level === 'manager' || level === 'director' || level === 'executive',
          publishContent: level === 'manager' || level === 'director' || level === 'executive',
          accessFinancials: ['FIN', 'EXE'].includes(rootCode),
        });

        // Collaboration & escalation
        const collabRules = JSON.stringify({
          delegationProtocol: level === 'executive' || level === 'director' ? 'full' : level === 'manager' ? 'limited' : 'none',
          consultationRequired: level === 'worker' || level === 'specialist',
          maxParallelDelegations: level === 'executive' ? 10 : level === 'director' ? 5 : level === 'manager' ? 3 : 0,
        });
        const escalationRules = JSON.stringify([
          { condition: 'task_failure', action: 'retry_then_escalate', maxRetries: 2 },
          { condition: 'budget_exceeded', action: 'immediate_escalate' },
          { condition: 'compliance_issue', action: 'immediate_escalate' },
          { condition: 'deadline_at_risk', action: 'notify_supervisor' },
        ]);
        const escalationPath = JSON.stringify(
          ['worker', 'specialist', 'supervisor', 'manager', 'director', 'executive'].slice(
            ['worker', 'specialist', 'supervisor', 'manager', 'director', 'executive'].indexOf(level) + 1
          )
        );

        const reportsToId = levelEmployeeIds[level === 'worker' ? 'supervisor' :
          level === 'specialist' ? 'supervisor' :
          level === 'supervisor' ? 'manager' :
          level === 'manager' ? 'director' :
          level === 'director' ? 'executive' : undefined]?.[rand(0, Math.max(0, (levelEmployeeIds[level === 'worker' ? 'supervisor' :
          level === 'specialist' ? 'supervisor' :
          level === 'supervisor' ? 'manager' :
          level === 'manager' ? 'director' :
          level === 'director' ? 'executive' : 'executive'] || []).length - 1))] || null;

        batch.push({
          employeeId: `EMP-${empNum}`,
          name,
          title,
          level,
          status,
          mission,
          constitution,
          authority,
          permissions,
          departmentId: deptId,
          reportsToId,
          skills: JSON.stringify(skills),
          capabilities: JSON.stringify(capabilities),
          tools: JSON.stringify(tools),
          preferredModel,
          modelTier,
          modelConfig: JSON.stringify({ temperature: level === 'executive' ? 0.3 : level === 'director' ? 0.4 : 0.7 }),
          kpis: JSON.stringify(kpiDefs.map(k => ({ name: k, target: 90, unit: '%' }))),
          currentKpis: JSON.stringify(currentKpis),
          totalTasks,
          completedTasks,
          failedTasks,
          successRate,
          avgLatencyMs: avgLatency,
          lastActiveAt: new Date(Date.now() - rand(0, 86400000 * 7)),
          canDelegate: level === 'executive' || level === 'director' || level === 'manager',
          canConsult: true,
          canReview: level === 'supervisor' || level === 'manager' || level === 'director' || level === 'executive',
          canEscalate: true,
          collaborationRules: collabRules,
          escalationRules,
          escalationPath,
          isEnabled: true,
          isAvailable: status !== 'offline',
          companyId,
        });

        // Flush batch
        if (batch.length >= BATCH_SIZE) {
          const created = await prisma.employee.createMany({ data: batch });
          // Get the created employees for hierarchy
          const createdEmps = await prisma.employee.findMany({
            where: { companyId, employeeId: { in: batch.map(b => b.employeeId) } },
            select: { id: true, employeeId: true, level: true },
          });
          for (const emp of createdEmps) {
            levelEmployeeIds[emp.level] = levelEmployeeIds[emp.level] || [];
            levelEmployeeIds[emp.level].push(emp.id);
          }
          console.log(`    ✅ Batch: ${employeeIndex - batch.length + 1}-${employeeIndex} (${created.count} created)`);
          batch = [];
        }
      }
    }

    // Flush remaining
    if (batch.length > 0) {
      const created = await prisma.employee.createMany({ data: batch });
      const createdEmps = await prisma.employee.findMany({
        where: { companyId, employeeId: { in: batch.map(b => b.employeeId) } },
        select: { id: true, employeeId: true, level: true },
      });
      for (const emp of createdEmps) {
        levelEmployeeIds[emp.level] = levelEmployeeIds[emp.level] || [];
        levelEmployeeIds[emp.level].push(emp.id);
      }
      console.log(`    ✅ Final batch: ${employeeIndex - batch.length + 1}-${employeeIndex} (${created.count} created)`);
    }

    // Update reportsToId with actual created IDs
    console.log('\n🔗 Updating employee hierarchy...');
    const allEmployees = await prisma.employee.findMany({ where: { companyId }, select: { id: true, employeeId: true, level: true, reportsToId: true } });
    const empByLevel: Record<string, typeof allEmployees> = {};
    for (const emp of allEmployees) {
      empByLevel[emp.level] = empByLevel[emp.level] || [];
      empByLevel[emp.level].push(emp);
    }

    const hierarchyUpdates: { id: string; reportsToId: string | null }[] = [];
    for (const emp of allEmployees) {
      let targetLevel: string | undefined;
      if (emp.level === 'worker') targetLevel = 'supervisor';
      else if (emp.level === 'specialist') targetLevel = 'supervisor';
      else if (emp.level === 'supervisor') targetLevel = 'manager';
      else if (emp.level === 'manager') targetLevel = 'director';
      else if (emp.level === 'director') targetLevel = 'executive';

      if (targetLevel && empByLevel[targetLevel] && empByLevel[targetLevel].length > 0) {
        // Pick a random supervisor from the target level
        const supervisor = empByLevel[targetLevel][Math.floor(Math.random() * empByLevel[targetLevel].length)];
        if (supervisor.id !== emp.id) {
          hierarchyUpdates.push({ id: emp.id, reportsToId: supervisor.id });
        }
      }
    }

    // Apply hierarchy in batches
    for (let i = 0; i < hierarchyUpdates.length; i += 100) {
      const chunk = hierarchyUpdates.slice(i, i + 100);
      await Promise.all(chunk.map(u => prisma.employee.update({ where: { id: u.id }, data: { reportsToId: u.reportsToId } })));
    }
    console.log(`✅ Updated hierarchy for ${hierarchyUpdates.length} employees`);

    const totalCount = await prisma.employee.count({ where: { companyId } });
    console.log(`✅ Total employees: ${totalCount}`);
  }

  // 5. Seed SOPs
  console.log('\n📋 Seeding SOPs...');
  const sops = [
    { name: 'Content Creation Workflow', description: 'Standard process for creating marketing content', category: 'content_creation', triggerConditions: JSON.stringify([{ taskType: 'content_creation' }]), steps: JSON.stringify([{ order: 1, title: 'Understand Brief', description: 'Analyze the content brief, target audience, and objectives' }, { order: 2, title: 'Research', description: 'Conduct topic research, keyword analysis, and competitor review' }, { order: 3, title: 'Outline', description: 'Create content outline with structure and key points' }, { order: 4, title: 'Draft', description: 'Write the content following brand guidelines and SEO best practices' }, { order: 5, title: 'Review', description: 'Self-review for quality, accuracy, and brand consistency', decisionPoints: [{ question: 'Does content meet quality standards?', yes: 'proceed', no: 'revise_draft' }] }, { order: 6, title: 'Optimize', description: 'Apply SEO optimization, internal links, and CTAs' }, { order: 7, title: 'Final Review', description: 'Supervisor/manager review and approval' }]), preconditions: JSON.stringify(['content_brief_exists', 'target_audience_defined']), applicableRoles: JSON.stringify(['specialist', 'supervisor', 'manager']), applicableTasks: JSON.stringify(['content_creation', 'blog_writing', 'social_post', 'email_copy']) },
    { name: 'Lead Qualification Process', description: 'Process for qualifying inbound and outbound leads', category: 'lead_qualification', triggerConditions: JSON.stringify([{ taskType: 'lead_qualification' }]), steps: JSON.stringify([{ order: 1, title: 'Lead Intake', description: 'Receive and log lead information' }, { order: 2, title: 'Initial Research', description: 'Research company, role, and potential fit' }, { order: 3, title: 'Score Lead', description: 'Apply lead scoring criteria (BANT or similar)' }, { order: 4, title: 'Outreach', description: 'Initiate contact via preferred channel', decisionPoints: [{ question: 'Lead responded?', yes: 'schedule_call', no: 'nurture_sequence' }] }, { order: 5, title: 'Discovery Call', description: 'Conduct discovery call to understand needs' }, { order: 6, title: 'Qualify/Disqualify', description: 'Make final qualification decision' }]), preconditions: JSON.stringify(['lead_data_available']), applicableRoles: JSON.stringify(['specialist', 'supervisor']), applicableTasks: JSON.stringify(['lead_qualification', 'prospect_outreach']) },
    { name: 'SEO Audit Procedure', description: 'Comprehensive SEO audit for websites', category: 'seo_audit', triggerConditions: JSON.stringify([{ taskType: 'seo_audit' }]), steps: JSON.stringify([{ order: 1, title: 'Technical Crawl', description: 'Run technical SEO crawl and identify issues' }, { order: 2, title: 'On-Page Analysis', description: 'Analyze on-page SEO factors' }, { order: 3, title: 'Content Audit', description: 'Review content quality and gaps' }, { order: 4, title: 'Backlink Analysis', description: 'Analyze backlink profile and opportunities' }, { order: 5, title: 'Competitor Analysis', description: 'Compare against top competitors' }, { order: 6, title: 'Report Generation', description: 'Compile findings into actionable report' }]), preconditions: JSON.stringify(['website_url_provided']), applicableRoles: JSON.stringify(['specialist', 'supervisor', 'manager']), applicableTasks: JSON.stringify(['seo_audit', 'technical_seo', 'content_audit']) },
    { name: 'Campaign Planning SOP', description: 'Planning and launching marketing campaigns', category: 'campaign_planning', triggerConditions: JSON.stringify([{ taskType: 'campaign_planning' }]), steps: JSON.stringify([{ order: 1, title: 'Objective Setting', description: 'Define SMART campaign objectives' }, { order: 2, title: 'Audience Definition', description: 'Define target audience segments' }, { order: 3, title: 'Budget Allocation', description: 'Allocate budget across channels' }, { order: 4, title: 'Creative Development', description: 'Develop campaign creative assets' }, { order: 5, title: 'Channel Setup', description: 'Configure campaign across selected channels' }, { order: 6, title: 'Launch', description: 'Launch campaign with monitoring' }, { order: 7, title: 'Monitor & Optimize', description: 'Monitor performance and optimize in real-time' }]), preconditions: JSON.stringify(['objectives_defined', 'budget_approved']), applicableRoles: JSON.stringify(['manager', 'supervisor', 'specialist']), applicableTasks: JSON.stringify(['campaign_planning', 'campaign_launch']) },
    { name: 'Customer Complaint Handling', description: 'Process for handling customer complaints', category: 'support', triggerConditions: JSON.stringify([{ taskType: 'complaint_handling' }]), steps: JSON.stringify([{ order: 1, title: 'Acknowledge', description: 'Acknowledge complaint promptly and empathetically' }, { order: 2, title: 'Classify', description: 'Classify complaint severity and category' }, { order: 3, title: 'Investigate', description: 'Investigate the root cause' }, { order: 4, title: 'Resolve', description: 'Propose and implement resolution', decisionPoints: [{ question: 'Within authority?', yes: 'implement_resolution', no: 'escalate_to_manager' }] }, { order: 5, title: 'Follow Up', description: 'Confirm resolution with customer' }, { order: 6, title: 'Document', description: 'Document for knowledge base and process improvement' }]), preconditions: JSON.stringify(['complaint_received']), applicableRoles: JSON.stringify(['worker', 'specialist', 'supervisor']), applicableTasks: JSON.stringify(['complaint_handling', 'support_ticket']) },
    { name: 'Financial Report Generation', description: 'Standard process for financial reporting', category: 'financial_reporting', triggerConditions: JSON.stringify([{ taskType: 'financial_report' }]), steps: JSON.stringify([{ order: 1, title: 'Data Collection', description: 'Gather financial data from all sources' }, { order: 2, title: 'Reconciliation', description: 'Reconcile accounts and verify accuracy' }, { order: 3, title: 'Analysis', description: 'Perform variance analysis and trend identification' }, { order: 4, title: 'Draft Report', description: 'Prepare draft financial report' }, { order: 5, title: 'Review', description: 'Management review and approval', decisionPoints: [{ question: 'Figures accurate?', yes: 'finalize', no: 'reconcile_again' }] }, { order: 6, title: 'Distribute', description: 'Distribute to stakeholders' }]), preconditions: JSON.stringify(['period_closed', 'data_available']), applicableRoles: JSON.stringify(['specialist', 'supervisor', 'manager']), applicableTasks: JSON.stringify(['financial_report', 'budget_analysis']) },
    { name: 'Code Review Process', description: 'Standard code review workflow', category: 'code_review', triggerConditions: JSON.stringify([{ taskType: 'code_review' }]), steps: JSON.stringify([{ order: 1, title: 'Submit for Review', description: 'Developer submits code for review' }, { order: 2, title: 'Automated Checks', description: 'Run linters, tests, and security scans' }, { order: 3, title: 'Peer Review', description: 'Peer reviews code for quality and best practices' }, { order: 4, title: 'Feedback', description: 'Provide constructive feedback', decisionPoints: [{ question: 'Changes needed?', yes: 'request_changes', no: 'approve' }] }, { order: 5, title: 'Address Feedback', description: 'Developer addresses review comments' }, { order: 6, title: 'Merge', description: 'Final approval and merge' }]), preconditions: JSON.stringify(['code_submitted', 'tests_passing']), applicableRoles: JSON.stringify(['supervisor', 'specialist']), applicableTasks: JSON.stringify(['code_review', 'pr_review']) },
    { name: 'Social Media Post Approval', description: 'Approval workflow for social media content', category: 'social_approval', triggerConditions: JSON.stringify([{ taskType: 'social_post_approval' }]), steps: JSON.stringify([{ order: 1, title: 'Create Post', description: 'Create social media post with copy and visuals' }, { order: 2, title: 'Brand Check', description: 'Verify brand guidelines compliance' }, { order: 3, title: 'Legal Check', description: 'Verify no legal/compliance issues' }, { order: 4, title: 'Schedule', description: 'Schedule for optimal posting time' }]), preconditions: JSON.stringify(['content_created', 'calendar_slot_available']), applicableRoles: JSON.stringify(['specialist', 'supervisor']), applicableTasks: JSON.stringify(['social_post', 'content_publishing']) },
  ];

  for (const sop of sops) {
    await prisma.sop.upsert({
      where: { id: `sop-${sop.category}` },
      update: {},
      create: { id: `sop-${sop.category}`, ...sop, companyId, isActive: true, usageCount: 0, successRate: 0, version: 1 },
    });
  }
  console.log(`✅ Seeded ${sops.length} SOPs`);

  // 6. Seed Knowledge Nodes
  console.log('\n📚 Seeding Knowledge Nodes...');
  const knowledgeNodes = [
    { title: 'Marketing Funnel Stages', content: 'The marketing funnel consists of: Awareness (top), Interest, Consideration, Intent, Evaluation, Purchase (bottom). Each stage requires different content types and messaging strategies.', summary: 'Overview of marketing funnel stages', nodeType: 'best_practice', tags: JSON.stringify(['marketing', 'funnel', 'strategy', 'stages']), category: 'Marketing Fundamentals', accessLevel: 'company' },
    { title: 'SEO Best Practices 2025', content: 'Key SEO practices: Core Web Vitals optimization, E-E-A-T content quality, mobile-first indexing, structured data markup, internal linking strategy, and topical authority building. Focus on user intent matching rather than keyword density.', summary: 'Current SEO best practices', nodeType: 'best_practice', tags: JSON.stringify(['seo', 'optimization', 'search', 'ranking']), category: 'SEO', accessLevel: 'company' },
    { title: 'Social Media Platform Specifications', content: 'Instagram: 1080x1080 (feed), 1080x1920 (stories), max 2200 chars caption. LinkedIn: 1200x627 (link), 1200x1200 (image), max 3000 chars. Twitter/X: 1600x900 (image), 280 chars. TikTok: 1080x1920, 15-60s optimal. Facebook: 1200x630 (link), max 63206 chars.', summary: 'Image sizes and text limits for social platforms', nodeType: 'reference', tags: JSON.stringify(['social', 'specs', 'dimensions', 'platforms']), category: 'Social Media', accessLevel: 'company' },
    { title: 'Email Marketing Regulations', content: 'CAN-SPAM Act requirements: Include physical address, clear subject lines, unsubscribe option. GDPR: Explicit consent required, right to erasure, data portability. CASL (Canada): Express or implied consent, unsubscribe mechanism.', summary: 'Email marketing legal requirements', nodeType: 'policy', tags: JSON.stringify(['email', 'compliance', 'legal', 'regulations']), category: 'Compliance', accessLevel: 'company' },
    { title: 'Content Marketing Framework', content: 'Effective content marketing follows the Pillar-Cluster model: Create comprehensive pillar pages for broad topics, then link to cluster content for specific long-tail keywords. This builds topical authority and improves internal linking.', summary: 'Pillar-cluster content strategy', nodeType: 'framework', tags: JSON.stringify(['content', 'strategy', 'seo', 'pillar', 'cluster']), category: 'Content Strategy', accessLevel: 'company' },
    { title: 'Customer Segmentation Methods', content: 'Key segmentation methods: Demographic (age, gender, income), Geographic (location, climate), Psychographic (lifestyle, values), Behavioral (purchase history, engagement), Firmographic (company size, industry for B2B). Use RFM analysis for behavioral segmentation.', summary: 'Methods for customer segmentation', nodeType: 'framework', tags: JSON.stringify(['marketing', 'segmentation', 'audience', 'targeting']), category: 'Marketing Fundamentals', accessLevel: 'company' },
    { title: 'A/B Testing Best Practices', content: 'Statistical significance requires minimum sample size. Test one variable at a time. Run tests for full business cycles. Use proper control groups. Document hypotheses and results. Common tests: headlines, CTAs, images, layouts, pricing, subject lines.', summary: 'How to run effective A/B tests', nodeType: 'best_practice', tags: JSON.stringify(['testing', 'ab_test', 'optimization', 'conversion']), category: 'Analytics', accessLevel: 'company' },
    { title: 'KPI Definitions for Marketing', content: 'CAC: Cost to acquire one customer. LTV: Total revenue from a customer. ROAS: Revenue per ad dollar spent. CTR: Click-through rate. CVR: Conversion rate. MQL: Marketing Qualified Lead. SQL: Sales Qualified Lead. Churn Rate: % customers lost per period. NPS: Net Promoter Score.', summary: 'Key marketing KPI definitions', nodeType: 'reference', tags: JSON.stringify(['kpi', 'metrics', 'analytics', 'definitions']), category: 'Analytics', accessLevel: 'company' },
    { title: 'Brand Voice Guidelines', content: 'Brand voice should be: Consistent across all channels, Authentic to company values, Appropriate for target audience, Differentiated from competitors. Document tone (formal/casual), vocabulary, sentence structure, and point of view.', summary: 'How to define and maintain brand voice', nodeType: 'guideline', tags: JSON.stringify(['brand', 'voice', 'tone', 'guidelines', 'messaging']), category: 'Brand', accessLevel: 'company' },
    { title: 'Google Analytics 4 Setup', content: 'GA4 uses event-based model. Key events: page_view, scroll, click, purchase, sign_up. Custom events for business-specific actions. Set up conversion events for key goals. Use audiences for remarketing. Link with Google Ads for ROAS tracking.', summary: 'GA4 configuration guide', nodeType: 'reference', tags: JSON.stringify(['analytics', 'ga4', 'google', 'tracking', 'setup']), category: 'Analytics', accessLevel: 'company' },
    { title: 'Sales Pipeline Stages', content: 'Standard pipeline: Prospect → Lead → MQL → SQL → Opportunity → Negotiation → Closed Won/Lost. Each stage has specific criteria and required actions. Average sales cycle varies by industry (B2B: 30-90 days, Enterprise: 90-365 days).', summary: 'Sales pipeline stages and criteria', nodeType: 'reference', tags: JSON.stringify(['sales', 'pipeline', 'stages', 'crm', 'process']), category: 'Sales', accessLevel: 'company' },
    { title: 'Financial Reporting Standards', content: 'Key financial statements: Balance Sheet (assets=liabilities+equity), Income Statement (revenue-expenses=profit), Cash Flow Statement. Monthly close process: bank reconciliation, accruals, prepayments, depreciation, review.', summary: 'Financial reporting basics', nodeType: 'reference', tags: JSON.stringify(['finance', 'accounting', 'reporting', 'standards']), category: 'Finance', accessLevel: 'company' },
  ];

  const mktDept = await prisma.department.findFirst({ where: { code: 'MKT', companyId } });
  const finDept = await prisma.department.findFirst({ where: { code: 'FIN', companyId } });
  const salDept = await prisma.department.findFirst({ where: { code: 'SAL', companyId } });
  const engDept = await prisma.department.findFirst({ where: { code: 'ENG', companyId } });
  const datDept = await prisma.department.findFirst({ where: { code: 'DAT', companyId } });

  for (let i = 0; i < knowledgeNodes.length; i++) {
    const kn = knowledgeNodes[i];
    const deptMap: Record<string, string | undefined> = {
      'Marketing Fundamentals': mktDept?.id,
      'Marketing': mktDept?.id,
      'SEO': mktDept?.id,
      'Social Media': mktDept?.id,
      'Content Strategy': mktDept?.id,
      'Brand': mktDept?.id,
      'Analytics': datDept?.id,
      'Compliance': finDept?.id,
      'Sales': salDept?.id,
      'Finance': finDept?.id,
      'Engineering': engDept?.id,
    };
    await prisma.knowledgeNode.upsert({
      where: { id: `kn-${i + 1}` },
      update: {},
      create: {
        id: `kn-${i + 1}`,
        ...kn,
        departmentId: deptMap[kn.category] || null,
        accessRoles: JSON.stringify(['executive', 'director', 'manager', 'supervisor', 'specialist', 'worker']),
        companyId,
      },
    });
  }
  console.log(`✅ Seeded ${knowledgeNodes.length} knowledge nodes`);

  // Final count
  const finalCount = await prisma.employee.count({ where: { companyId } });
  const deptCount = await prisma.department.count({ where: { companyId } });
  const sopCount = await prisma.sop.count({ where: { companyId } });
  const knCount = await prisma.knowledgeNode.count({ where: { companyId } });
  const modelCount = await prisma.modelConfig.count();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 AI WORKFORCE SEEDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`  👥 Employees:      ${finalCount}`);
  console.log(`  🏢 Departments:   ${deptCount}`);
  console.log(`  📋 SOPs:          ${sopCount}`);
  console.log(`  📚 Knowledge:     ${knCount}`);
  console.log(`  🤖 Models:        ${modelCount}`);
  console.log('='.repeat(60));
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
