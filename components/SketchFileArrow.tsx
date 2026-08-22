import styles from "./SketchFileArrow.module.css";

/**
 * A file with an arrow crossfading between export and import — "JSON,
 * replace or merge" as the two directions a backup actually moves,
 * rather than a generic file icon.
 */
export function SketchFileArrow({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 120 140" fill="none">
        <path
          className={styles.file}
          strokeWidth="2.4"
          d="M28 18L74 18L92 36L92 118C92 121 89.5 123.5 86.5 123.5L28 123.5C25 123.5 22.5 121 22.5 118L22.5 23.5C22.5 20.5 25 18 28 18Z"
        />
        <path className={styles.foldLine} strokeWidth="2" d="M74 18L74 36L92 36" />
        <line className={styles.tray} x1="42" y1="102" x2="78" y2="102" strokeWidth="2.2" />
        <g className={styles.down} strokeWidth="3">
          <line x1="60" y1="52" x2="60" y2="84" />
          <path d="M49 74L60 87L71 74" />
        </g>
        <g className={styles.up} strokeWidth="3">
          <line x1="60" y1="86" x2="60" y2="54" />
          <path d="M49 64L60 51L71 64" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
