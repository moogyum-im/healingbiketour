import HeroSection from '@/components/home/HeroSection'
import RentalCarousel from '@/components/home/RentalCarousel'
import ReviewSection from '@/components/home/ReviewSection'
import VideoHighlightSection from '@/components/home/VideoHighlightSection'
import { getToursWithOverrides } from '@/lib/tours'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Award, Bike, Film } from 'lucide-react'

export default async function HomePage() {
  const t = await getTranslations()
  const allTours = await getToursWithOverrides()
  const activeTours = allTours.filter((t) => t.is_active)

  const features = [
    { icon: Award, title: t('whyus.expert_title'), description: t('whyus.expert_desc') },
    { icon: Bike,  title: t('whyus.bikes_title'),  description: t('whyus.bikes_desc') },
    { icon: Film,  title: t('whyus.video_title'),  description: t('whyus.video_desc') },
  ]

  return (
    <>
      <HeroSection tours={activeTours} />
      <RentalCarousel />

      {/* Why Us */}
      <section className="py-20 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Why Us</p>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl">{t('whyus.title')}</h2>
            <p className="mt-2 text-zinc-400 text-lg">{t('whyus.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoHighlightSection />
      <ReviewSection />

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-emerald-600">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_theme(colors.emerald.400/30),_transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-3">Han River</p>
          <h2 className="text-4xl font-black text-white sm:text-5xl">{t('cta.title')}</h2>
          <p className="mt-4 text-emerald-100 text-lg">{t('cta.subtitle')}</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tours"
              className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition-all hover:bg-zinc-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('cta.tour_btn')}
            </Link>
            <Link
              href="/rental"
              className="w-full sm:w-auto rounded-xl border-2 border-white/50 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('cta.rental_btn')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
