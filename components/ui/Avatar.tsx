import { getAvatarDisplay, isPresetAvatar } from "@/lib/avatars";

interface AvatarProps {
  avatar: string | null | undefined;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-lg",
  lg: "w-14 h-14 text-2xl",
  xl: "w-20 h-20 text-4xl",
};

export function Avatar({ avatar, name, size = "md", className = "" }: AvatarProps) {
  const sizeClass = SIZES[size];

  const isImage = avatar && (avatar.startsWith("data:") || avatar.startsWith("http"));
  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name ?? "avatar"}
        className={`${sizeClass} rounded-2xl object-cover ${className}`}
      />
    );
  }

  const { bg, emoji } = getAvatarDisplay(avatar);
  const initial = name?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={`${sizeClass} rounded-2xl flex items-center justify-center font-bold ${className}`}
      style={{ backgroundColor: bg + "22", color: bg }}
    >
      {avatar ? emoji : initial}
    </div>
  );
}
