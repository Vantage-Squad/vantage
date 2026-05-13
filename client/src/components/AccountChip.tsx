interface AccountChipProps {
    name: string;
    accountId: string;
    avatarUrl?: string;
}

const AccountChip = ({ name, accountId, avatarUrl }: AccountChipProps) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="flex items-center gap-3">
            <div
                className="flex items-center justify-center shrink-0 rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-subtle)] overflow-hidden"
                style={{ width: "40px", height: "40px" }}
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[var(--font-size-body)] font-medium text-[var(--color-text-secondary)]">
                        {initials}
                    </span>
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-[var(--font-size-body)] font-medium text-[var(--color-text-primary)]">
                    {name}
                </span>
                <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] font-mono">
                    {accountId}
                </span>
            </div>
        </div>
    );
};

export default AccountChip;
