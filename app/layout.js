import "./globals.css";

export const metadata = {
  title: "TubeRadar",
  description: "YouTube 채널 분석 & 트렌드 탐색 도구",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
