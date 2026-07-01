import Image from 'next/image'
import Link from 'next/link'
import { Bike, MapPin, Shield, Heart, Users, Star, Mail, KeyRound, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '회사 소개 | 힐링바이크투어' }

export default async function AboutPage() {
  const t = await getTranslations('about')

  const values = [
    { icon: Heart,  title: t('value_1_title'), desc: t('value_1_desc') },
    { icon: MapPin, title: t('value_2_title'), desc: t('value_2_desc') },
    { icon: Shield, title: t('value_3_title'), desc: t('value_3_desc') },
    { icon: Star,   title: t('value_4_title'), desc: t('value_4_desc') },
  ]

  const stats = [
    { value: t('stat_1_val'), label: t('stat_1_label') },
    { value: t('stat_2_val'), label: t('stat_2_label') },
    { value: t('stat_3_val'), label: t('stat_3_label') },
  ]

  const certifications = [
    {
      year: '2013',
      title: t('cert_1_title'),
      subtitle: t('cert_1_sub'),
      desc: t('cert_1_desc'),
      issuer: t('cert_1_issuer'),
      color: 'emerald',
      img: '/cert-2013-national.jpeg',
    },
    {
      year: '2014',
      title: t('cert_2_title'),
      subtitle: t('cert_2_sub'),
      desc: t('cert_2_desc'),
      issuer: t('cert_2_issuer'),
      color: 'blue',
      img: '/cert-2014-river.jpeg',
    },
    {
      year: '2020',
      title: t('cert_3_title'),
      subtitle: t('cert_3_sub'),
      desc: t('cert_3_desc'),
      issuer: t('cert_3_issuer'),
      color: 'amber',
      img: '/cert-2020-grandslam.jpeg',
    },
  ]

  const companyInfo = [
    { label: t('ci_name_lbl'),       value: t('ci_name_val') },
    { label: t('ci_ceo_lbl'),        value: t('ci_ceo_val') },
    { label: t('ci_reg_lbl'),        value: t('ci_reg_val') },
    { label: t('ci_addr_lbl'),       value: t('ci_addr_val') },
    { label: t('ci_opened_lbl'),     value: t('ci_opened_val') },
    { label: t('ci_industry_lbl'),   value: t('ci_industry_val') },
    { label: t('ci_category_lbl'),   value: t('ci_category_val') },
    { label: t('ci_mail_order_lbl'), value: t('ci_mail_order_val') },
    { label: t('ci_email_lbl'),      value: t('ci_email_val') },
  ]

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-emerald-900 py-24 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Bike className="h-4 w-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl whitespace-pre-line">
            {t('hero_title')}
          </h1>
          <p className="mt-6 text-lg text-emerald-100 leading-relaxed max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/tours" className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-emerald-800 shadow hover:bg-emerald-50 transition-colors">
              {t('browse_tours')}
            </Link>
            <Link href="/rental" className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
              {t('book_rental')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-100 bg-zinc-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-emerald-600">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">{t('story_label')}</p>
              <h2 className="text-3xl font-black text-zinc-900 whitespace-pre-line">{t('story_title')}</h2>
              <div className="mt-6 space-y-4 text-zinc-600 leading-relaxed">
                <p>{t('story_p1')}</p>
                <p>{t('story_p2')}</p>
                <p>{t('story_p3')}</p>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-3xl bg-zinc-100 md:h-80">
              <Image src="/메인-사진.jpg" alt="힐링바이크투어" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">{t('services_label')}</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('services_title')}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Guided Tour */}
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-emerald-600 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 mb-3">
                  <Bike className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">{t('guide_tour_title')}</h3>
                <p className="text-emerald-100 text-sm mt-1">{t('guide_tour_subtitle')}</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-2.5 text-sm text-zinc-600">
                  {[t('guide_items_0'), t('guide_items_1'), t('guide_items_2'), t('guide_items_3')].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/tours"
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                  {t('guide_browse')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Bike Rental */}
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-zinc-900 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 mb-3">
                  <KeyRound className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">{t('rental_title')}</h3>
                <p className="text-zinc-400 text-sm mt-1">{t('rental_subtitle')}</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-2.5 text-sm text-zinc-600">
                  {[t('rental_items_0'), t('rental_items_1'), t('rental_items_2'), t('rental_items_3')].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/rental"
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-700 transition-colors">
                  {t('rental_book')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">{t('cert_label')}</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('cert_title')}</h2>
            <p className="mt-3 text-zinc-500 max-w-xl mx-auto">{t('cert_subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {certifications.map((cert) => (
              <div key={cert.year} className="rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                  <Image
                    src={cert.img}
                    alt={cert.title}
                    fill
                    className="object-cover object-center scale-[1.18]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-full shadow ${
                    cert.color === 'emerald' ? 'bg-emerald-500 text-white' :
                    cert.color === 'blue' ? 'bg-blue-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>{cert.year}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black text-zinc-900 text-base leading-snug">{cert.title}</h3>
                  <p className={`text-xs font-bold mt-1 ${
                    cert.color === 'emerald' ? 'text-emerald-600' :
                    cert.color === 'blue' ? 'text-blue-600' :
                    'text-amber-600'
                  }`}>{cert.subtitle}</p>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed flex-1">{cert.desc}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    <span className="text-xs text-zinc-400">{cert.issuer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">{t('values_label')}</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('values_title')}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{v.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">{t('access_label')}</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('access_title')}</h2>
            <p className="mt-3 text-zinc-500">{t('access_subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{t('meeting_point_label')}</p>
                  <p className="mt-1 text-sm text-zinc-600">{t('meeting_point_value')}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{t('meeting_point_addr')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{t('subway_label')}</p>
                  <p className="mt-1 text-sm text-zinc-600">{t('subway_value')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{t('bus_label')}</p>
                  <p className="mt-1 text-sm text-zinc-600">{t('bus_value')}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{t('bus_lines')}</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-200 min-h-[220px]">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-white shadow-lg px-3 py-2 pointer-events-none">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
                  <Bike className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900 leading-none">힐링바이크투어</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">당산로50길 11 · 당산역 4번 출구</p>
                </div>
              </div>
              <iframe
                src="https://maps.google.com/maps?q=서울특별시+영등포구+당산로50길+11&output=embed&hl=ko"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                title={t('access_title')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">{t('company_label')}</p>
            <h2 className="text-3xl font-black text-zinc-900">{t('company_title')}</h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            {companyInfo.map(({ label, value }, i) => (
              <div key={label} className={`flex gap-6 px-6 py-4 ${i % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}`}>
                <span className="w-36 shrink-0 text-sm font-semibold text-zinc-500">{label}</span>
                <span className="text-sm text-zinc-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-emerald-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">{t('contact_label')}</p>
              <h2 className="text-3xl font-black">{t('contact_title')}</h2>
              <p className="mt-4 text-emerald-100 leading-relaxed">{t('contact_desc')}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">{t('contact_email_label')}</p>
                  <p className="font-semibold">healingbiketour@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">{t('contact_location_label')}</p>
                  <p className="font-semibold">{t('contact_location_val')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">{t('contact_ops_label')}</p>
                  <p className="font-semibold">{t('contact_ops_val')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
