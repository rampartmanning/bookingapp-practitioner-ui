export default {
    isValidPhoneNumber: (val) => {
        return /^\+1\d{10}$/.test(val);
    },
    isValidEmail: (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }
}