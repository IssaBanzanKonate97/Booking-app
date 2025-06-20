const useDebounce = (func, delay) => {
    let inDebounce
    return function() {
        const context = this
        const args = arguments
        clearTimeout(inDebounce)
        inDebounce = setTimeout(() => func.apply(context, args), delay)
    }
};

const useThrottle = (func, limit) => {
    let inThrottle
    return function() {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
};
