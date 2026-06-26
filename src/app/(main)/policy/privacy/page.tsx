import type { Metadata } from 'next'

export const metadata: Metadata = { title: '개인정보 처리방침' }

const LAST_UPDATED = '2026년 6월 1일'
const COMPANY = '힐링바이크투어'
const EMAIL = 'healingbiketour@gmail.com'

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-zinc-900 mb-2">개인정보 처리방침</h1>
        <p className="text-sm text-zinc-400 mb-10">최종 수정일: {LAST_UPDATED}</p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-8 text-sm text-amber-800">
          {COMPANY}는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제1조 (개인정보의 처리 목적)</h2>
            <p className="mb-2">{COMPANY}는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 목적이 변경될 경우 별도 동의를 받겠습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>투어 예약 및 결제 처리</li>
              <li>회원 가입 및 회원 관리</li>
              <li>고객 문의 및 민원 처리</li>
              <li>서비스 이용 통계 및 분석 (동의자에 한함)</li>
              <li>마케팅 및 광고 활용 (동의자에 한함)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제2조 (처리하는 개인정보 항목)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">구분</th>
                    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">수집 항목</th>
                    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">수집 방법</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-zinc-200 px-3 py-2 font-medium">필수</td>
                    <td className="border border-zinc-200 px-3 py-2">이름, 이메일, 비밀번호, 연락처</td>
                    <td className="border border-zinc-200 px-3 py-2">회원가입 시 입력</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="border border-zinc-200 px-3 py-2 font-medium">선택</td>
                    <td className="border border-zinc-200 px-3 py-2">국적, 프로필 사진</td>
                    <td className="border border-zinc-200 px-3 py-2">회원 정보 수정 시</td>
                  </tr>
                  <tr>
                    <td className="border border-zinc-200 px-3 py-2 font-medium">예약 시</td>
                    <td className="border border-zinc-200 px-3 py-2">예약자명, 연락처, 이메일, 결제 정보</td>
                    <td className="border border-zinc-200 px-3 py-2">예약 및 결제 처리</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="border border-zinc-200 px-3 py-2 font-medium">자동 수집</td>
                    <td className="border border-zinc-200 px-3 py-2">IP 주소, 쿠키, 접속 로그, 기기 정보</td>
                    <td className="border border-zinc-200 px-3 py-2">서비스 이용 중 자동 수집</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제3조 (개인정보의 보유 및 이용기간)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보존)</li>
              <li><strong>예약·결제 정보:</strong> 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
              <li><strong>소비자 불만·분쟁 처리:</strong> 3년 (동법)</li>
              <li><strong>웹사이트 방문 기록:</strong> 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제4조 (개인정보의 제3자 제공)</h2>
            <p className="mb-2">회사는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외입니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>정보주체가 사전에 동의한 경우</li>
              <li>법령에 의한 경우 (수사기관 요청 등)</li>
              <li>결제 처리를 위한 PG사 (포트원, 페이팔) 연동 (결제 정보에 한함)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제5조 (개인정보 처리의 위탁)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">수탁사</th>
                    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-zinc-200 px-3 py-2">Supabase Inc.</td>
                    <td className="border border-zinc-200 px-3 py-2">데이터베이스 및 인증 서비스</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="border border-zinc-200 px-3 py-2">포트원(주)</td>
                    <td className="border border-zinc-200 px-3 py-2">국내 결제 처리</td>
                  </tr>
                  <tr>
                    <td className="border border-zinc-200 px-3 py-2">PayPal Holdings, Inc.</td>
                    <td className="border border-zinc-200 px-3 py-2">해외 결제 처리</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제6조 (정보주체의 권리·의무)</h2>
            <p className="mb-2">정보주체는 회사에 대하여 언제든지 다음 각 호의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있는 경우 정정 요구</li>
              <li>삭제 요구 (단, 법령에서 보존 의무가 있는 경우 제외)</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-2">위 권리 행사는 {EMAIL}로 이메일을 보내시면 처리해 드립니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제7조 (쿠키 사용)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회사는 로그인 세션 유지 및 언어 설정 저장을 위해 쿠키를 사용합니다.</li>
              <li>브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제8조 (개인정보 보호책임자)</h2>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p><strong>회사명:</strong> {COMPANY}</p>
              <p className="mt-1"><strong>이메일:</strong> {EMAIL}</p>
              <p className="mt-1"><strong>개인정보 침해 신고:</strong> 개인정보보호위원회 (privacy.go.kr / 국번없이 182)</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
