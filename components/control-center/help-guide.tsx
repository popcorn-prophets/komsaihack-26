import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BellRing,
  Bot,
  FileText,
  Filter,
  Globe2,
  Languages,
  LayoutDashboard,
  Map,
  MessageSquare,
  Route,
  ShieldCheck,
  Smartphone,
  Target,
  Users,
  WifiOff,
} from 'lucide-react';

type GuideStep = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
};

type Capability = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Scenario = {
  title: string;
  summary: string;
  icon: LucideIcon;
  stages: string[];
};

type OperatorNote = {
  question: string;
  answer: string;
  icon: LucideIcon;
};

const productPillars = [
  'Multi-channel intake',
  'AI-assisted triage',
  'Municipality-aware routing',
  'Resident status visibility',
  'Targeted advisories',
  'English / Filipino operations',
] as const;

const workflowSteps: GuideStep[] = [
  {
    step: '01',
    title: 'Residents report through the channel they already trust.',
    description:
      'HERMES accepts incidents from messaging apps, web surfaces, and installable mobile flows so the first report is never blocked by channel preference.',
    icon: MessageSquare,
    highlights: [
      'Telegram, Messenger, web chat, and a dedicated resident reporting page feed the same operational pipeline.',
      'The resident-facing experience is available on the web and as a PWA for faster repeat reporting in the field.',
      'Every report starts with the same goal: capture enough detail to move from first contact to verified action quickly.',
    ],
  },
  {
    step: '02',
    title: 'The HERMES assistant turns messy inputs into operational signal.',
    description:
      'The assistant improves the chatbot UX by accepting text, photos, audio, and live location while asking follow-up questions only when critical fields are missing.',
    icon: Bot,
    highlights: [
      'Incident details are normalized into type, urgency, location, narrative, and supporting media.',
      'English and Filipino can be used across intake and follow-up messaging.',
      'Responders receive cleaner reports without forcing residents through rigid forms.',
    ],
  },
  {
    step: '03',
    title:
      'HERMES routes and organizes reports for the correct operations team.',
    description:
      'Structured incidents are assigned to the right municipality or operational jurisdiction, then surfaced in a real-time feed that supports map context, sorting, filtering, and manual verification.',
    icon: Route,
    highlights: [
      'Per-municipality routing keeps local queues focused and accountable.',
      'The incident feed supports live prioritization by severity, status, area, and operational category.',
      'Map visualization and responder review work together so automation accelerates decisions without replacing human validation.',
    ],
  },
  {
    step: '04',
    title: 'Responders coordinate inside one control-center workspace.',
    description:
      'The dashboard, incident workspace, resident directory, and thread communication views give responders a single place to review, update, and act on incidents.',
    icon: LayoutDashboard,
    highlights: [
      'Operators can move from intake to dashboard oversight, incident review, and resident context without leaving the control center.',
      'Thread-based communication keeps outbound responder messages tied to the resident who reported the case.',
      'Status updates become part of the shared operational picture instead of living in separate tools.',
    ],
  },
  {
    step: '05',
    title:
      'Residents stay informed while responders broadcast or target advisories.',
    description:
      'HERMES closes the loop by letting residents see report progress, receive updates in context, and get both broad alerts and targeted advisories in the right language.',
    icon: BellRing,
    highlights: [
      'Residents can track the current state of their submitted reports instead of waiting in the dark.',
      'Broadcast advisories cover urgent public warnings, while targeted advisories focus on the right area, incident group, or resident segment.',
      'If one network degrades, operations can continue through alternate delivery surfaces without losing case context.',
    ],
  },
];

const capabilities: Capability[] = [
  {
    title: 'Improved chatbot UX',
    description:
      'Guided follow-up questions, attachment support, and clearer report confirmation before submission.',
    icon: Bot,
  },
  {
    title: 'Web chat and resident reporting page',
    description:
      'A browser-based reporting path for residents who are not using messaging apps at the moment of the incident.',
    icon: MessageSquare,
  },
  {
    title: 'Resident report and status visibility',
    description:
      'Residents can review submitted reports, see status changes, and receive case-specific updates.',
    icon: FileText,
  },
  {
    title: 'Municipality-aware routing',
    description:
      'Reports are organized by local jurisdiction so the right response team sees the right queue first.',
    icon: Route,
  },
  {
    title: 'PWA-ready field reporting',
    description:
      'Installable mobile access keeps repeat reporting and resident follow-up accessible on unstable networks.',
    icon: Smartphone,
  },
  {
    title: 'English, Filipino, and Hiligaynon support',
    description:
      'Operational messaging, intake prompts, and resident communication support multilingual response workflows.',
    icon: Languages,
  },
  {
    title: 'Real-time incident feed',
    description:
      'New incidents appear immediately in a shared operations queue instead of waiting for manual relay.',
    icon: Activity,
  },
  {
    title: 'Sorting and filtering',
    description:
      'Responders can narrow incidents by severity, status, area, and operational priority to manage surge periods.',
    icon: Filter,
  },
  {
    title: 'Map visualization',
    description:
      'Every operational view is anchored to geography so field teams understand where incidents are unfolding.',
    icon: Map,
  },
  {
    title: 'Control-center dashboard',
    description:
      'Leadership and dispatch teams get a live summary of workload, trends, and active response pressure.',
    icon: LayoutDashboard,
  },
  {
    title: 'Advisory broadcasting',
    description:
      'Emergency notices can be sent quickly across resident channels when the whole population needs the same warning.',
    icon: BellRing,
  },
  {
    title: 'Advisory targeting',
    description:
      'Targeted dissemination keeps warnings relevant by municipality, incident context, or resident segment.',
    icon: Target,
  },
];

const scenarios: Scenario[] = [
  {
    title: 'Flood escalation in a low-lying barangay',
    summary:
      'Residents report rising water through chat, responders validate the cluster on the map, and targeted advisories reach the affected municipality first.',
    icon: Map,
    stages: [
      'Residents submit location-aware reports through Telegram, Messenger, web chat, or the resident reporting page.',
      'HERMES extracts location, urgency, and narrative, then groups the cases into the same municipal operations picture.',
      'Responders sort the live feed, verify the pattern, and coordinate next actions from one dashboard.',
      'Targeted flood advisories are sent to affected residents while public warnings can still be broadcast more widely.',
    ],
  },
  {
    title: 'Residential fire with rapid status updates',
    summary:
      'An initial report becomes a tracked incident, responders update progress in the control center, and the reporting household can see status changes instead of re-reporting.',
    icon: ShieldCheck,
    stages: [
      'The first report arrives with text, location, and optional photo or audio evidence.',
      'Responders validate the case, assign the incident to the right response area, and move it through operational status stages.',
      'Thread communication keeps follow-up questions tied to the original resident and incident context.',
      'Residents see progress updates while neighboring advisories are sent only where risk expands.',
    ],
  },
  {
    title: 'Weather watch to advisory campaign',
    summary:
      'The control center moves from monitoring to public warning without switching systems, using bilingual messaging and channel redundancy.',
    icon: Globe2,
    stages: [
      'The dashboard highlights rising report volume and location concentration ahead of severe weather.',
      'Responders review the map and filtered feed to determine where advisory targeting should begin.',
      'HERMES sends advisories in English or Filipino depending on resident profile and operational messaging needs.',
      'If a channel is degraded, the same advisory strategy can continue through alternate resident touchpoints and the installed PWA.',
    ],
  },
];

const operatorNotes: OperatorNote[] = [
  {
    question: 'Which intake channels should staff expect to see?',
    answer:
      'The finished HERMES model accepts Telegram, Messenger, web chat, a resident reporting page, and PWA-based mobile flows. All of them land in one incident pipeline.',
    icon: MessageSquare,
  },
  {
    question: 'How does municipality routing affect operations?',
    answer:
      'Incidents are associated with the right local jurisdiction early so queues, dashboards, and targeted advisories stay relevant to the responsible response team.',
    icon: Route,
  },
  {
    question: 'Can residents see what happened after they report?',
    answer:
      'Yes. Resident-facing views are expected to expose report status and updates, reducing duplicate follow-ups and improving trust in the response process.',
    icon: Users,
  },
  {
    question: 'How does HERMES handle multilingual communication?',
    answer:
      'English, Filipino, and Hiligaynon are treated as first-class operational languages across intake, chatbot prompts, updates, and advisories.',
    icon: Languages,
  },
  {
    question: 'What if Telegram or another network has an issue?',
    answer:
      'Operations should continue through alternate surfaces such as Messenger, web chat, the resident portal, and the PWA. Case visibility remains centralized inside HERMES.',
    icon: WifiOff,
  },
];

const quickActions = [
  {
    label: 'Open Dashboard',
    href: '/control-center',
  },
  {
    label: 'Review Incidents',
    href: '/control-center/incidents',
  },
  {
    label: 'Send Advisories',
    href: '/control-center/advisories',
  },
  {
    label: 'Browse Residents',
    href: '/control-center/residents',
  },
] as const;

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Badge variant="outline" className="gap-1 self-start">
        {eyebrow}
      </Badge>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HelpGuide() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-background via-background to-muted/30 shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.08),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.05),transparent_28%)]" />
      <div className="pointer-events-none absolute -left-20 top-40 h-48 w-48 rounded-full bg-primary/6 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-56 w-56 rounded-full bg-muted-foreground/8 blur-3xl" />

      <div className="relative flex flex-col gap-12 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="gap-1 self-start">
              <ShieldCheck className="size-3.5" />
              Responder guide
            </Badge>

            <div className="flex flex-col gap-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
                How HERMES works
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                HERMES is built as a complete disaster communication product:
                residents can report through familiar channels, AI structures
                the intake, municipal teams work from one control center, and
                residents stay informed through report status and targeted
                advisories.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {productPillars.map((pillar) => (
                <Badge key={pillar} variant="secondary" className="px-3 py-1">
                  {pillar}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="border-border/70 bg-card/80 py-0 backdrop-blur-sm">
            <CardHeader className="border-b border-border/70 py-6">
              <CardTitle className="text-xl">Operator quick start</CardTitle>
              <CardDescription>
                Use this page to orient new staff, align municipal partners, and
                explain how the full HERMES workflow should operate in the
                field.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full flex flex-col gap-5 py-6">
              <div className="f-full grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.href}
                    asChild
                    variant="outline"
                    className="text-xs flex flex-wrap justify-between"
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="How it works"
            title="Five stages of the HERMES operating model"
            description="The control center is designed to move incidents cleanly from community reporting to verified response and resident follow-through."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {workflowSteps.map((step) => (
              <Card
                key={step.step}
                className="relative overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/20 py-0"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary/70 to-transparent" />
                <CardHeader className="gap-4 py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80">
                        <step.icon className="size-5 text-muted-foreground" />
                      </div>
                      <Badge variant="outline" className="px-2.5">
                        Step {step.step}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl leading-tight text-balance">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      {step.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {step.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/70" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 border-t border-border/70 pt-12">
          <SectionHeader
            eyebrow="Capability map"
            title="What the HERMES product supports"
            description="These are the operational capabilities that complete the product vision reflected across the control center and resident-facing surfaces."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((capability) => (
              <Card
                key={capability.title}
                className="border-border/70 bg-card/80 py-0 backdrop-blur-sm"
              >
                <CardHeader className="gap-3 py-6">
                  <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                    <capability.icon className="size-4.5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">
                      {capability.title}
                    </CardTitle>
                    <CardDescription className="leading-6">
                      {capability.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 border-t border-border/70 pt-12">
          <SectionHeader
            eyebrow="Operational scenarios"
            title="How responders use HERMES during real incidents"
            description="Each scenario shows how the same platform moves between resident intake, responder coordination, and public communication."
          />

          <div className="grid gap-4 xl:grid-cols-3">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.title}
                className="border-border/70 bg-linear-to-b from-card to-muted/20 py-0"
              >
                <CardHeader className="gap-4 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80">
                      <scenario.icon className="size-5 text-muted-foreground" />
                    </div>
                    <Badge variant="outline">Scenario</Badge>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl leading-tight text-balance">
                      {scenario.title}
                    </CardTitle>
                    <CardDescription className="leading-6">
                      {scenario.summary}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ol className="space-y-3">
                    {scenario.stages.map((stage, index) => (
                      <li key={stage} className="flex gap-3 text-sm leading-6">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{stage}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 border-t border-border/70 pt-12">
          <SectionHeader
            eyebrow="Operator notes"
            title="Common questions when rolling HERMES out to teams"
            description="Use these notes when training staff, aligning partner agencies, or explaining why the product is designed around one shared operational picture."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {operatorNotes.map((note) => (
              <Card
                key={note.question}
                className="border-border/70 bg-card/80 py-0 backdrop-blur-sm"
              >
                <CardHeader className="gap-3 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
                      <note.icon className="size-4.5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {note.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {note.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
