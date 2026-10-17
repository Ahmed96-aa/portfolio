import { memo } from 'react';
import { cx } from '../../lib/cx';
import s from './Brand.module.css';

/**
 * A guilloche band — the woven line-work of banknotes and security printing, a nod to Ahmed's
 * data-security background. Polar curves r(θ) = R + A·sin(p·θ + 2πk/n), k = 0…n-1, drawn as one path.
 */
function band(R: number, A: number, petals: number, strands: number, perPetal = 12): string {
  const steps = petals * perPetal;
  let d = '';
  for (let k = 0; k < strands; k++) {
    const phase = (2 * Math.PI * k) / strands;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r = R + A * Math.sin(petals * th + phase);
      d += `${i === 0 ? 'M' : 'L'}${(r * Math.cos(th)).toFixed(1)} ${(r * Math.sin(th)).toFixed(1)}`;
    }
    d += 'Z';
  }
  return d;
}

const BANDS = [
  { d: band(83, 11, 22, 10), o: 1 },
  { d: band(57, 9, 15, 8), o: 0.82 },
  { d: band(33, 7, 9, 6), o: 0.66 },
];

/** Shared SVG definitions, rendered once and reused with <use>. */
export const BrandDefs = memo(function BrandDefs() {
  return (
    <svg width="0" height="0" className={s.defs} aria-hidden focusable="false">
      <defs>
        <symbol id="guilloche" viewBox="-100 -100 200 200">
          <g fill="none" stroke="currentColor">
            <circle r="98.5" vectorEffect="non-scaling-stroke" />
            <circle r="96" vectorEffect="non-scaling-stroke" opacity="0.6" />
            {BANDS.map((b, i) => (
              <path key={i} d={b.d} opacity={b.o} vectorEffect="non-scaling-stroke" />
            ))}
            <circle r="20" vectorEffect="non-scaling-stroke" opacity="0.7" />
            <circle r="17.5" vectorEffect="non-scaling-stroke" opacity="0.45" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
});

export function Guilloche({ className, spin }: { className?: string; spin?: boolean }) {
  return (
    <svg className={cx(s.guilloche, spin && s.spin, className)} viewBox="-100 -100 200 200" aria-hidden focusable="false">
      <use href="#guilloche" />
    </svg>
  );
}

/**
 * The brand mark — the shared first letter of «أحمد» and «Ahmed». The mint stem is at once the alef,
 * the A's left leg and an editor's caret; the hamza sits above it (gold, with the Arabic). Sized by font-size (1em tall).
 */
export function Monogram({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      className={cx(s.monogram, className)}
      viewBox="2171.2 -1102.1 699.6 1162.1"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path className={s.latin} d="M2305.5 -730L2465.8 -730L2810.8 0L2650.5 0ZM2405.8 -285L2535.8 -285L2592.5 -165L2405.8 -165Z" />
      <path className={s.stem} d="M2275.8 0L2425.8 0L2425.8 -730L2275.8 -730Z" />
      <path
        className={s.arabic}
        d="M2231.2 -850.4 2294.9 -860.4Q2272.5 -872.1 2258.7 -891.9Q2245 -911.7 2245 -937.6Q2245 -987.1 2279.2 -1014.6Q2313.3 -1042.1 2370 -1042.1Q2424.5 -1042.1 2461.3 -1021.9L2439.2 -964.4Q2424.8 -972.3 2409.5 -975.7Q2394.2 -979.2 2377.9 -979.2Q2352.6 -979.2 2337.3 -964.3Q2321.9 -949.5 2321.9 -923.4Q2321.9 -904.8 2331.7 -891.5Q2341.5 -878.2 2356.4 -871.3Q2385.2 -876.8 2406.7 -879.7Q2428.3 -882.6 2443.9 -884.4Q2459.5 -886.2 2470.5 -886.2V-821.3Q2449.6 -820.1 2414.2 -816.3Q2378.8 -812.4 2340.5 -808Q2302.1 -803.6 2272.1 -799.5Q2242.1 -795.4 2231.2 -792.7Z"
      />
    </svg>
  );
}

/**
 * The full wordmark: «أحمد» reads leftward and «Ahmed» rightward from the shared first letter.
 * Sized by font-size (1em tall); below ~120 px wide, use <Monogram /> instead.
 */
export function Logo({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      className={cx(s.logo, className)}
      viewBox="-68.2 -1162.1 5358.1 1292.1"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path className={s.arabic} d="M51.7 -130H435.7Q424.7 -183.1 410.6 -227.1Q396.6 -271.1 379.1 -305Q344.8 -372.8 292.4 -423.1Q240 -473.4 164.1 -507.9L223.9 -656.7Q323 -615.5 396.4 -544.8Q469.8 -474 519.3 -371.4Q568.7 -268.8 595.8 -130H742.6Q748.4 -130 748.4 -125.4V-5.8Q748.4 0 742.6 0H51.7Z M863.4 -130Q847.4 -169.1 838.9 -210.3Q830.5 -251.5 830.5 -295Q830.5 -344.6 846.1 -400.7Q861.7 -456.8 886.3 -498Q939.4 -530.8 1000.7 -548.1Q1062.1 -565.4 1111.1 -565.4Q1149.7 -565.4 1184.7 -557Q1219.8 -548.6 1251.1 -532.5Q1313.7 -499.3 1348.3 -438.3Q1383 -377.2 1383 -296.9Q1383 -263.9 1377.7 -233.8Q1372.4 -203.8 1360.7 -175.6Q1382 -150.3 1409.6 -140.2Q1437.2 -130 1479.1 -130H1484.9Q1490.6 -130 1490.6 -125.4V-5.8Q1490.6 0 1484.9 0H1479.1Q1418.2 0 1373.6 -17.2Q1329.1 -34.3 1289.8 -76.7Q1247.2 -38.7 1191.7 -19.4Q1136.2 0 1077.6 0H731.4Q725.6 0 725.6 -5.8V-125.4Q725.6 -130 731.4 -130ZM980 -278.1Q980 -245.3 987.3 -208.4Q994.6 -171.6 1009.4 -130H1059.3Q1106.3 -130 1142.8 -151.7Q1179.3 -173.3 1200.6 -211.5Q1221.9 -249.8 1221.9 -297.1Q1221.9 -359.9 1190.4 -397.8Q1158.8 -435.6 1108.2 -435.6Q1081 -435.6 1052.7 -426.7Q1024.3 -417.8 996.7 -401Q988.5 -372 984.3 -341.4Q980 -310.9 980 -278.1Z M1473.1 0Q1467.4 0 1467.4 -5.8V-125.4Q1467.4 -131 1473.1 -131H1941.6Q1919.7 -150.9 1902.4 -194.1Q1885 -237.3 1872 -302.1Q1861.4 -357.3 1844.7 -389.2Q1827.9 -421.1 1801.3 -435Q1774.6 -448.8 1732.8 -448.8Q1692.8 -448.8 1656.1 -438.3Q1619.4 -427.8 1577.6 -404.8L1527.8 -523.5Q1578.2 -551.8 1636.9 -565.3Q1695.7 -578.8 1762.8 -578.8Q1794.6 -578.8 1822 -575.4Q1849.4 -572 1872.4 -563.1Q1934.1 -541.7 1970.3 -492.3Q2006.4 -443 2021.4 -353.5Q2031.9 -295.2 2044.1 -250.9Q2056.2 -206.7 2071.3 -176.8Q2086.3 -146.9 2102.8 -129.6V0ZM2231.2 -850.4 2294.9 -860.4Q2272.5 -872.1 2258.7 -891.9Q2245 -911.7 2245 -937.6Q2245 -987.1 2279.2 -1014.6Q2313.3 -1042.1 2370 -1042.1Q2424.5 -1042.1 2461.3 -1021.9L2439.2 -964.4Q2424.8 -972.3 2409.5 -975.7Q2394.2 -979.2 2377.9 -979.2Q2352.6 -979.2 2337.3 -964.3Q2321.9 -949.5 2321.9 -923.4Q2321.9 -904.8 2331.7 -891.5Q2341.5 -878.2 2356.4 -871.3Q2385.2 -876.8 2406.7 -879.7Q2428.3 -882.6 2443.9 -884.4Q2459.5 -886.2 2470.5 -886.2V-821.3Q2449.6 -820.1 2414.2 -816.3Q2378.8 -812.4 2340.5 -808Q2302.1 -803.6 2272.1 -799.5Q2242.1 -795.4 2231.2 -792.7Z" />
      <path className={s.stem} d="M2275.8 0 L2425.8 0 L2425.8 -730 L2275.8 -730 Z" />
      <path className={s.latin} d="M2305.5 -730 L2465.8 -730 L2810.8 0 L2650.5 0 Z M2405.8 -285 L2535.8 -285 L2592.5 -165 L2405.8 -165 ZM2901.8 0V-730H3051.8V-550L3046.8 -445H3090.8L3046.8 -410Q3046.8 -480 3086.8 -520Q3126.8 -560 3194.8 -560Q3274.8 -560 3323.3 -504Q3371.8 -448 3371.8 -355V0H3221.8V-340Q3221.8 -383 3199.3 -406.5Q3176.8 -430 3135.8 -430Q3095.8 -430 3073.8 -406.5Q3051.8 -383 3051.8 -340V0Z M3477.8 0V-550H3595.8V-470H3619.8L3600.8 -456Q3600.8 -503 3627.8 -531.5Q3654.8 -560 3694.8 -560Q3737.8 -560 3761.8 -523Q3785.8 -486 3785.8 -425L3767.8 -470H3795.8L3786.8 -456Q3786.8 -503 3812.8 -531.5Q3838.8 -560 3882.8 -560Q3932.8 -560 3963.8 -522.5Q3994.8 -485 3994.8 -420V0H3865.8V-410Q3865.8 -433 3855.8 -445.5Q3845.8 -458 3826.8 -458Q3807.8 -458 3797.8 -445.5Q3787.8 -433 3787.8 -410V0H3684.8V-410Q3684.8 -433 3674.8 -445.5Q3664.8 -458 3645.8 -458Q3626.8 -458 3616.8 -445.5Q3606.8 -433 3606.8 -410V0Z M4336.9 10Q4263.9 10 4209.4 -17.5Q4154.9 -45 4125.4 -94.5Q4095.8 -144 4095.8 -210V-340Q4095.8 -406 4125.4 -455.5Q4154.9 -505 4209.4 -532.5Q4263.9 -560 4336.9 -560Q4409.9 -560 4463.4 -532.5Q4516.9 -505 4546.4 -455.5Q4575.9 -406 4575.9 -340V-240H4238.9V-210Q4238.9 -158 4263.9 -131.5Q4288.9 -105 4338.9 -105Q4373.9 -105 4395.4 -117Q4416.9 -129 4423.9 -150H4570.9Q4552.9 -78 4489.4 -34Q4425.9 10 4336.9 10ZM4432.9 -317V-342Q4432.9 -393 4409.4 -420Q4385.9 -447 4336.9 -447Q4287.9 -447 4263.4 -419Q4238.9 -391 4238.9 -340V-325L4442.9 -327Z M4878.9 10Q4795.9 10 4745.9 -48Q4695.9 -106 4695.9 -205V-345Q4695.9 -443 4745.9 -501.5Q4795.9 -560 4878.9 -560Q4946.9 -560 4985.9 -520.5Q5024.9 -481 5024.9 -410L4989.9 -445H5024.9L5019.9 -580V-730H5169.9V0H5024.9V-105H4989.9L5024.9 -140Q5024.9 -69 4985.9 -29.5Q4946.9 10 4878.9 10ZM4932.9 -120Q4973.9 -120 4996.9 -143.5Q5019.9 -167 5019.9 -210V-340Q5019.9 -383 4996.9 -406.5Q4973.9 -430 4932.9 -430Q4890.9 -430 4868.4 -406.5Q4845.9 -383 4845.9 -340V-210Q4845.9 -167 4868.4 -143.5Q4890.9 -120 4932.9 -120Z" />
    </svg>
  );
}
