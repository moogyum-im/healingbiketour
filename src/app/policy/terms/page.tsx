import type { Metadata } from 'next'

export const metadata: Metadata = { title: '이용약관' }

const LAST_UPDATED = '2026년 6월 1일'
const COMPANY = '힐링바이크투어'
const EMAIL = 'healingbiketour@gmail.com'

export default function TermsPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-zinc-900 mb-2">이용약관</h1>
        <p className="text-sm text-zinc-400 mb-10">최종 수정일: {LAST_UPDATED}</p>

        <div className="prose prose-zinc max-w-none space-y-8 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제1조 (목적)</h2>
            <p>이 약관은 {COMPANY}(이하 "회사")가 제공하는 자전거 투어 예약 서비스(이하 "서비스")의 이용에 관한 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제2조 (용어 정의)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>"서비스"</strong>란 회사가 운영하는 자전거 투어 예약 플랫폼 및 관련 제반 서비스를 말합니다.</li>
              <li><strong>"회원"</strong>이란 본 약관에 동의하고 회원가입을 완료한 자를 말합니다.</li>
              <li><strong>"투어"</strong>란 회사가 제공하는 자전거 투어 상품을 말합니다.</li>
              <li><strong>"예약"</strong>이란 회원이 투어 상품을 신청하고 결제를 완료하는 행위를 말합니다.</li>
              <li><strong>"크레딧"</strong>이란 서비스 내에서 결제 수단으로 사용할 수 있는 포인트를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 효력을 발생합니다.</li>
              <li>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 최소 7일 전에 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제4조 (이용계약 체결)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>이용계약은 회원이 본 약관에 동의하고 회원가입을 신청한 후, 회사가 승낙함으로써 성립합니다.</li>
              <li>만 14세 미만의 아동은 법정대리인의 동의 없이 가입할 수 없습니다.</li>
              <li>회사는 다음의 경우 이용 신청을 거절하거나 승낙을 보류할 수 있습니다.
                <ul className="pl-5 mt-1 space-y-1 list-[circle]">
                  <li>실명이 아닌 경우</li>
                  <li>타인의 정보를 도용한 경우</li>
                  <li>기타 서비스 운영에 지장을 초래할 우려가 있는 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제5조 (서비스 이용)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>서비스는 연중무휴 24시간 제공을 원칙으로 하되, 시스템 점검 등의 사유로 일시적으로 중단될 수 있습니다.</li>
              <li>회사는 서비스 내용을 변경하거나 종료할 수 있으며, 이 경우 사전에 공지합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제6조 (회원의 의무)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>회원은 본 약관 및 회사의 공지사항을 준수해야 합니다.</li>
              <li>회원은 자신의 계정 정보를 타인에게 양도하거나 공유할 수 없습니다.</li>
              <li>회원은 서비스 이용 중 타인의 권리 침해, 명예훼손, 허위사실 유포 등의 행위를 해서는 안 됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제7조 (예약 및 결제)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>예약은 회원 가입 후 원하는 투어 상품을 선택하고 결제를 완료함으로써 성립합니다.</li>
              <li>결제 수단은 신용카드, 카카오페이, 네이버페이, 페이팔 및 크레딧(포인트)으로 제한됩니다.</li>
              <li>크레딧은 1크레딧 = 1원으로 환산하여 사용할 수 있으며, 현금으로 환불되지 않습니다.</li>
              <li>결제 완료 후 예약 확인 이메일이 발송됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제8조 (취소 및 환불)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>투어 7일 전 이상:</strong> 결제 금액 100% 전액 환불</li>
              <li><strong>투어 3~6일 전:</strong> 결제 금액의 50% 환불</li>
              <li><strong>투어 2일 전 ~ 당일:</strong> 환불 불가</li>
              <li><strong>악천후·천재지변:</strong> 회사의 판단 하에 취소 시 100% 환불 또는 일정 변경 제공</li>
              <li><strong>No-show:</strong> 사전 연락 없이 불참 시 환불 불가</li>
              <li>크레딧으로 결제한 금액은 크레딧으로 환급됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제9조 (크레딧)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>크레딧은 투어 이용 후 리뷰 작성, 이벤트 참여, 관리자 부여 등의 방법으로 적립됩니다.</li>
              <li>리뷰 작성 크레딧: 투어당 1회, 2,000 크레딧 지급</li>
              <li>크레딧의 유효기간은 적립일로부터 1년입니다.</li>
              <li>크레딧은 현금으로 환급되지 않으며, 타인에게 양도할 수 없습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제10조 (손해배상 및 면책)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>회사는 천재지변, 전쟁, 테러, 해킹 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
              <li>투어 참가 중 회원 본인의 과실로 인한 사고에 대한 책임은 회원 본인에게 있습니다.</li>
              <li>회사는 서비스 내 게시된 정보의 정확성에 대해 보증하지 않으며, 이로 인한 손해에 대해 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-3">제11조 (분쟁 해결)</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>본 약관과 관련된 분쟁은 대한민국 법률을 준거법으로 합니다.</li>
              <li>분쟁 발생 시 서울중앙지방법원을 전속 관할 법원으로 합니다.</li>
              <li>문의 및 불만사항: {EMAIL}</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
