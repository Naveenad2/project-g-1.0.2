import Image from 'next/image';
import styles from './Screenshot.module.css';

export const screenshots = {
  policyEditor: '/assets/policy_editor.jpg',
  docAssistant: '/assets/doc_assistant.jpg',
  workflow: '/assets/workflow.jpg',
} as const;

interface ScreenshotProps {
  src: (typeof screenshots)[keyof typeof screenshots];
  alt: string;
  priority?: boolean;
  className?: string;
}

/** Product screenshot presented as a floating screen panel. */
export function Screenshot({ src, alt, priority, className }: ScreenshotProps) {
  return (
    <div className={[styles.window, className].filter(Boolean).join(' ')}>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={674}
        sizes="(min-width: 1024px) 640px, 100vw"
        priority={priority}
        className={styles.img}
      />
    </div>
  );
}
