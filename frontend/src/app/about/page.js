export default function AboutPage() {
  return (
    <div className="bg-slate-950 min-h-screen pt-16 pb-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-[10px] sm:text-sm font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 sm:mb-4">Our DNA</h2>
          <h1 className="text-3xl sm:text-7xl font-black tracking-tight text-white leading-[1.1]">Revolutionizing Digital Ownership.</h1>
          <p className="mt-6 text-base sm:text-xl leading-relaxed text-slate-400">
            DigitalMarket was born from a simple realization: the tools used to sell digital assets are stuck in the past. We built a platform that is as futuristic as the products sold on it.
          </p>
        </div>
        
        <div className="mx-auto mt-12 sm:mt-24 grid max-w-2xl grid-cols-1 gap-6 sm:gap-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {[
            {
              title: "Encrypted Delivery",
              desc: "Our proprietary local secure delivery system ensures your assets never touch public links. Everything is streamed via timed tokens."
            },
            {
              title: "Global Finance",
              desc: "From UPI in India to Credit Cards in the US and Crypto everywhere else, we've unified the world's payment stacks into one API."
            },
            {
              title: "Creator First",
              desc: "We don't just host products; we empower brokers. Detailed analytics, instant payouts, and zero-hassle withdrawal requests."
            }
          ].map((item, i) => (
            <div key={i} className="glass p-6 sm:p-10 rounded-[28px] sm:rounded-[32px] border border-white/5">
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
