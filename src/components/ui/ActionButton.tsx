import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  icon: LucideIcon;
}

export default function ActionButton({
  title,
  icon: Icon,
}: Props) {
  return (
    <button
      className="
        flex
        items-center
        gap-3
        rounded-xl
        bg-zinc-900
        border
        border-zinc-800
        px-5
        py-4
        transition
        hover:border-green-500
        hover:bg-zinc-800
      "
    >
      <Icon size={20} className="text-green-500" />
      {title}
    </button>
  );
}