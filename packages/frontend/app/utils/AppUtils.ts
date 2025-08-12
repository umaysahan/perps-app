export const getLS = (key: string) => {
    if (localStorage !== undefined) {
        return localStorage.getItem(key);
    }
    return null;
};

export const setLS = (key: string, value: string) => {
    if (localStorage !== undefined) {
        localStorage.setItem(key, value);
    }
};

export const processSymbolUrlParam = (symbol: string) => {
    // Convert lowercased url patterns into uppercase
    // except coins like kPEPE, kBONK, etc.
    const kTokenPattern = /^k[A-Z]+$/;
    if (!kTokenPattern.test(symbol)) {
        return symbol.toUpperCase();
    }
    return symbol;
};
