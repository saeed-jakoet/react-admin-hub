export function normalizePhoneNumber(phone) {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
        return "+1" + digits;
    }
    if (digits.startsWith("27") && digits.length === 11) {
        return "+" + digits;
    }
    return "+" + digits;
}
