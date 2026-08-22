import styles from "./SketchDynamicIsland.module.css";

/**
 * Same three-stage animation as before — compact, glance, press-and-hold
 * full card — refined against how the real thing is actually built:
 *
 *  - the Island is near-black, not card-gray; it reads as a cutout in
 *    the display, not a UI panel;
 *  - the camera sits right-of-centre, not centred — the earpiece
 *    pushes it there on the real hardware — and never moves or hides,
 *    because it's physically always there regardless of what content
 *    is showing around it;
 *  - the leading glyph is asymmetric (one icon, not two mirrored ones)
 *    and persists from the glance stage straight into the expanded
 *    header, the way a real Live Activity's leading icon doesn't
 *    disappear when you press and hold — only the trailing count gets
 *    replaced, by the row list, once expanded.
 */
export function SketchDynamicIsland({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 200 170" fill="none">
        <rect className={styles.pill} x="82" y="14" width="36" height="26" rx="13" />

        <circle className={styles.sensor} cx="108" cy="27" r="4" />

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
