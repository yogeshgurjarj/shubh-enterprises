const B = document.querySelector('#items-body');

const F = n => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
}).format(n || 0);


/* =========================================================
   FORM FIELD STYLING
   ========================================================= */

document.head.insertAdjacentHTML('beforeend', `
<style>
.party-body input,
.party-body textarea {
    border:1px solid #999!important;
    padding:2px 4px!important;
    background:#fff;
}

.party-body textarea {
    height:28px!important;
}
</style>
`);


/* =========================================================
   QUOTATION SETUP
   ========================================================= */

document.querySelector('#quote-number').value = '1';

const today = new Date().toISOString().slice(0, 10);

const dateInput = document.querySelector('#quote-date');
const validInput = document.querySelector('#valid-date');

dateInput.value = today;
validInput.value = today;

validInput.readOnly = true;

dateInput.addEventListener('input', () => {
    validInput.value = dateInput.value;
});


/* =========================================================
   CUSTOMER DETAILS -> HEADER
   ========================================================= */

const syncHeader = () => {

    const firstParty = document.querySelector('.party-body');

    const fields =
        firstParty.querySelectorAll('input,textarea');

    const companyLines =
        document.querySelectorAll('.company-info p');

    companyLines[0].textContent =
        `C/o ${fields[0].value || 'Customer Name'} S/o ${fields[1].value || "Father's Name"}`;

    companyLines[1].textContent =
        fields[2].value || 'Customer Address';
};

document
    .querySelector('.party-body')
    .addEventListener('input', syncHeader);

syncHeader();

/* =========================================================
   COPY QUOTATION FOR -> SHIP TO
   ========================================================= */

const copyCustomerButton = document.querySelector('#copy-customer');

if (copyCustomerButton) {
    copyCustomerButton.addEventListener('click', () => {

        const quotationFor =
            document.querySelector('.party-grid .party:first-child .party-body');

        const shipTo =
            document.querySelector('.party-grid .party:nth-child(2) .party-body');

        if (!quotationFor || !shipTo) {
            return;
        }

        /* Get all fields from Quotation For */
        const sourceInputs =
            quotationFor.querySelectorAll('input');

        const sourceTextarea =
            quotationFor.querySelector('textarea');

        /* Get all fields from Ship To */
        const targetInputs =
            shipTo.querySelectorAll('input');

        const targetTextarea =
            shipTo.querySelector('textarea');

        /* Copy input values */
        sourceInputs.forEach((sourceInput, index) => {

            if (targetInputs[index]) {
                targetInputs[index].value = sourceInput.value;
            }

        });

        /* Copy address */
        if (sourceTextarea && targetTextarea) {
            targetTextarea.value = sourceTextarea.value;
        }

        /* Trigger input event so other JS logic can detect changes */
        targetInputs.forEach(input => {
            input.dispatchEvent(
                new Event('input', { bubbles: true })
            );
        });

        if (targetTextarea) {
            targetTextarea.dispatchEvent(
                new Event('input', { bubbles: true })
            );
        }

        /* Small confirmation */
        const oldText = copyCustomerButton.textContent;

        copyCustomerButton.textContent = 'Copied ✓';

        setTimeout(() => {
            copyCustomerButton.textContent = oldText;
        }, 1200);
    });
}

/* =========================================================
   PRODUCT PLACEHOLDERS
   ========================================================= */

const formatProducts = () => {

    B.querySelectorAll('.item-row').forEach(row => {

        const product = row.querySelector('.product');
        const model = row.querySelector('.model');
        const brand = row.querySelector('.brand');
        const company = row.querySelector('.company');

        const smalls = row.querySelectorAll('small');

        if (product) {
            product.placeholder = 'Product -';
        }

        if (model) {
            model.placeholder = 'Model -';
        }

        if (brand) {
            brand.placeholder = 'Brand -';
        }

        if (company) {
            company.placeholder = 'Company -';
        }

        if (smalls[0] && smalls[0].firstChild) {
            smalls[0].firstChild.nodeValue = 'Model - ';
        }

        if (smalls[1] && smalls[1].firstChild) {
            smalls[1].firstChild.nodeValue = 'Brand - ';
        }

        if (smalls[2] && smalls[2].firstChild) {
            smalls[2].firstChild.nodeValue = 'Company - ';
        }

    });
};

new MutationObserver(formatProducts)
    .observe(B, {
        childList: true
    });
function calc() {

    let subtotal = 0;
    let cgstTotal = 0;
    let qtyTotal = 0;

    B.querySelectorAll('.item-row').forEach((row, index) => {

        const qty =
            Number(row.querySelector('.qty').value) || 0;

        const rate =
            Number(row.querySelector('.rate').value) || 0;

        // Rate is GST-inclusive
        const lineTotal = qty * rate;

        // Total GST rate
        const gstRate = 5;

        // GST-inclusive formula
        const taxable =
            lineTotal * 100 / (100 + gstRate);

        // CGST and SGST are half of total GST
        const cgstRate = gstRate / 2;

        const cgst =
            taxable * cgstRate / 100;

        qtyTotal += qty;

        subtotal += taxable;

        cgstTotal += cgst;

        row.querySelector('.serial').textContent =
            index + 1;

        row.querySelector('.taxable').textContent =
            F(taxable);

        row.querySelector('.cgst').textContent =
            F(cgst);

        row.querySelector('.sgst').textContent =
            F(cgst);

        row.querySelector('.line-total').textContent =
            F(lineTotal);
    });


    const totalTax =
        cgstTotal * 2;

    const grandTotal =
        subtotal + totalTax;


    const values = [

        ['qty-total', qtyTotal],

        ['subtotal', F(subtotal)],

        ['cgst-total', F(cgstTotal)],

        ['sgst-total', F(cgstTotal)],

        ['grand-total', F(grandTotal)],

        ['summary-subtotal', F(subtotal)],

        ['summary-cgst', F(cgstTotal)],

        ['summary-sgst', F(cgstTotal)],

        ['summary-tax', F(totalTax)],

        ['summary-grand', F(grandTotal)],

        ['final-total', F(grandTotal)]

    ];


    values.forEach(([id, value]) => {

        const element =
            document.querySelector(`#${id}`);

        if (element) {
            element.textContent = value;
        }

    });


    document.querySelector('#amount-words').textContent =
        grandTotal
            ? `${Math.round(grandTotal).toLocaleString('en-IN')} Rupees Only /-`
            : 'Zero Rupees Only /-';
}


/* =========================================================
   ADD PRODUCT
   ========================================================= */

function addItem() {

    B.append(
        document
            .querySelector('#item-template')
            .content
            .cloneNode(true)
    );

    formatProducts();

    calc();
}

document
    .querySelector('#add-item')
    .addEventListener('click', addItem);


/* =========================================================
   PRODUCT INPUT
   ========================================================= */

B.addEventListener('input', calc);


/* =========================================================
   REMOVE PRODUCT
   ========================================================= */

B.addEventListener('click', event => {

    if (event.target.matches('.remove-item')) {

        event
            .target
            .closest('tr')
            .remove();

        calc();
    }
});


/* =========================================================
   PAYMENT METHODS
   ========================================================= */
/* =========================================================
   SAVE PAYMENT DETAILS
   New payment details REPLACE old saved payment details
   ========================================================= */

const paymentMethods =
    document.querySelector('#payment-methods');

const paymentTemplate =
    document.querySelector('#payment-template');

const savePaymentButton =
    document.createElement('button');

savePaymentButton.type = 'button';

savePaymentButton.textContent =
    'Save Payment Details';

savePaymentButton.className =
    'save-payment';

document
    .querySelector('.toolbar > div:last-child')
    .prepend(savePaymentButton);


/* =========================================================
   ADD NEW PAYMENT
   ========================================================= */

document
    .querySelector('#add-payment')
    .addEventListener('click', () => {

        paymentMethods.append(
            paymentTemplate
                .content
                .cloneNode(true)
        );

    });


/* =========================================================
   REMOVE PAYMENT
   ========================================================= */

paymentMethods.addEventListener('click', event => {

    if (event.target.matches('.remove-payment')) {

        event
            .target
            .closest('.payment-method')
            .remove();

    }

});


/* =========================================================
   SAVE PAYMENT
   ========================================================= */

savePaymentButton.addEventListener('click', () => {

    /*
     * Get the payment method currently being edited.
     *
     * If multiple payment sections exist, the LAST one
     * is treated as the new payment.
     */
    const paymentBlocks =
        paymentMethods.querySelectorAll('.payment-method');

    if (paymentBlocks.length === 0) {
        return;
    }

    const newPayment =
        paymentBlocks[paymentBlocks.length - 1];


    /*
     * Get new payment values
     */
    const values =
        [
            ...newPayment.querySelectorAll('input')
        ].map(input => input.value.trim());


    /*
     * DELETE OLD SAVED PAYMENT
     */
    localStorage.removeItem('shubhPayment');


    /*
     * SAVE ONLY THE NEW PAYMENT
     */
    localStorage.setItem(
        'shubhPayment',
        JSON.stringify(values)
    );


    /*
     * DELETE ALL OLD PAYMENT BLOCKS
     */
    paymentBlocks.forEach((block, index) => {

        if (index !== paymentBlocks.length - 1) {
            block.remove();
        }

    });


    /*
     * Keep the new payment as the ONLY payment
     */
    newPayment.classList.remove('added-payment');


    /*
     * Confirmation
     */
    savePaymentButton.textContent =
        'Payment Details Saved ✓';


    setTimeout(() => {

        savePaymentButton.textContent =
            'Save Payment Details';

    }, 1800);

});


/* =========================================================
   LOAD SAVED PAYMENT
   ========================================================= */

const loadPaymentDetails = () => {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem('shubhPayment') || 'null'
            );

        if (!saved) {
            return;
        }


        /*
         * Remove every existing payment block
         * except the first one.
         */
        const blocks =
            paymentMethods.querySelectorAll('.payment-method');

        blocks.forEach((block, index) => {

            if (index > 0) {
                block.remove();
            }

        });


        /*
         * Put saved data into the first payment block.
         */
        const firstPayment =
            paymentMethods.querySelector('.payment-method');

        if (!firstPayment) {
            return;
        }

        const inputs =
            firstPayment.querySelectorAll('input');


        inputs.forEach((input, index) => {

            if (saved[index] !== undefined) {

                input.value =
                    saved[index];

            }

        });

    } catch (error) {

        console.warn(
            'Could not load saved payment details.',
            error
        );

    }

};

loadPaymentDetails();
/* =========================================================
   PRINT
   ========================================================= */

/* =========================================================
   PRINT WITH CUSTOMER NAME + MOBILE NUMBER AS FILE NAME
   ========================================================= */

document
    .querySelector('#print-quote')
    .addEventListener('click', () => {

        const customerSection =
            document.querySelector('.party-grid .party:first-child .party-body');

        if (!customerSection) {
            window.print();
            return;
        }

        /*
         * Customer name
         */
        const customerNameInput =
            customerSection.querySelector('input');

        /*
         * Mobile number
         * The last input in the customer details section
         * is the mobile number in your current HTML.
         */
        const allInputs =
            customerSection.querySelectorAll('input');

        const mobileInput =
            allInputs[allInputs.length - 1];

        let customerName =
            customerNameInput?.value.trim() || 'Customer';

        let mobileNumber =
            mobileInput?.value.trim() || '';

        /*
         * Remove characters that Windows does not allow
         * in filenames.
         */
        customerName =
            customerName.replace(/[<>:"/\\|?*]/g, '');

        mobileNumber =
            mobileNumber.replace(/[<>:"/\\|?*]/g, '');

        /*
         * Create filename
         */
        let fileName;

        if (mobileNumber) {

            fileName =
                `${customerName} - ${mobileNumber}`;

        } else {

            fileName =
                customerName;
        }

        /*
         * Remove extra spaces
         */
        fileName =
            fileName.replace(/\s+/g, ' ').trim();

        /*
         * Temporarily change browser document title.
         * Chrome uses this as the default PDF filename.
         */
        const oldTitle = document.title;

        document.title = fileName;

        /*
         * Open print dialog
         */
        window.print();

        /*
         * Restore original title after printing.
         */
        setTimeout(() => {

            document.title = oldTitle;

        }, 1000);

    });

/* =========================================================
   NEW QUOTATION
   ========================================================= */

document
    .querySelector('#new-quote')
    .addEventListener('click', () => {

        if (confirm('Start a new quotation?')) {
            location.reload();
        }

    });


/* =========================================================
   LOGO
   ========================================================= */

const logo =
    document.querySelector('.logo-mark');

logo.innerHTML = `
    <img
        src="images/logo.jpeg"
        alt="Logo"
        style="
            width:56px;
            height:56px;
            object-fit:contain
        "
    >
`;


/* =========================================================
   SIGNATURE
   ========================================================= */

const signature =
    document.querySelector('.signature-stamp');

signature.innerHTML = `
    <img
        src="images/sign.jpeg"
        alt="Signature"
        style="
            width:90px;
            height:42px;
            object-fit:contain
        "
    >
`;


/* =========================================================
   FINAL PRINT SAFETY OVERRIDE
   =========================================================

   The tax summary and final total use a fixed amount column.
   This prevents the label and amount from occupying the same
   space when Chrome generates the printed PDF.

   ========================================================= */

document.head.insertAdjacentHTML('beforeend', `

<style id="final-print-fix">

.tax-summary {
    width:100%!important;
    min-width:0!important;
    overflow:hidden!important;
}


.tax-summary p {
    display:grid!important;

    grid-template-columns:
        minmax(0,1fr)
        max-content!important;

    align-items:center!important;

    column-gap:8px!important;

    width:100%!important;

    box-sizing:border-box!important;
}


.tax-summary p span {
    min-width:0!important;

    white-space:nowrap!important;

    overflow:hidden!important;

    text-overflow:ellipsis!important;
}


.tax-summary p b {
    min-width:0!important;

    white-space:nowrap!important;

    text-align:right!important;

    display:block!important;

    font-variant-numeric:
        tabular-nums!important;
}


/* Final Total */

.total-amount {

    display:grid!important;

    grid-template-columns:
        minmax(0,1fr)
        max-content!important;

    align-items:center!important;

    column-gap:10px!important;

    width:100%!important;

    box-sizing:border-box!important;
}


.total-amount b {

    min-width:0!important;

    white-space:nowrap!important;

    text-align:left!important;
}


.total-amount strong {

    min-width:0!important;

    white-space:nowrap!important;

    text-align:right!important;

    font-variant-numeric:
        tabular-nums!important;
}


@media print {

    @page {
        size:A4 landscape!important;
        margin:7mm!important;
    }


    .bill {

        width:100%!important;

        max-width:100%!important;

        height:auto!important;

        max-height:none!important;

        min-height:0!important;

        overflow:visible!important;

        zoom:1!important;

        box-sizing:border-box!important;
    }


    .after-items .tax-summary {

        height:auto!important;

        min-height:16mm!important;
    }


    .tax-summary p {

        grid-template-columns:
            minmax(0,1fr)
            28mm!important;

        column-gap:2mm!important;

        padding:.65mm 1mm!important;

        line-height:1.1!important;

        min-height:2.55mm!important;
    }


    .total-amount {

        grid-template-columns:
            minmax(0,1fr)
            30mm!important;

        column-gap:2mm!important;

        padding:1.5mm!important;
    }

</style>

`);


/* =========================================================
   INITIAL PRODUCT
   ========================================================= */

addItem();
