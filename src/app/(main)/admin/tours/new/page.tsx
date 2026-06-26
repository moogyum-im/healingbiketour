import TourForm from '../TourForm'

export const metadata = { title: '새 투어 등록 | 관리자' }

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">새 투어 등록</h1>
        <p className="mt-1 text-sm text-zinc-500">새로운 자전거 투어를 등록하세요</p>
      </div>
      <TourForm />
    </div>
  )
}
