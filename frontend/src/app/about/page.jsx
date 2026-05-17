import LottieSpotlight from '@/components/LottieSpotlight';

export default function AboutPage() {
  return (
    <div
      className="min-h-screen pt-16 pb-16 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'var(--accent-subtle)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'var(--secondary-subtle)' }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="section-label mb-2 sm:mb-4">Our DNA</h2>
            <h1
              className="text-3xl sm:text-7xl font-black tracking-tight leading-[1.1] text-3d"
              style={{ color: 'var(--fg-primary)' }}
            >
              Revolutionizing Digital Ownership.
            </h1>
            <p
              className="mt-6 text-base sm:text-xl leading-relaxed"
              style={{ color: 'var(--fg-secondary)' }}
            >
              DigitalMarket was born from a simple realization: the tools used to sell digital assets are stuck in the past.
              We built a platform that is as futuristic as the products sold on it.
            </p>
          </div>
          <LottieSpotlight
            src="/animations/market-orbit.json"
            tone="market"
            size="md"
            badge="Origin"
            title="Built for digital ownership"
            subtitle="A marketplace experience shaped around secure purchase, clear delivery, and creator control."
          />
        </div>

        <div className="mx-auto mt-12 sm:mt-24 grid max-w-2xl grid-cols-1 gap-6 sm:gap-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {[
            {
              title: 'Encrypted Delivery',
              desc: "Our proprietary local secure delivery system ensures your assets never touch public links. Everything is streamed via timed tokens.",
              accent: 'var(--accent)',
            },
            {
              title: 'Global Finance',
              desc: "From UPI in India to Credit Cards in the US and Crypto everywhere else, we've unified the world's payment stacks into one API.",
              accent: 'var(--secondary)',
            },
            {
              title: 'Creator First',
              desc: "We don't just host products; we empower brokers. Detailed analytics, instant payouts, and zero-hassle withdrawal requests.",
              accent: 'var(--success)',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass card-3d p-6 sm:p-10 rounded-[28px] sm:rounded-[32px]"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="w-2 h-10 rounded-full mb-6"
                style={{ background: item.accent }}
              />
              <h3
                className="text-xl sm:text-2xl font-black mb-2 sm:mb-4"
                style={{ color: 'var(--fg-primary)' }}
              >
                {item.title}
              </h3>
              <p
                className="leading-relaxed text-xs sm:text-sm"
                style={{ color: 'var(--fg-secondary)' }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Mission statement */}
        <div
          className="mt-16 sm:mt-32 glass p-10 sm:p-16 rounded-[40px] text-center"
          style={{ border: '1px solid var(--border-accent)' }}
        >
          <p className="section-label mb-4">Our Mission</p>
          <h2
            className="text-2xl sm:text-5xl font-black tracking-tighter mb-6 text-3d-white"
            style={{ color: 'var(--fg-primary)' }}
          >
            Empowering the Next Generation of Digital Creators.
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
            We believe that anyone with a brilliant idea deserves a world-class marketplace to sell it.
            DigitalMarket provides the tools, security, and reach to make that happen.
          </p>
        </div>
      </div>
    </div>
  );
}
