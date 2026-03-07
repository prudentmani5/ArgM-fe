export function formatBIF(amount: number | null | undefined): string {
    if (amount == null) return '0 BIF';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'BIF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatNumber(value: number | null | undefined): string {
    if (value == null) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
    if (value == null) return '0%';
    return value.toFixed(decimals) + '%';
}

export function formatCompact(amount: number | null | undefined): string {
    if (amount == null) return '0';
    if (Math.abs(amount) >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' Mrd';
    if (Math.abs(amount) >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' M';
    if (Math.abs(amount) >= 1_000) return (amount / 1_000).toFixed(0) + ' K';
    return formatNumber(amount);
}
