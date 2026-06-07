-- chat_sessions RLS (session_id 아는 사람은 조회 가능 — UUID가 접근 토큰 역할)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "세션 공개 조회" ON public.chat_sessions;
CREATE POLICY "세션 공개 조회" ON public.chat_sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "세션 생성" ON public.chat_sessions;
CREATE POLICY "세션 생성" ON public.chat_sessions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "세션 상태 업데이트" ON public.chat_sessions;
CREATE POLICY "세션 상태 업데이트" ON public.chat_sessions
  FOR UPDATE USING (true);

-- chat_messages RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "메시지 공개 조회" ON public.chat_messages;
CREATE POLICY "메시지 공개 조회" ON public.chat_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "메시지 생성" ON public.chat_messages;
CREATE POLICY "메시지 생성" ON public.chat_messages
  FOR INSERT WITH CHECK (true);
