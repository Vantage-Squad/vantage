interface LoadingSkeletonProps {
    rows?: number;
    variant: 'transaction' | 'alert';
}

const LoadingSkeleton = ({ rows = 3, variant }: LoadingSkeletonProps) => {
    const arr = Array.from({ length: rows });

    if (variant === 'transaction') {
        return (
            <div className="flex flex-col">
                {arr.map((_, i) => (
                    <div 
                        key={i} 
                        className="flex items-center justify-between p-[var(--spacing-md)] border-b border-[var(--color-border-subtle)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-raised)] animate-pulse" />
                            <div className="flex flex-col gap-2">
                                <div className="w-32 h-4 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                                <div className="w-20 h-3 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end gap-2">
                                <div className="w-24 h-5 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                                <div className="w-16 h-3 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                            </div>
                            <div className="w-20 h-6 rounded-full bg-[var(--color-bg-raised)] animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Alert variant
    return (
        <div className="flex flex-col">
            {arr.map((_, i) => (
                <div 
                    key={i} 
                    className="flex p-4 border-y border-[var(--color-border-subtle)] gap-3"
                >
                    <div className="w-[18px] h-[18px] rounded-full bg-[var(--color-bg-raised)] animate-pulse mt-0.5 shrink-0" />
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="w-1/2 h-4 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                            <div className="w-12 h-3 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                        </div>
                        <div className="w-3/4 h-3 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                        <div className="w-5/6 h-3 rounded bg-[var(--color-bg-raised)] animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
