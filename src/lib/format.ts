export const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    })
        .format(n)
        .replace(/\u00A0/g, " "); // nbsp bikin PDF berantakan

export const formatCompact = (n: number) =>
    new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);