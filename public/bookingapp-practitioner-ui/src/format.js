export default {
    formatPrice: (val) => {
        return "$" + val.toFixed(0);
    },
    formatPriceFull: (val) => {
        return "$" + val.toFixed(2);
    }
}