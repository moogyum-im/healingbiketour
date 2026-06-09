import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import FeaturedTours from '@/components/home/FeaturedTours'
import ReviewSection from '@/components/home/ReviewSection'
import VideoHighlightSection from '@/components/home/VideoHighlightSection'
import { getToursWithOverrides } from '@/lib/tours'
import Link from 'next/link'
import Image from 'next/image'
import { Award, Bike, Film } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations()
  const allTours = await getToursWithOverrides()
  const featuredTours = allTours.filter((t) => t.is_active).slice(0, 3)

  const features = [
    {
      icon: Award,
      title: t('whyus.expert_title'),
      description: t('whyus.expert_desc'),
    },
    {
      icon: Bike,
      title: t('whyus.bikes_title'),
      description: t('whyus.bikes_desc'),
    },
    {
      icon: Film,
      title: t('whyus.video_title'),
      description: t('whyus.video_desc'),
    },
  ]

  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedTours tours={featuredTours} />

      {/* Expert Guide */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* 인증서 3장 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { year: '2013', title: '국토종주 완주 인증', color: 'emerald', img: '/cert-2013-national.jpeg' },
                { year: '2014', title: '4대강 자전거길 완주 인증', color: 'blue', img: '/cert-2014-river.jpeg' },
                { year: '2020', title: '그랜드슬램 인증', color: 'amber', img: '/cert-2020-grandslam.jpeg' },
              ].map((cert) => (
                <div key={cert.year} className="flex flex-col gap-2">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-200 shadow-md">
                    <Image
                      src={cert.img}
                      alt={cert.title}
                      fill
                      className="object-cover object-center scale-[1.18]"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                    <span className={`absolute top-2 left-2 text-xs font-black px-2 py-0.5 rounded-full shadow-sm ${
                      cert.color === 'emerald' ? 'bg-emerald-500 text-white' :
                      cert.color === 'blue' ? 'bg-blue-500 text-white' :
                      'bg-amber-500 text-white'
                    }`}>{cert.year}</span>
                  </div>
                  <p className="text-center text-xs font-semibold text-zinc-500 leading-snug">{cert.title}</p>
                </div>
              ))}
            </div>
            {/* 텍스트 */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">EXPERT GUIDE</p>
              <h2 className="text-3xl font-black text-zinc-900 sm:text-4xl">
                직접 달리고<br />직접 설계한 코스
              </h2>
              <p className="mt-5 text-zinc-600 leading-relaxed">
                국토종주 633km, 4대강 자전거길, 동해안까지 — 대한민국 주요 국가 자전거길을 모두 완주한
                전문 가이드가 직접 기획한 코스입니다. 지도만 보고 만든 코스가 아닌,
                수백 번 달리며 검증한 루트를 안내합니다.
              </p>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                가이드 소개 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

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
          <h2 className="text-4xl font-black text-white sm:text-5xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-emerald-100 text-lg">
            {t('cta.subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tours"
              className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition-all hover:bg-zinc-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('cta.browse')}
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto rounded-xl border-2 border-white/50 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('cta.signup')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
