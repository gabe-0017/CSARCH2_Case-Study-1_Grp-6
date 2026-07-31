const decimalInput = document.getElementById("decimal");
const bitsInput = document.getElementById("bits");
const convertBtn = document.getElementById("convertBtn");

convertBtn.addEventListener("click", function () {
    if (decimalInput.value === "" || bitsInput.value === "") {
        alert("Please fill in all fields.");
    } else {
        let decimal;
        try {
            decimal = BigInt(decimalInput.value);
        } catch {
            alert("Decimal number must be an integer.");
            return;
        }
        const bits = Number(bitsInput.value);
        if (!Number.isInteger(bits)) {
            alert("Bit size must be an integer.");
        } else if (bits < 2) {
            alert("Bit size must be at least 2.");
        } else {
            const unsigned = Unsigned(decimal, bits);
            const signed = Signed(decimal, bits);
            document.getElementById("unsignedOutput").textContent = unsigned;
            document.getElementById("signedOutput").textContent = signed;
        }
    }
});

const dividendInput = document.getElementById("dividend");
const divisorInput = document.getElementById("divisor");
const divBitsInput = document.getElementById("divBits");
const divideBtn = document.getElementById("divideBtn");

divideBtn.addEventListener("click", function () {
    if (dividendInput.value === "" || divisorInput.value === "" || divBitsInput.value === "") {
        alert("Please fill in all fields.");
        return;
    }

    let dividend, divisor;
    try {
        dividend = BigInt(dividendInput.value);
        divisor = BigInt(divisorInput.value);
    } catch {
        alert("Dividend and divisor must be integers.");
        return;
    }

    const bits = Number(divBitsInput.value);
    if (!Number.isInteger(bits)) {
        alert("Bit size must be an integer.");
        return;
    }
    if (bits < 2) {
        alert("Bit size must be at least 2.");
        return;
    }

    const result = NonRestoringDivide(dividend, divisor, bits);

    if (result.error) {
        alert(result.error);
        return;
    }

    const quotientBinary = Signed(result.quotient, bits);
    const remainderBinary = Signed(result.remainder, bits);

    document.getElementById("quotientOutput").textContent =
        result.quotient.toString() + "  (Binary: " + quotientBinary + ")";
    document.getElementById("remainderOutput").textContent =
        result.remainder.toString() + "  (Binary: " + remainderBinary + ")";

    const stepsContainer = document.getElementById("stepsOutput");
    stepsContainer.innerHTML = "";
    result.steps.forEach(function (step) {
        const stepLine = document.createElement("p");
        stepLine.textContent =
            "Step " + step.iteration + " — A: " + step.A +
            "  Q: " + step.Q;
        stepsContainer.appendChild(stepLine);
    });
});