type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  label: string;
};

export const Chip: React.FC<ChipProps> = ({ label, className, ...props }) => {
  return (
    <span
      className={`m-1 inline-flex items-center rounded-full bg-muted px-2 py-1 text-sm font-semibold text-muted-foreground ${className ?? ""}`}
      {...props}
    >
      {label}
    </span>
  );
};
