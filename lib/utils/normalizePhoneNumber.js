export function normalizePhoneNumber(phone) {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    
    // South African number starting with 0 (e.g., 0845800800)
    if (digits.startsWith("0") && digits.length === 10) {
        return "+27" + digits.substring(1); // Remove leading 0, add +27
    }
    
    // Already has country code 27 (e.g., 27845800800)
    if (digits.startsWith("27") && digits.length === 11) {
        return "+" + digits;
    }
    
    // If already formatted correctly or other format, return as-is with +
    if (digits.length > 0) {
        return "+" + digits;
    }
    
    return "";
}
