export const stats = [
  { label: "Books", value: 28, tone: "blue" },
  { label: "Chapters", value: 126, tone: "violet" },
  { label: "Comments", value: 342, tone: "emerald" },
  { label: "Completed", value: 15, tone: "cyan" },
  { label: "Readers", value: 1234, tone: "orange" },
  { label: "Playlists", value: 24, tone: "pink" }
];

export const readingOverview = [
  { month: "Jan", value: 30 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 48 },
  { month: "Apr", value: 62 },
  { month: "May", value: 70 },
  { month: "Jun", value: 86 }
];

export const recentActivities = [
  { icon: "📖", title: "이재준 started reading 봄날의 소나타", time: "2시간 전" },
  { icon: "💬", title: "김나래 commented on Chapter 3", time: "오늘" },
  { icon: "🎵", title: "박서연 recommended autumn music", time: "5시간 전" },
  { icon: "✅", title: "장우진 completed a sentence from 대화의 서랍", time: "1일 전" }
];

export const books = [
  {
    id: "silent-echo",
    title: "The Silent Echo",
    author: "Eleanor Hart",
    chapters: 6,
    status: "공개 중",
    gradient: "from-blue-100 via-slate-100 to-white",
    description: "조용한 도시에서 서로의 문장을 발견하는 이야기",
  },
  {
    id: "voices-void",
    title: "Voices in the Void",
    author: "Marcus Chen",
    chapters: 3,
    status: "공개 예정",
    gradient: "from-violet-100 via-slate-100 to-white",
    description: "우주 공간에서 들려오는 작은 목소리와 선택",
  },
  {
    id: "last-garden",
    title: "The Last Garden",
    author: "Sofia Ramirez",
    chapters: 3,
    status: "공개 중",
    gradient: "from-emerald-100 via-slate-100 to-white",
    description: "마지막 정원을 지키는 사람들의 따뜻한 기록",
  },
];

export const sentenceComments = [
  {
    sentence: "봄비가 창문을 두드리자, 오래된 기억이 천천히 깨어났다.",
    comments: ["이 문장이 책의 분위기를 잘 보여줘요.", "비 오는 날 읽으면 더 몰입될 것 같아요."]
  },
  {
    sentence: "그는 아무 말 없이 책장을 넘겼고, 음악은 조용히 방 안을 채웠다.",
    comments: ["이 부분에 잔잔한 피아노 음악을 추천하고 싶어요."]
  },
  {
    sentence: "누군가의 밑줄은 또 다른 독자에게 작은 길이 되었다.",
    comments: ["문장별 댓글 기능과 잘 어울리는 핵심 문장입니다."]
  }
];

export const playlists = [
  { title: "Rainy Day Reading", likes: 128, mood: "잔잔함", song: "Spring Day - 클래식 독서 배경음" },
  { title: "Deep Focus", likes: 94, mood: "집중", song: "Soft Piano Loop" },
  { title: "Night Library", likes: 76, mood: "밤", song: "Midnight Ambient" }
];

export const authorBooks = [
  {
    id: "silent-echo",
    title: "봄날의 소나타",
    summary: "봄날 비슷한 일상 속에서 펼쳐지는 한 명의 감정적인 이야기",
    chapters: 12,
    views: 2045,
    status: "공개",
    tag: "로맨스",
  },
  {
    id: "last-garden",
    title: "밤하늘의 별",
    summary: "어둠 속에서 빛나는 희망의 이야기",
    chapters: 5,
    views: 879,
    status: "비공개",
    tag: "판타지",
  },
];
