"use client";

import React from "react";

function CloudCornerOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-10 -4 150 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cornerGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B38A4E" />
          <stop offset="50%" stopColor="#DFC389" />
          <stop offset="100%" stopColor="#A67E44" />
        </linearGradient>
        <linearGradient id="cornerJadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9EBEE0" />
          <stop offset="50%" stopColor="#527EAE" />
          <stop offset="100%" stopColor="#244B78" />
        </linearGradient>
      </defs>
      <path
        d="M 0,48 C 0,20 18,4 46,4 C 58,4 68,10 74,18 C 82,8 96,2 112,4 C 128,6 138,18 136,32 C 134,44 122,50 110,48 C 102,46 96,40 94,34 C 88,42 76,46 64,44 C 54,54 44,62 34,76 C 40,86 38,100 28,108 C 16,116 2,110 -2,96 C -6,82 2,66 0,48 Z"
        fill="url(#cornerGoldGrad)"
        stroke="#9A7239"
        strokeWidth="1.5"
      />
      <path
        d="M 6,46 C 6,24 22,10 46,10 C 57,10 66,15 71,23 C 79,13 92,8 106,10 C 120,12 128,21 126,31 C 124,40 115,44 106,42 C 99,40 94,35 92,29 C 86,37 74,40 62,38 C 50,48 40,58 30,72 C 35,81 33,93 24,100 C 15,106 4,101 2,90 C 0,78 6,62 6,46 Z"
        fill="url(#cornerJadeGrad)"
        stroke="#1B3A5E"
        strokeWidth="1.2"
      />
      <path
        d="M 16,42 C 16,26 28,16 46,16 C 56,16 64,21 67,29 C 61,34 51,35 43,31 C 36,28 28,32 28,40 C 28,47 35,52 42,50 C 33,58 25,68 20,80 C 14,72 16,56 16,42 Z"
        fill="#D9E8F7"
        opacity="0.88"
      />
      <path
        d="M 24,36 C 26,24 38,20 48,24 C 56,27 58,36 50,41 C 43,45 35,41 36,34"
        stroke="#F4DFB0"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 78,24 C 84,16 98,14 108,19 C 115,23 116,32 108,35 C 101,37 96,33 98,27"
        stroke="#F4DFB0"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="18" cy="86" r="6" fill="#E5C478" stroke="#9C7134" strokeWidth="1.2" />
    </svg>
  );
}

export function OrientLandscapeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Desktop & Tablet Landscape Shanshui Backdrop */}
      <svg
        viewBox="0 0 1440 810"
        preserveAspectRatio="xMidYMid slice"
        className="hidden h-full w-full md:block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="uiBgSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBF0E4" />
            <stop offset="36%" stopColor="#F4F3F0" />
            <stop offset="70%" stopColor="#D8E4F0" />
            <stop offset="100%" stopColor="#ADC3DB" />
          </linearGradient>
          <radialGradient id="uiSunGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F0B47E" stopOpacity="0.72" />
            <stop offset="45%" stopColor="#F5CCA4" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#FBF0E4" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="uiMtnFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9CB3CB" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#D3DFEC" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="uiMtnMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6888AB" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#BDD0E3" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="uiRockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4E6E91" />
            <stop offset="60%" stopColor="#314D6B" />
            <stop offset="100%" stopColor="#1E334A" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="810" fill="url(#uiBgSkyGrad)" />
        <circle cx="1165" cy="120" r="140" fill="url(#uiSunGlowGrad)" />
        <circle cx="1165" cy="120" r="54" fill="#F5C18E" opacity="0.52" />

        {/* Distant & Mid Mountains */}
        <path
          d="M -20,560 L 45,420 C 65,380 95,382 115,420 L 165,515 L 220,445 C 240,420 265,422 285,450 L 370,575 L -20,575 Z"
          fill="url(#uiMtnFarGrad)"
        />
        <path
          d="M 1050,575 L 1145,455 C 1168,425 1195,428 1215,460 L 1260,525 L 1325,405 C 1348,365 1380,368 1402,410 L 1460,540 L 1460,585 L 1050,585 Z"
          fill="url(#uiMtnFarGrad)"
        />
        <path
          d="M -20,650 L 20,510 C 40,465 72,468 94,512 L 155,610 L 205,540 C 222,516 248,518 266,545 L 340,660 L -20,660 Z"
          fill="url(#uiMtnMidGrad)"
        />
        <path
          d="M 1110,660 L 1195,535 C 1215,505 1242,508 1262,538 L 1310,605 L 1375,495 C 1395,462 1422,465 1440,500 L 1460,660 Z"
          fill="url(#uiMtnMidGrad)"
        />

        {/* Mist & Minimal Clouds */}
        <path
          d="M 0,665 C 240,625 480,685 740,655 C 1020,625 1240,665 1440,635 L 1440,810 L 0,810 Z"
          fill="#CBDCEE"
          opacity="0.55"
        />
        <path
          d="M 0,725 C 320,690 660,735 1020,705 C 1220,690 1350,705 1440,695 L 1440,810 L 0,810 Z"
          fill="#A9C0D9"
          opacity="0.45"
        />
        <g transform="translate(-15, 515)" opacity="0.75">
          <path
            d="M 0,54 C 20,32 52,28 76,40 C 94,18 132,16 154,36 C 176,28 204,40 208,60 L 0,60 Z"
            fill="#FBF8F2"
          />
        </g>
        <g transform="translate(1225, 520)" opacity="0.72">
          <path
            d="M 10,56 C 28,34 58,30 82,42 C 100,20 136,20 158,38 C 180,32 204,42 208,58 L 10,58 Z"
            fill="#FBF8F2"
          />
        </g>

        {/* Left & Right Corner Rocks */}
        <g transform="translate(0, 625)">
          <path
            d="M -10,190 L -10,65 L 32,38 L 78,52 L 122,98 L 168,122 L 210,165 L 225,190 Z"
            fill="url(#uiRockGrad)"
          />
          <path
            d="M -10,65 L 32,38 L 58,92 L 18,128 L -10,110 Z"
            fill="#6A8BAE"
            opacity="0.55"
          />
          <path
            d="M 140,190 L 162,142 L 204,132 L 248,162 L 265,190 Z"
            fill="#253D56"
          />
        </g>
        <g transform="translate(1440, 630) scale(-1, 1)">
          <path
            d="M -10,185 L -10,72 L 28,44 L 72,58 L 116,104 L 160,130 L 198,185 Z"
            fill="url(#uiRockGrad)"
          />
          <path
            d="M -10,72 L 28,44 L 54,96 L 16,130 L -10,115 Z"
            fill="#6A8BAE"
            opacity="0.55"
          />
          <path
            d="M 126,185 L 150,140 L 192,130 L 235,160 L 252,185 Z"
            fill="#253D56"
          />
        </g>

        {/* Bamboo Left & Right */}
        <g>
          <path
            d="M 16,810 Q 30,540 50,260 Q 62,110 80,-10"
            fill="none"
            stroke="#294666"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M -6,420 Q 18,220 44,0"
            fill="none"
            stroke="#3F6285"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <g fill="#213C59">
            <path d="M 68,76 Q 108,68 138,88 Q 102,92 68,76 Z" />
            <path d="M 68,76 Q 104,92 126,122 Q 90,110 68,76 Z" fill="#325375" />
            <path d="M 34,116 Q 72,112 100,132 Q 66,134 34,116 Z" fill="#456B8F" />
            <path d="M 52,240 Q 88,232 112,252 Q 82,256 52,240 Z" fill="#325375" />
            <path d="M 28,620 Q 66,605 96,620 Q 62,630 28,620 Z" />
          </g>
        </g>
        <g>
          <path
            d="M 1426,810 Q 1412,550 1392,270 Q 1380,115 1362,-10"
            fill="none"
            stroke="#294666"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d="M 1446,390 Q 1424,200 1398,-10"
            fill="none"
            stroke="#3F6285"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g fill="#213C59">
            <path d="M 1372,70 Q 1332,62 1302,82 Q 1338,86 1372,70 Z" />
            <path d="M 1372,70 Q 1336,86 1314,116 Q 1350,104 1372,70 Z" fill="#325375" />
            <path d="M 1408,120 Q 1370,116 1342,136 Q 1376,138 1408,120 Z" fill="#456B8F" />
            <path d="M 1386,230 Q 1350,222 1326,242 Q 1356,246 1386,230 Z" fill="#325375" />
            <path d="M 1412,610 Q 1374,595 1344,610 Q 1378,620 1412,610 Z" />
          </g>
        </g>
      </svg>

      {/* Mobile Portrait Shanshui Backdrop */}
      <div
        className="relative block h-full w-full md:hidden"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, #FCEAD4 0%, #F6EDE2 20%, #E7EEF5 46%, #C5D7EA 74%, #95B2D1 100%)",
        }}
      >
        {/* Warm top-right sun aura & lower cool indigo depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 88% 8%, rgba(242, 182, 126, 0.55) 0%, rgba(245, 204, 164, 0.24) 26%, rgba(252, 234, 212, 0) 56%), radial-gradient(ellipse at 12% 92%, rgba(49, 77, 107, 0.24) 0%, transparent 48%), radial-gradient(ellipse at 88% 92%, rgba(49, 77, 107, 0.24) 0%, transparent 48%)",
          }}
        />

        {/* Top-anchored Sun, Cloud Wisp & Bamboo Sprig (never cropped on short screens) */}
        <svg
          viewBox="0 0 430 165"
          preserveAspectRatio="xMidYMin slice"
          className="absolute inset-x-0 top-0 aspect-[86/33] max-h-[30vh] w-full"
        >
          <defs>
            <radialGradient id="mTopSunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EFAC70" stopOpacity="0.78" />
              <stop offset="45%" stopColor="#F4C79C" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#FCEAD4" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="378" cy="48" r="96" fill="url(#mTopSunGlow)" />
          <circle cx="378" cy="48" r="28" fill="#F5BE88" opacity="0.58" />

          {/* Upper sky cloud wisp */}
          <path
            d="M 232,76 C 254,64 282,64 302,72 C 318,58 348,58 366,70 C 384,66 402,72 406,82 L 226,82 Z"
            fill="#FBF8F2"
            opacity="0.68"
          />

          {/* Top-left delicate bamboo */}
          <g opacity="0.86">
            <path
              d="M 22,-6 Q 15,52 -4,116"
              fill="none"
              stroke="#2B4969"
              strokeWidth="4.6"
              strokeLinecap="round"
            />
            <path
              d="M 4,-6 Q -1,36 -8,72"
              fill="none"
              stroke="#456B8F"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path d="M 17,22 Q 46,15 66,29 Q 42,33 17,22 Z" fill="#213C59" />
            <path d="M 17,22 Q 43,34 57,54 Q 33,46 17,22 Z" fill="#325375" />
            <path d="M 9,56 Q 36,52 52,66 Q 30,68 9,56 Z" fill="#456B8F" />
            <path d="M 3,84 Q 26,82 40,94 Q 20,95 3,84 Z" fill="#325375" />
          </g>
        </svg>

        {/* Bottom-anchored Shanshui Mountains, Mist, Corner Rocks & Bamboo */}
        <svg
          viewBox="0 0 430 250"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-x-0 bottom-0 aspect-[43/25] max-h-[44vh] w-full"
        >
          <defs>
            <linearGradient id="mBotMtnFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86A2C1" stopOpacity="0.68" />
              <stop offset="100%" stopColor="#C9D9EB" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="mBotMtnMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#52769E" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#ACC3DC" stopOpacity="0.32" />
            </linearGradient>
            <linearGradient id="mBotRockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4E6E91" />
              <stop offset="58%" stopColor="#314D6B" />
              <stop offset="100%" stopColor="#1C3047" />
            </linearGradient>
            <linearGradient id="mBotWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D7E5F3" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#A1BCD8" stopOpacity="0.64" />
            </linearGradient>
          </defs>

          {/* Distant Layered Mountains */}
          <path
            d="M -14,175 L 34,62 C 50,28 74,30 92,64 L 138,136 L 182,88 C 198,70 218,74 236,102 L 284,175 Z"
            fill="url(#mBotMtnFarGrad)"
          />
          <path
            d="M 168,176 L 236,84 C 254,58 278,60 294,88 L 330,136 L 382,36 C 400,6 422,8 438,44 L 444,176 Z"
            fill="url(#mBotMtnFarGrad)"
          />

          {/* Mid-ground Shanshui Peaks */}
          <path
            d="M -14,225 L 22,116 C 38,82 64,84 82,116 L 134,186 L 176,144 C 192,128 212,130 228,154 L 274,225 Z"
            fill="url(#mBotMtnMidGrad)"
          />
          <path
            d="M 206,226 L 272,138 C 288,114 310,116 326,140 L 362,184 L 404,92 C 418,68 434,70 444,98 L 444,226 Z"
            fill="url(#mBotMtnMidGrad)"
          />

          {/* Soft Mountain-Waist Clouds */}
          <g transform="translate(-14, 118)" opacity="0.72">
            <path
              d="M 0,36 C 14,22 36,20 52,27 C 66,12 90,12 104,25 C 118,19 136,26 140,39 L 0,39 Z"
              fill="#FBF8F2"
            />
          </g>
          <g transform="translate(298, 112)" opacity="0.7">
            <path
              d="M 6,38 C 18,24 40,22 56,29 C 70,14 94,14 108,27 C 122,21 138,28 142,40 L 6,40 Z"
              fill="#FBF8F2"
            />
          </g>

          {/* Translucent Mist Waves (keeps mountain silhouettes visible behind stepper) */}
          <path
            d="M 0,168 C 96,148 192,184 288,162 C 350,148 396,166 430,156 L 430,250 L 0,250 Z"
            fill="url(#mBotWaterGrad)"
          />
          <path
            d="M 0,202 C 118,186 238,216 344,196 C 384,188 412,198 430,192 L 430,250 L 0,250 Z"
            fill="#B7CDE4"
            opacity="0.48"
          />

          {/* Bottom-Left & Bottom-Right Faceted Ink-Wash Rocks */}
          <g transform="translate(0, 152)">
            <path
              d="M -8,104 L -8,34 L 22,18 L 52,28 L 76,62 L 96,104 Z"
              fill="url(#mBotRockGrad)"
            />
            <path
              d="M -8,34 L 22,18 L 38,54 L 12,76 L -8,64 Z"
              fill="#6A8BAE"
              opacity="0.58"
            />
            <path d="M 54,104 L 70,74 L 96,70 L 116,104 Z" fill="#253D56" />
          </g>
          <g transform="translate(430, 154) scale(-1, 1)">
            <path
              d="M -8,102 L -8,36 L 20,20 L 50,30 L 74,64 L 94,102 Z"
              fill="url(#mBotRockGrad)"
            />
            <path
              d="M -8,36 L 20,20 L 36,54 L 10,76 L -8,66 Z"
              fill="#6A8BAE"
              opacity="0.58"
            />
            <path d="M 50,102 L 66,72 L 92,68 L 110,102 Z" fill="#253D56" />
          </g>

          {/* Lower Edge Bamboo Framing Corners */}
          <g opacity="0.92">
            <path
              d="M 10,254 Q 18,156 32,48"
              fill="none"
              stroke="#294666"
              strokeWidth="5.2"
              strokeLinecap="round"
            />
            <path
              d="M 2,210 Q 9,145 18,90"
              fill="none"
              stroke="#3F6285"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path d="M 30,62 Q 56,55 72,68 Q 50,72 30,62 Z" fill="#213C59" />
            <path d="M 30,62 Q 52,74 64,92 Q 42,84 30,62 Z" fill="#325375" />
            <path d="M 24,106 Q 48,100 64,114 Q 44,116 24,106 Z" fill="#456B8F" />
            <path d="M 16,158 Q 42,148 60,158 Q 38,166 16,158 Z" fill="#213C59" />
          </g>
          <g opacity="0.92">
            <path
              d="M 420,254 Q 412,154 398,42"
              fill="none"
              stroke="#294666"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 428,208 Q 421,144 412,88"
              fill="none"
              stroke="#3F6285"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path d="M 400,56 Q 374,49 358,62 Q 380,66 400,56 Z" fill="#213C59" />
            <path d="M 400,56 Q 378,68 366,86 Q 388,78 400,56 Z" fill="#325375" />
            <path d="M 406,100 Q 382,94 366,108 Q 386,110 406,100 Z" fill="#456B8F" />
            <path d="M 414,152 Q 388,142 370,152 Q 392,160 414,152 Z" fill="#213C59" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function ParchmentCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[1296px] rounded-[18px] border-[3px] border-parchment-border bg-gradient-to-b from-[#FDFBF6] to-[#F6F1E7] shadow-[0_14px_38px_rgba(22,39,61,0.16)]">
      {/* Inner Gold Hairline Border */}
      <div className="pointer-events-none absolute inset-[8px] rounded-[12px] border-[1.3px] border-parchment-hairline" />

      {/* 4 V1 Jade & Gold Cloud Corner Ornaments (visible md+) */}
      <CloudCornerOrnament className="pointer-events-none absolute -left-5 -top-4 z-20 hidden h-[96px] w-[120px] md:block" />
      <CloudCornerOrnament className="pointer-events-none absolute -right-5 -top-4 z-20 hidden h-[96px] w-[120px] -scale-x-100 md:block" />
      <CloudCornerOrnament className="pointer-events-none absolute -bottom-4 -left-5 z-20 hidden h-[96px] w-[120px] -scale-y-100 md:block" />
      <CloudCornerOrnament className="pointer-events-none absolute -bottom-4 -right-5 z-20 hidden h-[96px] w-[120px] -scale-x-100 -scale-y-100 md:block" />

      <div className="relative z-10 p-5 sm:p-7 md:px-10 md:py-8">{children}</div>
    </div>
  );
}

export function BottomStageStepper({
  activeStep,
  isPractice = false,
}: {
  activeStep: 1 | 2 | 3 | 4;
  isPractice?: boolean;
}) {
  const steps = [1, 2, 3, 4] as const;

  return (
    <nav
      aria-label="Tahapan Tes"
      className="mx-auto mt-6 flex max-w-[480px] items-center justify-center px-4 pb-4"
    >
      {steps.map((step, idx) => {
        const isActive = step === activeStep;
        const isDone = step < activeStep;
        const isPracticeActive = isActive && isPractice;

        return (
          <React.Fragment key={step}>
            <div className="relative flex items-center justify-center">
              {isActive && (
                <span
                  className={`absolute -inset-1.5 rounded-full border ${
                    isPracticeActive ? "border-[#B8863B]/55" : "border-jade-700/40"
                  }`}
                />
              )}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-serif text-[15px] font-bold transition-colors ${
                  isPracticeActive
                    ? "border-[#946828] bg-[#B8863B] text-white shadow-sm"
                    : isActive
                    ? "border-[#183454] bg-jade-700 text-white shadow-sm"
                    : isDone
                    ? "border-jade-700 bg-jade-50 text-jade-700"
                    : "border-[#C2B69F] bg-[#FBF7EC] text-[#45566B]"
                }`}
              >
                0{step}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`h-[2px] flex-1 transition-colors ${
                  step < activeStep ? "bg-jade-600" : "bg-[#B8CBE0]"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
