export const metadata = { title: '취소 및 환불 정책 | 힐링바이크투어' }

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-3xl font-black text-zinc-900 mb-2">취소 및 환불 정책</h1>
        <p className="text-sm text-zinc-400 mb-10">최종 수정일: 2026년 05월 01일</p>

        <div className="space-y-8 bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm text-sm text-zinc-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mb-3">1. 취소 및 환불 기준</h2>
            <p className="mb-4">주식회사 힐링바이크투어(이하 "회사")는 여행업 표준 약관 및 관계 법령에 따라 아래와 같이 취소 및 환불 정책을 운영합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="border border-zinc-200 px-4 py-3 text-left font-semibold text-zinc-700">취소 시점</th>
                    <th className="border border-zinc-200 px-4 py-3 text-left font-semibold text-zinc-700">환불 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['투어 7일 전까지', '100% 전액 환불'],
                    ['투어 3~6일 전', '결제금액의 80% 환불'],
                    ['투어 2일 전', '결제금액의 50% 환불'],
                    ['투어 1일 전', '결제금액의 20% 환불'],
                    ['투어 당일 또는 노쇼(No-show)', '환불 불가'],
                  ].map(([timing, amount]) => (
                    <tr key={timing}>
                      <td className="border border-zinc-200 px-4 py-3">{timing}</td>
                      <td className="border border-zinc-200 px-4 py-3 font-medium text-emerald-700">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mb-3">2. 기상 및 불가항력에 의한 취소</h2>
            <p>태풍, 폭우, 폭설, 천재지변 등 불가항력적 사유로 투어가 취소되는 경우 결제금액의 100%를 환불해 드립니다. 단, 기상 특보 발령 기준에 따라 판단하며, 회사가 별도로 고객에게 통보합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mb-3">3. 회사 사정에 의한 취소</h2>
            <p>회사의 사정(가이드 부재, 장비 문제 등)으로 투어가 취소되는 경우 결제금액의 100%를 환불하며, 필요시 대체 일정을 제공합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mb-3">4. 환불 처리 방법</h2>
            <ul className="space-y-2 list-disc list-inside text-zinc-600">
              <li>환불은 결제 수단으로 역환불 처리됩니다.</li>
              <li>카드 결제: 카드사 정책에 따라 영업일 기준 3~5일 소요</li>
              <li>카카오페이 / 네이버페이: 영업일 기준 1~3일 소요</li>
              <li>PayPal: PayPal 정책에 따라 3~5 영업일 소요</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mb-3">5. 취소 신청 방법</h2>
            <p>예약 취소는 아래 방법으로 신청할 수 있습니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-zinc-600">
              <li>마이페이지 → 예약 내역 → 취소 신청</li>
              <li>이메일: healingbiketour@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mb-3">6. 문의</h2>
            <p>취소·환불 관련 문의는 고객센터(healingbiketour@gmail.com)로 연락주시기 바랍니다.</p>
            <p className="mt-2 text-xs text-zinc-400">주식회사 힐링바이크투어 &nbsp;|&nbsp; 대표: 이상호 &nbsp;|&nbsp; 사업자등록번호: 860-86-04061</p>
          </section>

        </div>
      </div>
    </div>
  )
}
