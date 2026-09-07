'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { CONTACT_PHONE } from '@/lib/constants'

const CATEGORY_KEYS = [
  { key: 'cat_all',          dbVal: null },
  { key: 'cat_requirements', dbVal: '참가 조건' },
  { key: 'cat_preparation',  dbVal: '준비물' },
  { key: 'cat_info',         dbVal: '투어 안내' },
  { key: 'cat_booking',      dbVal: '예약·결제' },
  { key: 'cat_cancellation', dbVal: '취소·환불' },
  { key: 'cat_safety',       dbVal: '안전·보험' },
] as const

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
}

interface TranslatedFaq {
  id: string
  question: string
  answer: string
  category: string
}

const TRANSLATED_FAQS: Record<string, TranslatedFaq[]> = {
  en: [
    { id: 'e1', category: '참가 조건', question: 'Can I join if I can\'t ride a bike well?', answer: 'Basic cycling ability is required. If you can ride a bike on a flat surface, you\'re welcome to join. Beginner-friendly routes are available.' },
    { id: 'e2', category: '참가 조건', question: 'Are there age or fitness requirements?', answer: 'Participants must be 14 or older (under 18 requires guardian accompaniment). No strict fitness requirements, but some routes are long-distance so basic stamina is recommended.' },
    { id: 'e3', category: '참가 조건', question: 'Can foreigners participate?', answer: 'Absolutely! We welcome international participants. English-speaking support is available. Please contact us in advance if you need additional assistance.' },
    { id: 'e4', category: '준비물', question: 'What should I wear and bring?', answer: 'Wear comfortable athletic clothing. Helmets are provided free of charge. Bring water, sunscreen, and a light snack. No special cycling gear is required.' },
    { id: 'e5', category: '투어 안내', question: 'Is lunch or a meal included?', answer: 'Meals are not included, but we stop at local restaurants or convenience spots where you can purchase food.' },
    { id: 'e6', category: '투어 안내', question: 'How long does the tour take?', answer: 'Tour duration varies by route, typically 4–10 hours including breaks. Check the individual tour page for exact duration.' },
    { id: 'e7', category: '예약·결제', question: 'How do I make a booking?', answer: 'Book on our website by selecting a tour, date, and time. Bank transfer account details are provided after your booking is confirmed.' },
    { id: 'e8', category: '예약·결제', question: 'Is there a group discount?', answer: 'Yes, discounts are available for groups of 5 or more. Contact us via 1:1 inquiry or email for details.' },
    { id: 'e9', category: '취소·환불', question: 'What if the weather is bad on tour day?', answer: 'In the event of heavy rain, typhoon, or extreme weather, the tour is cancelled with a full refund or free rescheduling. Light rain tours typically proceed as scheduled.' },
    { id: 'e10', category: '취소·환불', question: 'What is the cancellation and refund policy?', answer: '7+ days before: 100% refund. 3–6 days before: 50% refund. 2 days before – day of: No refund. No-show: No refund.' },
    { id: 'e11', category: '안전·보험', question: 'Is bicycle insurance covered?', answer: 'Operator liability insurance applies to cover accidents that occur during the tour. It covers third-party damages only — not personal injury or medical costs for participants. Solo (self-guided) riders are not covered under any policy. We strongly recommend purchasing personal travel insurance before your ride.' },
    { id: 'e12', category: '투어 안내', question: 'Can I receive photos or video from the tour?', answer: 'Yes! A dashcam is mounted on every bike, and full footage is delivered to you after the tour, free of charge.' },
  ],
  ja: [
    { id: 'j1', category: '참가 조건', question: '自転車が苦手でも参加できますか？', answer: '平地を走れる程度の基本的な運転技術があれば参加可能です。初心者向けのコースもご用意しています。' },
    { id: 'j2', category: '참가 조건', question: '年齢や体力に制限はありますか？', answer: '14歳以上を対象としています（18歳未満は保護者同伴が必要）。特別な体力制限はありませんが、長距離コースには基本的な体力が必要です。' },
    { id: 'j3', category: '참가 조건', question: '外国人でも参加できますか？', answer: 'もちろんです！英語でのサポートも可能です。事前にお問い合わせいただければ、より丁寧にご対応いたします。' },
    { id: 'j4', category: '준비물', question: '服装や持ち物は何が必要ですか？', answer: '動きやすいスポーツウェアでお越しください。ヘルメットは無料でご提供します。飲み物、日焼け止め、軽食をお持ちいただくことをお勧めします。' },
    { id: 'j5', category: '투어 안내', question: '昼食や食事は含まれていますか？', answer: '食事はツアー料金に含まれていませんが、コース途中でレストランやコンビニに立ち寄ります。' },
    { id: 'j6', category: '투어 안내', question: 'ツアーの所要時間はどのくらいですか？', answer: 'コースによって異なりますが、休憩を含めて4〜10時間程度です。各ツアーページでご確認ください。' },
    { id: 'j7', category: '예약·결제', question: '予約はどのようにしますか？', answer: 'ウェブサイトからツアー・日時を選択して予約できます。銀行振込の口座情報は予約確定後にお知らせします。' },
    { id: 'j8', category: '예약·결제', question: 'グループ割引はありますか？', answer: '5名以上のグループには割引があります。詳細は1対1お問い合わせまたはメールでご連絡ください。' },
    { id: 'j9', category: '취소·환불', question: '当日の天気が悪い場合はどうなりますか？', answer: '大雨・台風・悪天候の場合はツアーをキャンセルし、全額返金または無料で日程変更いたします。小雨の場合は通常通り実施します。' },
    { id: 'j10', category: '취소·환불', question: 'キャンセル・返金ポリシーはどうなっていますか？', answer: '7日前以上：全額返金。3〜6日前：50%返金。前日〜当日：返金なし。無断キャンセル：返金なし。' },
    { id: 'j11', category: '안전·보험', question: '自転車保険は適用されますか？', answer: 'ツアー中に発生した事故に備え、事業者賠償責任保険が適用されます。参加者ご自身の傷害・医療費は補償対象外です。単独ライディングは保険の適用外となります。旅行保険はご自身での加入をお勧めします。' },
    { id: 'j12', category: '투어 안내', question: 'ツアー中の写真や動画はもらえますか？', answer: 'はい！全ての自転車にドライブレコーダーを搭載しており、ツアー終了後に全映像を無料でお届けします。' },
  ],
  'zh-CN': [
    { id: 'c1', category: '참가 조건', question: '不太会骑自行车也可以参加吗？', answer: '只要能在平地骑行即可参加。我们提供适合初学者的路线，欢迎您加入。' },
    { id: 'c2', category: '참가 조건', question: '对年龄或体力有要求吗？', answer: '14岁以上均可参加（18岁以下需有监护人陪同）。没有严格的体力要求，但长距离路线建议具备基本体能。' },
    { id: 'c3', category: '참가 조건', question: '外国人可以参加吗？', answer: '当然可以！我们欢迎国际参与者。如需英语支持，请提前联系我们。' },
    { id: 'c4', category: '준비물', question: '需要穿什么衣服、带什么物品？', answer: '请穿着舒适的运动服。头盔免费提供。建议自带饮用水、防晒霜和轻便零食。无需专业骑行装备。' },
    { id: 'c5', category: '투어 안내', question: '午餐或餐食包含在内吗？', answer: '餐费不包含在价格内，但途中会在餐厅或便利店停靠，供您自行购买食物。' },
    { id: 'c6', category: '투어 안내', question: '行程需要多长时间？', answer: '根据路线不同，含休息在内约需4至10小时。请查阅各行程页面了解详情。' },
    { id: 'c7', category: '예약·결제', question: '如何预约？', answer: '在官网选择行程、日期和时间即可预约。预约确认后将提供银行转账账户信息。' },
    { id: 'c8', category: '예약·결제', question: '有团体优惠吗？', answer: '5人及以上团体可享折扣优惠。请通过1对1咨询或邮件联系我们了解详情。' },
    { id: 'c9', category: '취소·환불', question: '当天天气不好怎么办？', answer: '遇大雨、台风或极端天气时，行程将取消并提供全额退款或免费改期。小雨通常照常进行。' },
    { id: 'c10', category: '취소·환불', question: '取消及退款政策是什么？', answer: '提前7天以上：全额退款。提前3-6天：退50%。提前2天至当天：不退款。无故缺席：不退款。' },
    { id: 'c11', category: '안전·보험', question: '自行车保险包含在内吗？', answer: '为应对行程中发生的事故，运营方赔偿责任险适用于本次活动。仅涵盖第三方责任，不包含参与者本人的人身伤害或医疗费用。单独骑行不在保险保障范围内。建议个人自行购买旅行保险。' },
    { id: 'c12', category: '투어 안내', question: '可以收到行程中的照片或视频吗？', answer: '可以！每辆自行车都安装了行车记录仪，行程结束后将免费为您提供全程视频。' },
  ],
  'zh-TW': [
    { id: 't1', category: '참가 조건', question: '不太會騎自行車也可以參加嗎？', answer: '只要能在平地騎行即可參加。我們提供適合初學者的路線，歡迎您加入。' },
    { id: 't2', category: '참가 조건', question: '對年齡或體力有要求嗎？', answer: '14歲以上均可參加（18歲以下需有監護人陪同）。沒有嚴格的體力要求，但長距離路線建議具備基本體能。' },
    { id: 't3', category: '참가 조건', question: '外國人可以參加嗎？', answer: '當然可以！我們歡迎國際參與者。如需英語支援，請提前聯絡我們。' },
    { id: 't4', category: '준비물', question: '需要穿什麼衣服、帶什麼物品？', answer: '請穿著舒適的運動服。頭盔免費提供。建議自帶飲用水、防曬乳和輕便零食。無需專業騎行裝備。' },
    { id: 't5', category: '투어 안내', question: '午餐或餐食包含在內嗎？', answer: '餐費不包含在價格內，但途中會在餐廳或便利商店停靠，供您自行購買食物。' },
    { id: 't6', category: '투어 안내', question: '行程需要多長時間？', answer: '根據路線不同，含休息在內約需4至10小時。請查閱各行程頁面了解詳情。' },
    { id: 't7', category: '예약·결제', question: '如何預約？', answer: '在官網選擇行程、日期和時間即可預約。預約確認後將提供銀行轉帳帳戶資訊。' },
    { id: 't8', category: '예약·결제', question: '有團體優惠嗎？', answer: '5人及以上團體可享折扣優惠。請透過1對1諮詢或電子郵件聯繫我們了解詳情。' },
    { id: 't9', category: '취소·환불', question: '當天天氣不好怎麼辦？', answer: '遇大雨、颱風或極端天氣時，行程將取消並提供全額退款或免費改期。小雨通常照常進行。' },
    { id: 't10', category: '취소·환불', question: '取消及退款政策是什麼？', answer: '提前7天以上：全額退款。提前3-6天：退50%。提前2天至當天：不退款。無故缺席：不退款。' },
    { id: 't11', category: '안전·보험', question: '自行車保險包含在內嗎？', answer: '為應對行程中發生的事故，營運方賠償責任險適用於本次活動。僅涵蓋第三方責任，不包含參與者本人的人身傷害或醫療費用。單獨騎行不在保險保障範圍內。建議個人自行購買旅遊保險。' },
    { id: 't12', category: '투어 안내', question: '可以收到行程中的照片或影片嗎？', answer: '可以！每輛自行車都安裝了行車記錄器，行程結束後將免費為您提供全程影片。' },
  ],
}

export default function FaqPage() {
  const t = useTranslations('faq')
  const locale = useLocale()
  const isKo = locale === 'ko'
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [activeKey, setActiveKey] = useState<string>('cat_all')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!isKo) return
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setFaqs(data ?? []))
  }, [isKo])

  const translatedFaqs = TRANSLATED_FAQS[locale] ?? TRANSLATED_FAQS['en']
  const activeDbVal = CATEGORY_KEYS.find(c => c.key === activeKey)?.dbVal ?? null

  const displayFaqs = isKo
    ? (activeDbVal === null ? faqs : faqs.filter(f => f.category === activeDbVal))
    : (activeDbVal === null ? translatedFaqs : translatedFaqs.filter(f => f.category === activeDbVal))

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">{t('title')}</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORY_KEYS.map(({ key }) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeKey === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        {displayFaqs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-20 text-center text-zinc-400">
            {t('no_faqs')}
          </div>
        ) : (
          <div className="space-y-2">
            {displayFaqs.map((faq) => (
              <div key={faq.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                >
                  <span className="font-semibold text-zinc-900 text-sm leading-relaxed pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {openId === faq.id && (
                  <div className="border-t border-zinc-100 px-6 py-4 bg-zinc-50 text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center space-y-1">
          <p className="text-sm text-zinc-400">
            {t('contact_prompt')}{' '}
            <a href="mailto:healingbiketour@gmail.com" className="text-emerald-600 font-semibold hover:underline">
              {t('contact_link')}
            </a>
          </p>
          <p className="text-sm text-zinc-400">
            <a href="tel:02-6265-2600" className="text-emerald-600 font-semibold hover:underline">
              {t('contact_phone')}
            </a>
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-center">
          <p className="text-sm font-medium text-emerald-800">{t('urgent_call_notice')}</p>
          <a
            href={`tel:${CONTACT_PHONE.tel}`}
            className="mt-1 inline-block text-2xl font-black text-emerald-700 hover:text-emerald-800"
          >
            {CONTACT_PHONE.display}
          </a>
        </div>
      </div>
    </div>
  )
}
