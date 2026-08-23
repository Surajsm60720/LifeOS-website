import styles from "./SketchGitBranch.module.css";

/**
 * A git graph — trunk, a branch peeling off and merging back in — for
 * "clone the repo" rather than a generic folder or download glyph.
 */
export function SketchGitBranch({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 120 140" fill="none">
        <line className={styles.trunk} x1="40" y1="24" x2="40" y2="116" strokeWidth="2.6" />
        <path
          className={styles.branch}
          pathLength="1"
          strokeWidth="2.6"
          d="M40 46C40 60 80 54 80 74C80 94 40 88 40 100"
        />
        <g className={styles.commits} strokeWidth="2.6">
          <circle cx="40" cy="30" r="7" />
          <circle cx="40" cy="108" r="7" />
          <circle className={styles.branchCommit} cx="80" cy="74" r="7" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
