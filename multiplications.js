// Helper to convert to binary string with padding
function toBinary(num, bits) {
    if (num < 0n) {
        let mask = (1n << BigInt(bits)) - 1n;
        let value = (mask + num + 1n) & mask;
        return value.toString(2).padStart(bits, '0');
    }
    return num.toString(2).padStart(bits, '0');
}

function SequentialMultiplier(multiplicand, multiplier, bits, signed = false) {
    let M = BigInt(multiplicand);
    let Q = BigInt(multiplier);
    const n = bits;

    // Range checks
    if (signed) {
        const min = -(1n << BigInt(n - 1));
        const max = (1n << BigInt(n - 1)) - 1n;
        if (M < min || M > max || Q < min || Q > max) {
            return `Out of Range (Valid: ${min} to ${max})`;
        }
    } else {
        const max = (1n << BigInt(n)) - 1n;
        if (M < 0n || M > max || Q < 0n || Q > max) {
            return `Out of Range (Valid: 0 to ${max})`;
        }
    }

    let resultSign = 1n;
    let M_mag, Q_mag;
    if (signed) {
        if (M < 0n) { resultSign = -resultSign; M_mag = -M; } else { M_mag = M; }
        if (Q < 0n) { resultSign = -resultSign; Q_mag = -Q; } else { Q_mag = Q; }
    } else {
        M_mag = M;
        Q_mag = Q;
    }

    const maskN = (1n << BigInt(n)) - 1n;
    const maskA = (1n << BigInt(n + 1)) - 1n; // A gets an extra guard bit to safely hold carry

    let A = 0n;
    let Qreg = Q_mag & maskN;
    const steps = [];

    steps.push({
        pass: 0,
        A: '0'.repeat(n),
        Q: toBinary(Qreg, n),
        M: toBinary(M_mag, n),
        operation: 'Initialization',
        explanation: 'A <- 0'
    });

    for (let i = 1; i <= n; i++) {
        const Q0 = Qreg & 1n;
        let operation, explanation;

        if (Q0 === 1n) {
            A = (A + M_mag) & maskA;
            operation = 'A <- A + M';
            explanation = 'Q0 = 1, add M to A';
        } else {
            operation = 'No operation';
            explanation = 'Q0 = 0, no addition';
        }

        // Shift A:Q right by 1
        const carryOut = A & 1n;
        A = A >> 1n;
        Qreg = ((Qreg >> 1n) | (carryOut << BigInt(n - 1))) & maskN;

        steps.push({
            pass: i,
            A: toBinary(A & maskN, n),
            Q: toBinary(Qreg, n),
            M: toBinary(M_mag, n),
            operation: operation,
            explanation: explanation
        });
    }

    const productMag = (A << BigInt(n)) | Qreg;
    const productSigned = signed ? resultSign * productMag : productMag;
    const result_bin = toBinary(productSigned, n * 2);

    return {
        steps: steps,
        result: result_bin,
        decimal: productSigned.toString()
    };
}