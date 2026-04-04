export const PRESET_AVATARS = [
  { id: "preset:1", bg: "#5B5EA6", emoji: "🦊", label: "Renard" },
  { id: "preset:2", bg: "#9B72CF", emoji: "🐺", label: "Loup" },
  { id: "preset:3", bg: "#0EA5E9", emoji: "🦅", label: "Aigle" },
  { id: "preset:4", bg: "#4CAF50", emoji: "🐉", label: "Dragon" },
  { id: "preset:5", bg: "#FF9800", emoji: "🦁", label: "Lion" },
  { id: "preset:6", bg: "#EF4444", emoji: "🔥", label: "Phoenix" },
] as const;

export type EmojiGroup = {
  id: string;
  label: string;
  icon: string;
  emojis: string[];
};

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    id: "boys",
    label: "Garçons",
    icon: "👦",
    emojis: ["👦", "🧑", "👨", "🧔", "👱‍♂️", "🧑‍🦱", "🧑‍🦰", "🧑‍🦳", "🧑‍🦲", "🧒"],
  },
  {
    id: "girls",
    label: "Filles",
    icon: "👧",
    emojis: ["👧", "👩", "👱‍♀️", "👩‍🦱", "👩‍🦰", "👩‍🦳", "👩‍🦲", "🧒‍♀️", "💁‍♀️", "🙋‍♀️"],
  },
  {
    id: "jobs",
    label: "Métiers",
    icon: "💼",
    emojis: [
      "👨‍💻", "👩‍💻", "👨‍🏫", "👩‍🏫", "👨‍🎓", "👩‍🎓",
      "👨‍⚕️", "👩‍⚕️", "👨‍🍳", "👩‍🍳", "👨‍🎨", "👩‍🎨",
      "👷", "👮", "👨‍🚀", "👩‍🚀", "👨‍🌾", "👩‍🌾",
      "👨‍🔬", "👩‍🔬",
    ],
  },
  {
    id: "sports",
    label: "Sports",
    icon: "🏃",
    emojis: ["🏃", "🏋️", "🧘", "🚴", "🏊", "⛹️", "🤸", "🧗", "⛷️", "🤺", "🏇", "🤼"],
  },
  {
    id: "styles",
    label: "Styles",
    icon: "😎",
    emojis: ["😎", "🤓", "😇", "🥸", "🤠", "🧙", "🦸", "🦹", "🤵", "💃", "🕺", "🤡", "🥷", "🧟"],
  },
  {
    id: "animals",
    label: "Animaux",
    icon: "🐾",
    emojis: ["🦊", "🐺", "🦁", "🐯", "🐻", "🐼", "🐨", "🦋", "🐸", "🐙", "🦄", "🐉", "🦅", "🦉", "🐬", "🦈"],
  },
  {
    id: "flags",
    label: "Drapeaux",
    icon: "🏳️",
    emojis: [
      "🇫🇷", "🇧🇪", "🇨🇭", "🇨🇦", "🇲🇦", "🇩🇿", "🇹🇳",
      "🇸🇳", "🇨🇮", "🇬🇧", "🇩🇪", "🇪🇸", "🇮🇹", "🇵🇹",
      "🇺🇸", "🇧🇷", "🇲🇺", "🇷🇪", "🇬🇵", "🇲🇶",
    ],
  },
];

export function getAvatarDisplay(avatar: string | null | undefined): { bg: string; emoji: string; isImage?: boolean } {
  if (!avatar) return { bg: "#5B5EA6", emoji: "😊" };
  // Image base64 ou URL
  if (avatar.startsWith("data:") || avatar.startsWith("http")) {
    return { bg: "#5B5EA6", emoji: avatar, isImage: true };
  }
  // Preset classique
  const preset = PRESET_AVATARS.find((a) => a.id === avatar);
  if (preset) return { bg: preset.bg, emoji: preset.emoji };
  // Emoji direct (format "emoji:👨‍💻")
  if (avatar.startsWith("emoji:")) {
    const em = avatar.slice(6);
    return { bg: "#5B5EA6", emoji: em };
  }
  return { bg: "#5B5EA6", emoji: "😊" };
}

export function isPresetAvatar(avatar: string | null | undefined): boolean {
  return !!avatar && avatar.startsWith("preset:");
}
