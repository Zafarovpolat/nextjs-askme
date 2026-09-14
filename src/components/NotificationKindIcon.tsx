import type { NotificationKind } from "@/lib/notification-presentation";

/** Иконка типа уведомления. Цвет — currentColor. */
export default function NotificationKindIcon({
  kind,
  size = 20,
  className,
}: {
  kind: NotificationKind;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (kind) {
    case "points":
      return (
        <svg {...common}>
          <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4.2-7a2 2 0 0 1 2.3 2.2L13 9h5.6a2 2 0 0 1 2 2.4l-1.4 7a2 2 0 0 1-2 1.6H7" />
        </svg>
      );
    case "bonus":
      return (
        <svg {...common}>
          <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H8.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h3.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
        </svg>
      );
    case "level":
      return (
        <svg {...common}>
          <path d="M12 20V6m0 0-6 6m6-6 6 6M5 3h14" />
        </svg>
      );
    case "best":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z" />
        </svg>
      );
    case "like":
      return (
        <svg {...common}>
          <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z" />
        </svg>
      );
    case "answer":
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.3A8 8 0 1 1 21 12Z" />
        </svg>
      );
    case "comment":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4V5Z" />
        </svg>
      );
    case "premium":
      return (
        <svg {...common}>
          <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="M12 8v5m0 3.5v.1M10.3 3.6 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.6a2 2 0 0 0-3.4 0Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v.1M12 11v5" />
        </svg>
      );
  }
}
