import Link from "next/link";

// Marketing homepage — organized around the two things a customer needs to grasp
// in ten seconds: what can I buy (product lines) and how do I pay (pricing models).

const PRODUCT_LINES = [
  {
    name: "PoC Engagements",
    plain: "We prove it for you",
    body: "Tell us the decision you're stuck on — \"which of these vendors should we buy?\" We test the options side by side in our lab and hand you a signed report with the answer.",
    pay: "One flat fee. From $24,500.",
    payModel: "Flat fee",
    forWho: "For teams making a big infrastructure purchase.",
    href: "/marketplace?line=PoC+Engagements",
    tile: "01",
    tileClass: "from-[#162FB4] to-[#1C0087]",
  },
  {
    name: "Self-Service Labs",
    plain: "Try it yourself",
    body: "Ready-built labs with real hardware — AI clusters, networks, firewalls, storage. Log in and get hands-on the same day. No sales call, no setup.",
    pay: "Pay by the day. From $99/day.",
    payModel: "Usage-based",
    forWho: "For engineers who want to kick the tires first.",
    href: "/marketplace?line=Self-Service+Labs",
    tile: "02",
    tileClass: "from-[#0086EA] to-[#1C0087]",
  },
  {
    name: "ATC Cloud",
    plain: "Build your own virtual lab",
    body: "Your own virtual datacenter on our cloud. Spin up VMs, networks, and appliances from 600+ templates — or bring your own images. Snapshot it, clone it, tear it down, rebuild it.",
    pay: "Metered usage. From $0.12/vCPU-hour.",
    payModel: "Usage-based",
    forWho: "For teams that want full control without owning hardware.",
    href: "/marketplace?line=ATC+Cloud",
    tile: "03",
    tileClass: "from-[#0086EA] to-[#162FB4]",
  },
  {
    name: "Lab Hosting",
    plain: "We run your lab for you",
    body: "Outsource your entire lab to us, colocation-style. Ship us your gear — we host it, power it, secure it, and keep it running 24×7. Your engineers work in it remotely from anywhere.",
    pay: "Monthly, per rack. From $8,500/rack/month.",
    payModel: "Subscription",
    forWho: "For companies tired of running their own lab space.",
    href: "/marketplace?line=Lab+Hosting",
    tile: "04",
    tileClass: "from-[#1D1E48] to-[#162FB4]",
  },
  {
    name: "Cyber Range",
    plain: "Train your team",
    body: "Live-fire security exercises on a safe, isolated range — real attacks, real tools, zero risk to your network. Book a team event or buy year-round seats.",
    pay: "Per person or per event. From $450/seat/year.",
    payModel: "Per seat / event",
    forWho: "For security teams that practice like they play.",
    href: "/marketplace?line=Cyber+Range",
    tile: "05",
    tileClass: "from-[#FB550E] to-[#E31C79]",
  },
  {
    name: "Intelligence",
    plain: "See what actually works",
    body: "Thousands of past tests, one searchable answer: which products held up, which fell over, and how they compare head-to-head. Evidence, not opinions.",
    pay: "Annual subscription. From $60,000/year.",
    payModel: "Subscription",
    forWho: "For buyers who want the data before the demo.",
    href: "/marketplace?line=Intelligence",
    tile: "06",
    tileClass: "from-[#162FB4] to-[#1C0087]",
  },
  {
    name: "Partner Program",
    plain: "For technology vendors",
    body: "Put your products on our lab floor, in front of enterprise buyers, with independent test results to back them up. Placement, capacity, and benchmarking.",
    pay: "Annual subscription. From $85,000/year.",
    payModel: "Subscription",
    forWho: "For OEMs who want to be where decisions get made.",
    href: "/marketplace?line=Partner+Program",
    tile: "07",
    tileClass: "from-[#FB550E] to-[#EE282A]",
  },
];

const PRICING_MODELS = [
  {
    name: "Flat fee",
    simple: "One price for the whole project.",
    detail: "You see the price before you say yes. No hourly billing, no surprises.",
    example: "A $58,000 head-to-head vendor comparison.",
    href: "/marketplace?pricing=Flat+fee",
  },
  {
    name: "Usage-based",
    simple: "Pay only for what you run.",
    detail: "Rent a lab by the day, or a virtual datacenter by the vCPU-hour. Walk away whenever.",
    example: "A $189/day AI sandbox, or $0.12/vCPU-hour in ATC Cloud.",
    href: "/marketplace?pricing=Usage-based",
  },
  {
    name: "Subscription",
    simple: "One annual price, use it all year.",
    detail: "Unlimited access for your whole organization while it's active.",
    example: "$60,000/year for the full results database.",
    href: "/marketplace?pricing=Subscription",
  },
  {
    name: "Per seat / event",
    simple: "Pay per person, or per session.",
    detail: "Buy exactly as many seats or events as you need. Scale up any time.",
    example: "$450/year per Cyber Range seat.",
    href: "/marketplace?pricing=Per+seat+%2F+event",
  },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero — signature WWT radial gradient: Royal Blue spotlight fading to Navy */}
      <section
        className="rounded-2xl px-8 py-14 text-white sm:px-12"
        style={{ background: "radial-gradient(ellipse 80% 120% at 30% 20%, #162FB4 0%, #1D1E48 65%)" }}
      >
        <p className="mb-3 text-sm font-semibold text-white/80">
          World Wide Technology · Advanced Technology Center
        </p>
        <h1 className="max-w-3xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Test technology before you buy it. On our billion-dollar lab, not your network.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/80">
          Seven products. Four simple ways to pay. Every result backed by evidence and signed by an engineer.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Browse all products
          </Link>
          <Link
            href="/request/new"
            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Start a PoC request
          </Link>
        </div>
      </section>

      {/* Product lines */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-accent">What you can buy</h2>
        <p className="mt-2 text-muted">Seven product lines. Pick the one that sounds like you.</p>
        <div className="mt-8 space-y-4">
          {PRODUCT_LINES.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="group flex flex-col gap-5 rounded-xl border border-line bg-panel p-6 transition-colors hover:border-info sm:flex-row sm:items-center"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white ${p.tileClass}`}
              >
                {p.tile}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-lg font-bold group-hover:text-info">{p.plain}</span>
                  <span className="text-sm text-muted">{p.name}</span>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm text-muted">{p.body}</p>
                <p className="mt-1.5 text-xs text-muted/80">{p.forWho}</p>
              </div>
              <div className="shrink-0 sm:w-56 sm:text-right">
                <div className="text-sm font-bold">{p.pay}</div>
                <div className="mt-1 inline-block rounded-full bg-panel2 px-2.5 py-0.5 text-[11px] text-muted">
                  {p.payModel}
                </div>
                <div className="mt-2 text-sm font-semibold text-accent group-hover:underline">
                  See products →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing models */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-accent">How you pay</h2>
        <p className="mt-2 text-muted">
          Four pricing models. Every product uses exactly one — no fine print.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_MODELS.map((m) => (
            <Link
              key={m.name}
              href={m.href}
              className="group flex flex-col rounded-xl border border-line bg-panel p-6 transition-colors hover:border-info"
            >
              <div className="text-base font-bold">{m.name}</div>
              <p className="mt-2 text-sm font-medium text-ink/90">{m.simple}</p>
              <p className="mt-1.5 text-sm text-muted">{m.detail}</p>
              <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
                <span className="font-semibold">Example: </span>
                {m.example}
              </p>
              <span className="mt-3 text-sm font-semibold text-accent group-hover:underline">
                See what&apos;s priced this way →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Three steps */}
      <section className="rounded-xl border border-line bg-panel p-8">
        <h2 className="text-2xl font-bold tracking-tight text-accent">And it&apos;s this simple</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            ["1", "Pick a product", "Browse the marketplace or describe what you need in plain language."],
            ["2", "We do the work", "Real tests on real hardware in our lab — you watch progress live."],
            ["3", "You get the answer", "A signed report with evidence behind every result. Yours to keep."],
          ].map(([n, t, b]) => (
            <div key={n} className="">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-base font-bold text-white">
                {n}
              </div>
              <div className="mt-3 font-semibold">{t}</div>
              <p className="mt-1.5 text-sm text-muted">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Trusted infrastructure: 20,000+ VMs · 600+ ready-built labs · 6,000+ completed engagements · 200+
          technology vendors on the floor
        </p>
      </section>
    </div>
  );
}
