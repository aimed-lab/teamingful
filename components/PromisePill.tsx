// Small pill for a promise or a shared file. Color says who:
// owed by me = blue, owed by them = marigold, shared = green.
type Props = {
  who: "me" | "them" | "shared";
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const STYLES = {
  me: "bg-you-light text-you",
  them: "bg-them-light text-them-text",
  shared: "bg-team-light text-team-text",
};

export default function PromisePill({ who, children, style }: Props) {
  return (
    <span style={style} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[who]}`}>
      {children}
    </span>
  );
}
