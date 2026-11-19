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
          <stop offset="0%" stopColor="#B38748" />
          <stop offset="50%" stopColor="#DFC082" />
          <stop offset="100%" stopColor="#A87C3D" />
        </linearGradient>
        <linearGradient id="cornerJadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8FD4C1" />
          <stop offset="50%" stopColor="#45A38E" />
          <stop offset="100%" stopColor="#197363" />
        </linearGradient>
      </defs>
      <path
        d="M 0,48 C 0,20 18,4 46,4 C 58,4 68,10 74,18 C 82,8 96,2 112,4 C 128,6 138,18 136,32 C 134,44 122,50 110,48 C 102,46 96,40 94,34 C 88,42 76,46 64,44 C 54,54 44,62 34,76 C 40,86 38,100 28,108 C 16,116 2,110 -2,96 C -6,82 2,66 0,48 Z"
        fill="url(#cornerGoldGrad)"
        stroke="#9C7134"
        strokeWidth="1.5"
      />
      <path
        d="M 6,46 C 6,24 22,10 46,10 C 57,10 66,15 71,23 C 79,13 92,8 106,10 C 120,12 128,21 126,31 C 124,40 115,44 106,42 C 99,40 94,35 92,29 C 86,37 74,40 62,38 C 50,48 40,58 30,72 C 35,81 33,93 24,100 C 15,106 4,101 2,90 C 0,78 6,62 6,46 Z"
        fill="url(#cornerJadeGrad)"
        stroke="#146354"
        strokeWidth="1.2"
      />
      <path
        d="M 16,42 C 16,26 28,16 46,16 C 56,16 64,21 67,29 C 61,34 51,35 43,31 C 36,28 28,32 28,40 C 28,47 35,52 42,50 C 33,58 25,68 20,80 C 14,72 16,56 16,42 Z"
        fill="#C4EFE2"
        opacity="0.85"
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
      <svg
        viewBox="0 0 1440 810"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="uiBgSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCEAD6" />
            <stop offset="38%" stopColor="#F7EEDF" />
            <stop offset="72%" stopColor="#D5EBE4" />
            <stop offset="100%" stopColor="#9CC9BE" />
          </linearGradient>
          <radialGradient id="uiSunGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F3A671" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#F7C59F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FCEAD6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="uiMtnFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9BC5BC" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#CFE6E0" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="uiMtnMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#68A69A" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#B7DBD3" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="uiRockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A7C73" />
            <stop offset="60%" stopColor="#2F5B54" />
            <stop offset="100%" stopColor="#1E3F3A" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="810" fill="url(#uiBgSkyGrad)" />
        <circle cx="1165" cy="120" r="140" fill="url(#uiSunGlowGrad)" />
        <circle cx="1165" cy="120" r="54" fill="#F7BA86" opacity="0.55" />

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
          fill="#C4E3DC"
          opacity="0.55"
        />
        <path
          d="M 0,725 C 320,690 660,735 1020,705 C 1220,690 1350,705 1440,695 L 1440,810 L 0,810 Z"
          fill="#99C7BC"
          opacity="0.45"
        />
        <g transform="translate(-15, 515)" opacity="0.72">
          <path
            d="M 0,54 C 20,32 52,28 76,40 C 94,18 132,16 154,36 C 176,28 204,40 208,60 L 0,60 Z"
            fill="#FBF5E9"
          />
        </g>
        <g transform="translate(1225, 520)" opacity="0.7">
          <path
            d="M 10,56 C 28,34 58,30 82,42 C 100,20 136,20 158,38 C 180,32 204,42 208,58 L 10,58 Z"
            fill="#FBF5E9"
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
            fill="#639B90"
            opacity="0.55"
          />
          <path
            d="M 140,190 L 162,142 L 204,132 L 248,162 L 265,190 Z"
            fill="#285049"
          />
        </g>
        <g transform="translate(1440, 630) scale(-1, 1)">
          <path
            d="M -10,185 L -10,72 L 28,44 L 72,58 L 116,104 L 160,130 L 198,185 Z"
            fill="url(#uiRockGrad)"
          />
          <path
            d="M -10,72 L 28,44 L 54,96 L 16,130 L -10,115 Z"
            fill="#639B90"
            opacity="0.55"
          />
          <path
            d="M 126,185 L 150,140 L 192,130 L 235,160 L 252,185 Z"
            fill="#285049"
          />
        </g>

        {/* Bamboo Left & Right */}
        <g>
          <path
            d="M 16,810 Q 30,540 50,260 Q 62,110 80,-10"
            fill="none"
            stroke="#265C53"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M -6,420 Q 18,220 44,0"
            fill="none"
            stroke="#36756A"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <g fill="#1F594F">
            <path d="M 68,76 Q 108,68 138,88 Q 102,92 68,76 Z" />
            <path d="M 68,76 Q 104,92 126,122 Q 90,110 68,76 Z" fill="#2E7367" />
            <path d="M 34,116 Q 72,112 100,132 Q 66,134 34,116 Z" fill="#3B8578" />
            <path d="M 52,240 Q 88,232 112,252 Q 82,256 52,240 Z" fill="#2E7367" />
            <path d="M 28,620 Q 66,605 96,620 Q 62,630 28,620 Z" />
          </g>
        </g>
        <g>
          <path
            d="M 1426,810 Q 1412,550 1392,270 Q 1380,115 1362,-10"
            fill="none"
            stroke="#265C53"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d="M 1446,390 Q 1424,200 1398,-10"
            fill="none"
            stroke="#36756A"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g fill="#1F594F">
            <path d="M 1372,70 Q 1332,62 1302,82 Q 1338,86 1372,70 Z" />
            <path d="M 1372,70 Q 1336,86 1314,116 Q 1350,104 1372,70 Z" fill="#2E7367" />
            <path d="M 1408,120 Q 1370,116 1342,136 Q 1376,138 1408,120 Z" fill="#3B8578" />
            <path d="M 1386,230 Q 1350,222 1326,242 Q 1356,246 1386,230 Z" fill="#2E7367" />
            <path d="M 1412,610 Q 1374,595 1344,610 Q 1378,620 1412,610 Z" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function ParchmentCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[1296px] rounded-[18px] border-[3px] border-parchment-border bg-gradient-to-b from-[#FDF9F0] to-[#F7EFE1] shadow-[0_14px_38px_rgba(20,56,52,0.16)]">
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

export function BottomStageStepper({ activeStep }: { activeStep: 1 | 2 | 3 | 4 }) {
  const steps = [1, 2, 3, 4] as const;

  return (
    <nav
      aria-label="Tahapan Tes"
      className="mx-auto mt-6 flex max-w-[480px] items-center justify-center px-4 pb-4"
    >
      {steps.map((step, idx) => {
        const isActive = step === activeStep;
        const isDone = step < activeStep;

        return (
          <React.Fragment key={step}>
            <div className="relative flex items-center justify-center">
              {isActive && (
                <span className="absolute -inset-1.5 rounded-full border border-jade-700/40" />
              )}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-serif text-[15px] font-bold transition-colors ${
                  isActive
                    ? "border-[#0A584B] bg-jade-700 text-white shadow-sm"
                    : isDone
                    ? "border-jade-700 bg-jade-50 text-jade-700"
                    : "border-[#C2B69F] bg-[#FBF7EC] text-[#4A5D5E]"
                }`}
              >
                0{step}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`h-[2px] flex-1 transition-colors ${
                  step < activeStep ? "bg-jade-600" : "bg-[#AECCC4]"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
