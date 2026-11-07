'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { Cloud, Leaf, TrendingUp, Globe, ArrowRight, Zap, Coins, Link2, Sprout, Smartphone } from 'lucide-react'
import { InvoiceCard } from './invoice-card'
import { FAQItem } from './faq-item'
import { SecurityFeatures } from './security-features'
import { NavBar } from './nav-bar'
import { motion } from 'framer-motion'

export function LandingPage() {
  const whyPoints = [
    {
      title: 'Instant Payout',
      desc: 'No adjuster, no months-long claims. Payment within 48 hours.',
      icon: Zap,
    },
    {
      title: 'Lower Premiums',
      desc: 'No overhead from manual assessment. Algorithms, not bureaucracy.',
      icon: Coins,
    },
    {
      title: 'Fully Transparent',
      desc: 'Pool, contracts, and payouts all on-chain. Complete visibility.',
      icon: Link2,
    },
    {
      title: 'Built for the Season',
      desc: 'Early alerts protect your harvest. Not just payout after loss.',
      icon: Sprout,
    },
  ]

  return (
    <div id="home" className="min-h-screen bg-[#0a0f1e]">
      <NavBar />
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg-new.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/85 via-[#0a0f1e]/80 to-[#0a0f1e]/75" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <h1 className="font-display text-5xl md:text-6xl font-bold text-[#f0f4ff] leading-tight text-balance mb-4">
                  When Drought Strikes, AgroShield Pays.
                </h1>
                <p className="text-lg md:text-xl text-[#8a9bb5] text-balance leading-relaxed">
                  AgroShield delivers parametric insurance to smallholder farmers across Africa. Weather-triggered, blockchain-verified, instant payouts. Powered by 0G.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/sign-up" className="bg-[#00c896] hover:bg-[#00d9a8] text-[#0a0f1e] font-bold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-[#00c896]/40 hover:scale-105 text-center">
                  Get Covered
                </Link>
                <a href="#why-us" className="border-2 border-[#00c896] text-[#00c896] hover:bg-[#00c896]/10 font-bold px-8 py-3 rounded-full transition-all hover:scale-105 text-center">
                  Check Your Risk
                </a>
              </div>
            </motion.div>

            {/* Right: Animated Invoice Card */}
            <motion.div
              className="flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <InvoiceCard autoFlip={true} />
            </motion.div>
          </div>
        </div>


      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#0a0f1e] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-[#00c896] mb-4">Simple Steps</p>
            <div className="flex flex-col items-center mb-6">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#f0f4ff]">How It Works</h2>
              <div className="h-2 w-24 bg-[#00c896] mt-4 rounded-full" />
            </div>
            <p className="text-lg text-[#8a9bb5] mt-4">No confusion or delays. Just fast and reliable protection.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
            {/* Left side - Image with decorative component */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative h-80 lg:h-[380px] rounded-3xl overflow-hidden border-4 border-[#00c896]/20">
                <Image
                  src="/how-it-works-image.jpg"
                  alt="How AgroShield Works"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/60 via-transparent to-transparent" />
              </div>
              
              {/* Decorative component overlay - inspired by reference */}
              <div className="absolute -bottom-16 -right-8 bg-[#111827]/95 backdrop-blur border border-[#1e2d45] rounded-2xl p-6 w-72 shadow-2xl">
                <p className="text-sm text-[#8a9bb5] mb-4 font-semibold">Coverage Details</p>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-4 bg-[#00c896]/30 rounded" />
                  ))}
                </div>
              </div>

              {/* Arrow and button - inspired by reference */}
              <motion.div
                className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden lg:flex flex-col items-center"
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-[#00c896] text-2xl mb-2">→</div>
                <div className="bg-[#00c896] text-[#0a0f1e] px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">
                  Get Covered
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Steps */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                { 
                  title: 'Get covered', 
                  desc: "Pick your crop, region, and coverage size. Setup takes just minutes." 
                },
                { 
                  title: 'Weather tracked live', 
                  desc: "AI monitors rainfall 24/7 against your trigger. Instant alerts when drought strikes." 
                },
                { 
                  title: 'Early alert', 
                  desc: "Get notified before trigger activates. Time to act before loss hits." 
                },
                { 
                  title: 'Automatic payout', 
                  desc: "Payment within 48 hours. No claims, no adjusters, blockchain-verified." 
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-3 h-3 rounded-full bg-[#00c896]" />
                    {idx < 3 && <div className="w-1 h-12 bg-gradient-to-b from-[#00c896] to-[#00c896]/20 my-2" />}
                  </div>
                  <div className="pb-4">
                    <h3 className="font-display text-2xl font-bold text-[#f0f4ff]">{step.title}</h3>
                    <p className="text-base text-[#a8b8d4] leading-relaxed mt-2">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-32 bg-[#111827] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#f0f4ff] mb-4">Why Choose Us</h2>
            <div className="h-2 w-24 bg-[#00c896] mb-6 rounded-full" />
            <p className="text-lg text-[#8a9bb5]">Parametric insurance reimagined for African farmers</p>
          </motion.div>

          {/* Points radiating from center image */}
          <div className="relative max-w-7xl mx-auto">
            {/* Dashed connector lines linking the image to every point (desktop only) */}
            <svg
              className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[
                [50, 40, 17, 18],
                [50, 40, 17, 60],
                [50, 40, 83, 18],
                [50, 40, 83, 60],
                [50, 40, 50, 90],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#00c896"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  strokeOpacity={0.4}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 items-center">
              {/* Left Column */}
              <div className="flex flex-col gap-20">
                {[0, 2].map((idx) => {
                  const point = whyPoints[idx]
                  return (
                    <motion.div
                      key={idx}
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 text-white">
                        <point.icon size={30} strokeWidth={1.6} aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-[#f0f4ff] mb-3">{point.title}</h3>
                      <p className="text-[#a8b8d4] leading-relaxed text-sm md:text-base max-w-sm">{point.desc}</p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Center Image */}
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative w-96 h-96 rounded-full overflow-hidden border-4 border-[#00c896]/30 shadow-2xl flex-shrink-0">
                  <Image
                    src="/why-choose-us.jpg"
                    alt="Why Choose AgroShield"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>

              {/* Right Column */}
              <div className="flex flex-col gap-20">
                {[1, 3].map((idx) => {
                  const point = whyPoints[idx]
                  return (
                    <motion.div
                      key={idx}
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 text-white">
                        <point.icon size={30} strokeWidth={1.6} aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-[#f0f4ff] mb-3">{point.title}</h3>
                      <p className="text-[#a8b8d4] leading-relaxed text-sm md:text-base max-w-sm">{point.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* USSD Support - fifth point directly below the image */}
            <motion.div
              className="relative mt-16 flex flex-col items-center text-center lg:mt-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 text-white">
                <Smartphone size={30} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-[#f0f4ff] mb-3">USSD Support</h3>
              <p className="text-[#a8b8d4] leading-relaxed text-sm md:text-base max-w-sm">No smartphone needed. Enroll, check cover, and get payouts through a simple USSD code on any phone.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-32 bg-[#0a0f1e] border-t border-[#1e2d45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#f0f4ff] mb-4">Who It's For</h2>
            <div className="h-2 w-24 bg-[#00c896] mb-6 rounded-full" />
            <p className="text-lg text-[#8a9bb5]">Built for African farmers and impact investors</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: '/sme-owner.jpg',
                title: 'Smallholder Farmer',
                desc: "You grow the crop. You work the land. You shouldn't lose everything to drought.",
              },
              {
                image: '/supplier.jpg',
                title: 'Agricultural Cooperative',
                desc: 'Your members need protection. You need to offer it at scale, affordably.',
              },
              {
                image: '/investor.jpg',
                title: 'Impact Investor',
                desc: 'Fund agricultural resilience across Africa. Earn returns. Create climate adaptation.',
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#1e2d45] hover:border-[#00c896]/50 card-hover-glow transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 to-transparent" />
                </div>
                <div className="bg-[#1a2235] p-6">
                  <h3 className="font-display text-2xl font-bold text-[#f0f4ff] mb-2">{card.title}</h3>
                  <p className="text-[#8a9bb5]">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="bg-white py-20 text-neutral-950">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#16834e]">Our partners</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Built with trusted partners</h2>
            <p className="mt-4 text-base leading-7 text-neutral-600">AgroShield works with organisations building a more resilient future for African farmers.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <a href="https://0g.ai" target="_blank" rel="noreferrer" className="group flex min-h-44 flex-col items-center justify-center rounded-2xl bg-white p-8 transition hover:bg-neutral-50">
              <img
                src="/0g-logo.png"
                alt="0G logo"
                className="size-20 rounded-full object-cover transition group-hover:scale-105"
              />
              <span className="mt-5 text-lg font-semibold tracking-tight text-neutral-950">0G</span>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#111827] border-t border-[#1e2d45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#f0f4ff] mb-4">User Reviews</h2>
            <div className="h-2 w-24 bg-[#00c896] mb-6 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { initials: 'WM', name: 'Wanjiku M.', location: 'Nairobi, Kenya', quote: 'The 2022 drought destroyed my maize. AgroShield paid me within 2 days. I can plant again this season.' },
              { initials: 'CO', name: 'Chidi O.', location: 'Lagos, Nigeria', quote: 'As a cooperative manager, AgroShield lets me offer insurance to all members—even smallholders banks wouldn\'t touch.' },
              { initials: 'AD', name: 'Amara D.', location: 'Accra, Ghana', quote: 'I invest in African agriculture. Transparent smart contracts and instant verification finally make this scalable.' },
            ].map((test, idx) => (
              <motion.div
                key={idx}
                className="bg-[#1a2235] border border-[#1e2d45] rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold">
                    {test.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#f0f4ff]">{test.name}</p>
                    <p className="text-xs text-[#8a9bb5]">{test.location}</p>
                  </div>
                </div>
                <p className="text-[#8a9bb5] italic">&quot;{test.quote}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security You Can Trust Section */}
      <section className="py-32 bg-[#0a0f1e] border-t border-[#1e2d45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#f0f4ff] mb-4">Security You Can Trust</h2>
            <div className="h-2 w-24 bg-[#00c896] mb-6 rounded-full" />
            <p className="text-lg text-[#8a9bb5]">Enterprise-grade security built on the 0G blockchain</p>
          </motion.div>

          <SecurityFeatures />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-[#0a0f1e] border-t border-[#1e2d45]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#f0f4ff] mb-4">Frequently Asked Questions</h2>
            <div className="h-2 w-24 bg-[#00c896] mb-6 rounded-full" />
            <p className="text-lg text-[#8a9bb5]">Everything you need to know about AgroShield</p>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: 'How quickly will I get paid after a drought trigger?',
                a: 'AgroShield processes payouts within 48 hours of weather-triggered event confirmation on the 0G blockchain. No claims investigators, no delays. Funds arrive as 0G in your wallet.',
              },
              {
                q: "What are AgroShield's fees?",
                a: 'We charge a small premium (varies by crop/region/risk level) plus a 1-2% platform fee. No hidden costs, no claims adjusters. Full transparency: all pricing shown upfront.',
              },
              {
                q: 'Do I need collateral or credit history?',
                a: "No. AgroShield is parametric insurance—we don't assess your creditworthiness. We insure the risk of drought, not your personal finances. Farmers with no credit history can get covered.",
              },
              {
                q: 'Is my farm location and data private?',
                a: "Yes. Your farm location is encrypted and only used to pull weather data for your region. We never sell farm data and don't share your identity with investors.",
              },
              {
                q: 'Can I cover multiple crops or fields?',
                a: 'Absolutely. You can enroll multiple plots separately, each with its own crop type and risk parameters. Build a portfolio of coverage that matches your farming operations.',
              },
              {
                q: 'What weather data sources do you use?',
                a: 'We integrate 3+ independent satellite weather data providers plus ground stations. Triggers require consensus across sources to prevent false positives. All data is timestamped on-chain.',
              },
            ].map((faq, idx) => (
              <FAQItem key={idx} question={faq.q} answer={faq.a} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 border-t border-[#1e2d45] relative overflow-hidden"
        style={{
          backgroundImage: 'url(/cta-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#16834e]/80 via-[#16834e]/65 to-[#0a0f1e]/70" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Ready to protect your harvest?</h2>
          <p className="text-lg text-white/90 mb-8">Join African farmers and impact investors on AgroShield.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="bg-white text-[#00c896] font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-white/30 transition-all flex items-center justify-center gap-2 group hover:scale-105">
              Get Covered
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-full backdrop-blur transition-all hover:scale-105 text-center">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1e] border-t border-[#1e2d45] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <BrandLogo className="mb-4 text-[#f0f4ff]" imageClassName="h-14" />
              <p className="text-[#8a9bb5] text-sm">Parametric crop insurance. Farmers protected.</p>
            </div>
            <div>
              <p className="font-semibold text-[#f0f4ff] mb-4">Product</p>
              <ul className="space-y-2 text-[#8a9bb5] text-sm">
                <li><Link href="/sign-up" className="hover:text-[#00c896] transition-colors">For Farmers</Link></li>
                <li><a href="#partners" className="hover:text-[#00c896] transition-colors">For Investors</a></li>
                <li><a href="#faq" className="hover:text-[#00c896] transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#f0f4ff] mb-4">Company</p>
              <ul className="space-y-2 text-[#8a9bb5] text-sm">
                <li><a href="#" className="hover:text-[#00c896] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#00c896] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#00c896] transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#f0f4ff] mb-4">Legal</p>
              <ul className="space-y-2 text-[#8a9bb5] text-sm">
                <li><a href="#" className="hover:text-[#00c896] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#00c896] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#1e2d45] pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-[#8a9bb5] text-sm">© 2025 AgroShield. Built for African Farmers.</p>
              <div className="flex items-center space-x-2 mt-4 md:mt-0 text-[#8a9bb5] text-sm">
                <span>Powered by</span>
                <span className="font-display font-bold text-[#00c896]">0G</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
