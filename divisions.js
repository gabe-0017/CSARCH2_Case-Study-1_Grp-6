function NonRestoringDivide(dividend, divisor, bits) {
    if (divisor === 0n) {
        return { error: "Division by zero" };
    }

    // Track signs separately, then work with magnitudes (division algorithm works on positive values)
    const dividendSign = dividend < 0n ? -1n : 1n;
    const divisorSign = divisor < 0n ? -1n : 1n;

    const mask = (1n << BigInt(bits)) - 1n;
    let A = 0n; // Accumulator (remainder register)
    let Q = (dividend < 0n ? -dividend : dividend) & mask; // Quotient register, starts as |dividend|
    const M = divisor < 0n ? -divisor : divisor; // Divisor magnitude

    const steps = [];

    for (let i = 0; i < bits; i++) {
        // Shift A:Q left by 1 (as one combined register)
        const carryBit = (Q >> BigInt(bits - 1)) & 1n;
        Q = (Q << 1n) & mask;
        A = (A << 1n) | carryBit;

        // Add or subtract M depending on current sign of A
        if (A >= 0n) {
            A = A - M;
        } else {
            A = A + M;
        }

        // Set new quotient bit based on resulting sign of A
        if (A >= 0n) {
            Q = Q | 1n;
        }
        // else Q's LSB stays 0 (already the case after the shift)

        steps.push({
            iteration: i + 1,
            A: (A & mask).toString(2).padStart(bits, "0"),
            Q: Q.toString(2).padStart(bits, "0")
        });
    }

    // Final correction: if remainder ended up negative, restore it
    if (A < 0n) {
        A = A + M;
    }

    return {
        quotient: dividendSign * divisorSign * Q,
        remainder: dividendSign * A,
        steps
    };
}