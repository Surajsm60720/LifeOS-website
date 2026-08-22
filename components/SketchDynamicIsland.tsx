import styles from "./SketchDynamicIsland.module.css";

/**
 * Three stages: idle (just the two sensor cutouts — the camera and the
 * smaller proximity/light sensor beside it, the real hardware layout of
 * a narrow bare pill with no Live Activity content yet), then a
 * horizontal-only widen as the activity starts and its leading icon and
 * trailing count populate, then the press-and-hold expand — wider AND
 * taller this time — into the full card. The two sensors are physical:
 * fixed position, always visible, unaffected by any of it.
 */
export function SketchDynamicIsland({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 200 170" fill="none">
        <rect className={styles.pill} x="76" y="14" width="48" height="26" rx="13" />

        <circle className={styles.sensor} cx="106" cy="27" r="4" />
        <ellipse className={styles.sensor} cx="88" cy="27" rx="5" ry="3.8" />

        <g className={styles.leadingIcon} strokeWidth="1.8">
          <line x1="58" y1="23" x2="70" y2="23" />
          <line x1="58" y1="27" x2="68" y2="27" />
          <line x1="58" y1="31" x2="70" y2="31" />
        </g>

        <text className={styles.count} x="122" y="33">
          3
        </text>

        <line className={styles.divider} x1="34" y1="44" x2="170" y2="44" strokeWidth="1.4" />

        <g className={`${styles.row} ${styles.row1}`}>
          <circle cx="38" cy="66" r="5" className={styles.dotIrl} />
          <line x1="50" y1="66" x2="108" y2="66" strokeWidth="3" />
          <line x1="150" y1="66" x2="166" y2="66" strokeWidth="2.4" className={styles.time} />
        </g>
        <g className={`${styles.row} ${styles.row2}`}>
          <circle cx="38" cy="88" r="5" className={styles.dotGame} />
          <line x1="50" y1="88" x2="94" y2="88" strokeWidth="3" />
          <line x1="150" y1="88" x2="166" y2="88" strokeWidth="2.4" className={styles.time} />
        </g>
        <g className={`${styles.row} ${styles.row3}`}>
          <circle cx="38" cy="110" r="5" className={styles.dotEnt} />
          <line x1="50" y1="110" x2="118" y2="110" strokeWidth="3" />
          <line x1="150" y1="110" x2="166" y2="110" strokeWidth="2.4" className={styles.time} />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
