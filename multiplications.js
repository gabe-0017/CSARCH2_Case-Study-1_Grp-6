// Helper to convert to binary string with padding
function toBinary(num, bits) {
    if (num < 0n) {
        // Two's complement for negative numbers
        let mask = (1n << BigInt(bits)) - 1n;
        let value = (mask + num + 1n) & mask;
        return value.toString(2).padStart(bits, '0');
    }
    return num.toString(2).padStart(bits, '0');
}


function SequentialMultiplier(multiplicand, multiplier, bits, signed = false) {
    // Big int converter
    let M = BigInt(multiplicand);
    let Q = BigInt(multiplier);
    const n = bits;

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

    // For signed use two's comp rep
    let M_bits, Q_bits;
    if (signed) {
        // Get two's comp rep
        if (M < 0n) {
            M_bits = (1n << BigInt(n)) + M;
        } else {
            M_bits = M;
        }
        if (Q < 0n) {
            Q_bits = (1n << BigInt(n)) + Q;
        } else {
            Q_bits = Q;
        }
    } else {
        M_bits = M;
        Q_bits = Q;
    } 

    // Init registers
    let A = 0n;
    let Q_minus_1 = 0n;
    // Store steps for output
    let steps = [];
    const mask = (1n << BigInt(n)) - 1n;

    // Init state
    steps.push({
        pass: 0,
        A: '0'.repeat(n),
        Q: toBinary(Q_bits, n),
        Q_minus_1: '0',
        M: toBinary(M_bits, n),
        operation: 'Initialization',
        explanation: 'A <- 0, Q^-1 <- 0'
    });

    // Do mult for each bit
    for (let i = 1; i <= n; i++) {
        // Check Q0 and Q_minus1
        let Q0 = Q_bits & 1n;
        let q0_qminus1 = (Q0 << 1n) | Q_minus_1;
        let operation = 'No operation';
        let explanation = '';

        if (!signed) {
            // Unsigned
            if (Q0 === 1n) {
                A = (A + M_bits) & mask;
                operation = 'A <- A + M';
                explanation = 'Q0 = 1, add M to A';
            } else {
                explanation = 'Q0 = 0, no addition';
            }
        } else {
            // Signed Booth's
            let q0_qminus1 = (Q0 << 1n) | Q_minus_1;
            if (q0_qminus1 === 1n) { // 01
                A = (A + M_bits) & mask;
                operation = 'A <- A + M';
                explanation = 'Q0Q^-1 = 01, add M to A';
            } else if (q0_qminus1 === 2n) { // 10
                A = (A - M_bits) & mask;
                operation = 'A <- A - M';
                explanation = 'Q0Q^-1 = 10, subtract M from A';
            } else {
                explanation = `Q0Q^-1 = ${q0_qminus1}, no action`;
            }
        }

        let combined = (A << BigInt(n + 1)) | (Q_bits << 1n) | Q_minus_1; // Combine
        let signBit = (A & (1n << BigInt(n - 1))) !== 0n ? 1n : 0n; // shift right to preserve sign bit
        combined = combined >> 1n; // Shift right by 1
        
        if (signed && signBit === 1n) {
            combined = combined | (1n << BigInt(n * 2));
        }
        
        // Extract shifted values
        A = (combined >> BigInt(n + 1)) & mask;
        Q_bits = (combined >> 1n) & mask;
        Q_minus_1 = combined & 1n;

        // Store step
        steps.push({
            pass: i,
            A: toBinary(A, n),
            Q: toBinary(Q_bits, n),
            Q_minus_1: Q_minus_1.toString(),
            M: toBinary(M_bits, n),
            operation: operation,
            explanation: explanation
        });
    }

    // Final: A cat with Q
    let result = (A << BigInt(n)) | Q_bits;
    let result_bin = toBinary(result, n * 2);
    
    // Convert to decimal (handle signed if needed)
    let result_dec;
    if (signed && (result & (1n << BigInt(n * 2 - 1))) !== 0n) {
        result_dec = result - (1n << BigInt(n * 2));
    } else {
        result_dec = result;
    }

    return {
        steps: steps,
        result: result_bin,
        decimal: result_dec.toString()
    };
}