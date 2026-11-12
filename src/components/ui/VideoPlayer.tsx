import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  href: string;
  image: string;
  label: string;
  duration?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
}

/** Poster-style link to a product video. */
export function VideoPlayer({ href, image, label, duration, title, subtitle }: VideoPlayerProps) {
  return (
    <Link href={href} className={`${styles.player} reveal`} aria-label={label}>
      <span className={styles.stage}>
        <Image src={image} alt="" width={1200} height={674} sizes="(min-width: 1280px) 1280px, 100vw" className={styles.img} />
        <span className={styles.shade} aria-hidden="true" />
        <span className={styles.play} aria-hidden="true">
          <Icon name="play" size={26} />
        </span>
        {duration && <span className={styles.duration}>{duration}</span>}
      </span>
      {(title || subtitle) && (
        <span className={styles.meta}>
          {title && <b>{title}</b>}
          {subtitle && <span>{subtitle}</span>}
        </span>
      )}
    </Link>
  );
}
