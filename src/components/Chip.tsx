type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  label: string;
};

type DeleteChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  label: string;
  onDelete: () => void;
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


export const DeleteChip: React.FC<DeleteChipProps> = ({ label, onDelete, className }) => {
  return (
    <div className={`m-1 gap-2 inline-flex items-center rounded-full bg-muted px-2 py-1 text-sm text-muted-foreground ${className ?? ""}`}>
      <span>{label}</span>
      <button
        className="text-sm"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
      >
        &times;
      </button>
    </div>
  );
};