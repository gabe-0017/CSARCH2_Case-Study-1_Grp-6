const decimalInput = document.getElementById("decimal");
const bitsInput = document.getElementById("bits");
const convertBtn = document.getElementById("convertBtn");

convertBtn.addEventListener("click", function () {

    if (decimalInput.value === "" || bitsInput.value === "") {

        alert("Please fill in all fields.");

    } else {

        const decimal = BigInt(decimalInput.value);
        const bits = Number(bitsInput.value);

        if (!Number.isInteger(bits)) {

            alert("Bit size must be an integer.");

        } else if (bits < 2) {

            alert("Bit size must be at least 2.");

        } else {

            // Perform conversions
            const unsigned = Unsigned(decimal, bits);
            const signed = Signed(decimal, bits);

            // Display results
            document.getElementById("unsignedOutput").textContent = unsigned;
            document.getElementById("signedOutput").textContent = signed;
        }
    }
});