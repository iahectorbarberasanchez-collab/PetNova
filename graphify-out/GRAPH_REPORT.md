# Graph Report - .  (2026-07-15)

## Corpus Check
- 163 files · ~179,613 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 125 edges · 74 communities (15 shown, 59 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AI Marketing Claude Banner
- Claude Marketing Agents
- Skills Module
- PetCoins Guide & Mechanics
- PetCoins Guide & Mechanics (2)
- Social Feed & Friend Chat
- Supabase Database Client
- Business Plan Documents
- Supabase Database Client (2)
- QA Loop & Verification Suite
- Architecture Module
- Project Planning & Milestones
- Readme Module
- Email Templates
- Templates Module
- Icons Module
- Email Templates (2)
- Logo Module
- Next Module
- Vercel Module
- Requirements Module
- Email Templates (3)
- File Module
- Globe Module
- Window Module
- API Route: Blog
- API Route: Blog (2)
- API Route: Detect_breed
- API Route: Detect_breed (2)
- API Route: Petbot
- API Route: Petbot_tip
- Referral Program Logic
- User Authentication Flow
- Blog Module
- Dashboard Module
- Dashboard Module (2)
- Dashboard Module (3)
- Layout Module
- Common Module
- Common Module (2)
- Jsonld Module
- Postcard Module
- PWA Service Worker Setup
- UI Glassmorphism Components
- System Components Module
- Core Module
- Core Module (2)
- Core Module (3)
- Weight tracking module
- Referral Program Logic (2)
- User Authentication Flow (2)
- User Authentication Flow (3)
- Referral Program Logic (3)
- Referral Program Logic (4)
- Pet Wellness & Health
- Usehealthrecords Module
- Usepets Module
- Social Feed & Friend Chat (2)
- Useuser Module
- Supabase Database Client (3)
- Lib Module
- Lib Module (2)
- Lib Module (3)
- Lib Module (4)
- Lib Module (5)
- Lib Module (6)
- Lib Module (7)
- Lib Module (8)
- Lib Module (9)
- Lib Module (10)
- Lib Module (11)
- Lib Module (12)
- Weight tracking module (2)
- Next.js Route Middleware

## God Nodes (most connected - your core abstractions)
1. `AI Marketing Claude Banner` - 14 edges
2. `Guia Maestra de PetCoins` - 11 edges
3. `Suite Routing Logic` - 9 edges
4. `Audit Orchestration Skill` - 7 edges
5. `PetNova Lint Errors Report` - 7 edges
6. `createClient` - 5 edges
7. `PetNova Platform Specs` - 5 edges
8. `Plan de Empresa Resumen` - 5 edges
9. `Social Media Content Calendar & Generation (Skill)` - 5 edges
10. `QA Loop README` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Guia Maestra de PetCoins` --conceptually_related_to--> `Sales Funnel Skill`  [INFERRED]
  docs/petcoins_guide.md → marketing/ai-marketing-claude/skills/market-funnel/SKILL.md
- `Marketing Score Breakdown` --references--> `Guia Maestra de PetCoins`  [EXTRACTED]
  marketing/MARKETING_AUDIT.md → docs/petcoins_guide.md
- `Plan de Empresa Modelo de Negocio` --conceptually_related_to--> `Sales Funnel Skill`  [INFERRED]
  docs/plan_de_empresa.md → marketing/ai-marketing-claude/skills/market-funnel/SKILL.md
- `PetNova Content Factory Prompts` --semantically_similar_to--> `Social Media Content Calendar & Generation (Skill)`  [INFERRED] [semantically similar]
  marketing/prompts_content_factory.md → marketing/ai-marketing-claude/skills/market-social/SKILL.md
- `Marketing Score Breakdown` --references--> `PetBot IA`  [EXTRACTED]
  marketing/MARKETING_AUDIT.md → docs/guiones_presentacion_petnova.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PetNova MVP Core Features** — docs_guiones_presentacion_petnova_elevator_pitch, docs_petcoins_guide_petcoins, docs_planificacion_proyecto_mvp [INFERRED 0.75]
- **AI Marketing Suite Subagents** — marketing_ai_marketing_claude_agents_market_content_subagent, marketing_ai_marketing_claude_agents_market_conversion_subagent, marketing_ai_marketing_claude_agents_market_competitive_subagent, marketing_ai_marketing_claude_agents_market_technical_subagent, marketing_ai_marketing_claude_agents_market_strategy_subagent [EXTRACTED 1.00]
- **Social Media and Content Marketing Toolkit** — marketing_ai_marketing_claude_skills_market_social_skill, marketing_ai_marketing_claude_templates_content_calendar, marketing_framework_1_to_10_repurposing, marketing_prompts_content_factory [INFERRED 0.85]
- **Product Launch Campaign Assets** — marketing_ai_marketing_claude_skills_market_launch_skill, marketing_ai_marketing_claude_templates_email_launch, marketing_ai_marketing_claude_templates_launch_checklist [EXTRACTED 0.95]
- **QA Loop Engine** — qa_loop_qa_prompt, qa_loop_qa_spec, qa_loop_readme, qa_loop_state_progress, qa_loop_state_qa_report, qa_loop_framework_loop_engineering [EXTRACTED 1.00]
- **Claude Code Marketing Commands** — marketing_ai_marketing_claude_banner_audit_skill, marketing_ai_marketing_claude_banner_copy_skill, marketing_ai_marketing_claude_banner_emails_skill, marketing_ai_marketing_claude_banner_social_skill, marketing_ai_marketing_claude_banner_ads_skill, marketing_ai_marketing_claude_banner_funnel_skill, marketing_ai_marketing_claude_banner_competitors_skill, marketing_ai_marketing_claude_banner_landing_skill, marketing_ai_marketing_claude_banner_launch_skill, marketing_ai_marketing_claude_banner_proposal_skill, marketing_ai_marketing_claude_banner_seo_skill, marketing_ai_marketing_claude_banner_brand_skill, marketing_ai_marketing_claude_banner_report_skill, marketing_ai_marketing_claude_banner_report_pdf_skill [EXTRACTED 1.00]

## Communities (74 total, 59 thin omitted)

### Community 0 - "AI Marketing Claude Banner"
Cohesion: 0.13
Nodes (15): AI Marketing Claude Banner, /ads command, /audit command, /brand command, /competitors command, /copy command, /emails command, /funnel command (+7 more)

### Community 1 - "Claude Marketing Agents"
Cohesion: 0.15
Nodes (13): Competitive Output Structure, Competitive Analysis Process, Competitive Analysis Subagent, Content Evaluation Process, Content Analysis Subagent, Conversion Mapping Process, Conversion Analysis Subagent, Brand & Growth Strategy Assessment (+5 more)

### Community 2 - "Skills Module"
Cohesion: 0.15
Nodes (13): Main Marketing Suite Skill, Suite Routing Logic, Suite Scoring Methodology, Ad Copy Engine, Ad Retargeting Strategy, Brand Writing Guidelines, Brand Voice Skill, Competitor Framework (+5 more)

### Community 3 - "PetCoins Guide & Mechanics"
Cohesion: 0.22
Nodes (10): Elevator Pitch for Investors, PetBot IA, PetCoins Token, Shop Proposal for Partners, Landing Page CRO Skill, 7-Point CRO Framework Detail, Marketing Quick Wins, Marketing Score Breakdown (+2 more)

### Community 4 - "PetCoins Guide & Mechanics (2)"
Cohesion: 0.20
Nodes (10): PetCoins Anti-Fraude Logica, PetCoins Burning and Utility, donation_votes Table, PetCoins Minting Rules, petcoin_transactions Table, Guia Maestra de PetCoins, Pet-stagram, profiles.pet_coins Table Column (+2 more)

### Community 5 - "Social Feed & Friend Chat"
Cohesion: 0.27
Nodes (10): analyze_page.py, generate_pdf_report.py, PDF Marketing Report Generator (Skill), Marketing Report Generator - Markdown (Skill), SEO Content Audit (Skill), Social Media Content Calendar & Generation (Skill), Content Calendar Template, 1-to-10 Repurposing Framework (+2 more)

### Community 6 - "Supabase Database Client"
Cohesion: 0.33
Nodes (9): PetNova Lint Errors Report, React Hook Sync Effect Lint Rule, dashboard/breeding/page.tsx, dashboard/friends/chat/[friendshipId]/page.tsx, dashboard/match/chat/[matchId]/page.tsx, dashboard/nutrition/page.tsx, dashboard/services/ServicesClient.tsx, components/PWAInstallPrompt.tsx (+1 more)

### Community 7 - "Business Plan Documents"
Cohesion: 0.25
Nodes (8): Plan de Empresa Financiero, Plan de Empresa Marketing, Plan de Empresa Mercado, Plan de Empresa Modelo de Negocio, Plan de Empresa Producto, Plan de Empresa Resumen, Sales Funnel Skill, Funnel Benchmarks Detail

### Community 8 - "Supabase Database Client (2)"
Cohesion: 0.33
Nodes (6): Google Maps Platform, n8n Workflow Automation, Next.js Framework, PetNova Platform Specs, Supabase Platform, Vercel Hosting

### Community 9 - "QA Loop & Verification Suite"
Cohesion: 0.67
Nodes (6): Loop Engineering (Ralph Pattern), QA Loop Iteration Instruction (QA_PROMPT), QA Loop Configuration Specification (QA_SPEC), QA Loop README, QA Loop Progress State, QA Loop Findings Report

### Community 10 - "Architecture Module"
Cohesion: 0.67
Nodes (4): PetNova Web Architectural Guidelines, Feature-Centric Clean Architecture, Contributing Guidelines, PetNova Web README

### Community 11 - "Project Planning & Milestones"
Cohesion: 0.67
Nodes (3): Planificacion Arquitectura, Planificacion MVP, Planificacion Roadmap

### Community 12 - "Readme Module"
Cohesion: 0.67
Nodes (3): AI Marketing Architecture, AI Marketing Commands, AI Marketing Suite

### Community 13 - "Email Templates"
Cohesion: 0.67
Nodes (3): Product/Service Launch Playbook Generator (Skill), Product Launch Email Sequence Template, Product Launch Checklist Template

### Community 14 - "Templates Module"
Cohesion: 0.67
Nodes (3): Client Proposal Generator for Marketing Services (Skill), Client Marketing Proposal Template, Three-Tier Pricing Model (Good-Better-Best)

## Knowledge Gaps
- **122 isolated node(s):** `POST`, `GET`, `mapSpecies`, `POST`, `POST` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Suite Routing Logic` connect `Skills Module` to `Claude Marketing Agents`, `PetCoins Guide & Mechanics`, `Business Plan Documents`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Sales Funnel Skill` connect `Business Plan Documents` to `Skills Module`, `PetCoins Guide & Mechanics (2)`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Guia Maestra de PetCoins` connect `PetCoins Guide & Mechanics (2)` to `PetCoins Guide & Mechanics`, `Business Plan Documents`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `POST`, `GET`, `mapSpecies` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Marketing Claude Banner` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._