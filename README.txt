배포 전 꼭 해야 할 일
========================

1) 도메인 연결 후, 아래 파일에서 example.com을 실제 도메인으로 전부 바꾸기
   - index.html, passport.html, civil-exam.html, resume.html,
     intl-license.html, custom.html 의 <link rel="canonical" ...>
   - sitemap.xml, robots.txt

2) Cloudflare Pages 배포
   - Cloudflare 대시보드 → Workers & Pages → Create → Pages
   - 이 site 폴더를 그대로 업로드 (또는 GitHub 저장소 연결)
   - 배포 후 무료 서브도메인(xxx.pages.dev)이 먼저 생김
   - 도메인을 구매했다면 Custom domains 메뉴에서 연결

3) 구글 서치콘솔 등록
   - https://search.google.com/search-console
   - 도메인 소유 확인 후 sitemap.xml 제출 (설정 > Sitemaps)

4) 네이버 서치어드바이저 등록  (구글과 별개로 반드시 필요)
   - https://searchadvisor.naver.com
   - 사이트 등록 → 소유 확인 → 요청 > 사이트 최적화 도구에서
     사이트맵 제출 + RSS/robots.txt 확인

5) 애드센스 승인 신청
   - 콘텐츠(각 페이지 하단 설명글) + 트래픽이 어느 정도 쌓인 뒤 신청 권장
   - 승인 후 발급되는 코드에서 pub-XXXXXXXXXXXXXXXX 값을 찾아
     아래 두 곳에 반영:
       a) 이 폴더에 ads.txt 파일 생성 (예시는 ads.txt.example 참고)
       b) 각 페이지 <div class="ad-slot">...</div> 부분을
          애드센스에서 제공하는 <ins class="adsbygoogle">...</ins> 코드로 교체
   - 승인 전에는 ad-slot 자리를 비워두거나 지금처럼 안내 문구만 남겨두세요
     (승인 전 광고 코드를 미리 넣으면 정책 위반으로 계정 자체가 거절될 수 있습니다)

6) 초기 트래픽
   - 클리앙, 오늘의유머, 관련 카페 등에 자연스럽게 공유
   - 새 도메인은 인덱싱까지 보통 몇 주 걸리므로 콘텐츠를 꾸준히 보강하세요
