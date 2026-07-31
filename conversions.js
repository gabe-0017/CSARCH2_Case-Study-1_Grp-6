function Unsigned(decimal, bits) {

    const max = (1n << BigInt(bits)) - 1n;

    if (decimal < 0n)
        return "Out of Range";

    if (decimal > max)
        return "Out of Range";

    return decimal
        .toString(2)
        .padStart(bits, "0");
}

function Signed(decimal, bits) {
    const min = -(1n << BigInt(bits - 1));
    const max = (1n << BigInt(bits - 1)) - 1n;

    if (decimal < min || decimal > max) {
        return `Out of Range (Valid: ${min} to ${max})`;
    }

    if (decimal >= 0n) {
        return decimal.toString(2).padStart(bits, "0");
    }

    const result = (1n << BigInt(bits)) + decimal;

    return result.toString(2).padStart(bits, "0");
}