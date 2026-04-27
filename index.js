const main = () => {
    const parameters = new URLSearchParams(window.location.search);
    let params = {};
    const cleanUpData = (key) => key.split(",").map((ind) => ind.trim());

    for (var value of parameters.keys()) {
        params[value] = parameters.get(value);
    }

    const {
        products, quantity, unitpricelbp, unitpriceusd,
        customer, location, date, companyName, phoneNumber,
        totalLbp, target, totalusd, pagewidth, splitSubTotal,
        potsRemainingLarge, transId, potsRemainingMedium,
        amountPaid, amountPaidLbp, amountLeft, enablePots, enablePaidLeft
    } = params;

    // Build product array
    const prodArr = [];
    cleanUpData(products).forEach((name) => prodArr.push({ name }));
    const quantities = cleanUpData(quantity);
    quantities.forEach((q, i) => (prodArr[i].quantity = q));

    cleanUpData(unitpricelbp).forEach((price, i) => {
        if (!splitSubTotal) {
            prodArr[i].unitpricelbp = price;
        } else {
            const p = parseInt(price);
            prodArr[i].unitpricelbp = p !== 0 ? p / parseInt(quantities[i]) : 0;
        }
    });

    cleanUpData(unitpriceusd).forEach((price, i) => {
        if (!splitSubTotal) {
            prodArr[i].unitpriceusd = price;
        } else {
            const p = parseFloat(price);
            prodArr[i].unitpriceusd = p !== 0 ? p / parseInt(quantities[i]) : 0;
        }
    });

    // DOM refs
    const lbpColumn       = document.querySelector("#lbpColumn");
    const usdColumn       = document.querySelector("#usdColumn");
    const lbpTotalRow     = document.querySelector("#lbpTotalRow");
    const usdTotalRow     = document.querySelector("#usdTotalRow");
    const customerPart    = document.querySelector("#customer");
    const potsLargePart   = document.querySelector("#potsRemainingLarge");
    const potsMediumPart  = document.querySelector("#potsRemainingMedium");
    const totalpricelbp   = document.querySelector("#totalpricelbp");
    const totalpriceusd   = document.querySelector("#totalpriceusd");
    const amountPaidPart  = document.querySelector("#amountPaid");
    const amountPaidLbpPt = document.querySelector("#amountPaidLbp");
    const amountLeftPart  = document.querySelector("#amountLeft");
    const potsSection     = document.querySelector("#potsSection");
    const paidLeftSection = document.querySelector("#paidLeftSection");
    const datePart        = document.querySelector("#date");

    // Pots
    if (potsLargePart)  potsLargePart.innerHTML  = (potsRemainingLarge  || 0) + ' L';
    if (potsMediumPart) potsMediumPart.innerHTML  = (potsRemainingMedium || 0) + ' M';
    if (!enablePots && potsSection) potsSection.remove();

    // Paid / Left
    if (amountPaidPart)  amountPaidPart.innerHTML  = amountPaid    || 0;
    if (amountPaidLbpPt) amountPaidLbpPt.innerHTML = amountPaidLbp || 0;
    if (amountLeftPart)  amountLeftPart.innerHTML  = amountLeft    || 0;
    if (!enablePaidLeft && paidLeftSection) paidLeftSection.remove();

    // Currency columns
    switch (target) {
        case "LBP":
            if (usdColumn)   usdColumn.remove();
            if (usdTotalRow) usdTotalRow.remove();
            if (totalpricelbp) totalpricelbp.innerHTML = totalLbp;
            break;
        case "USD":
            if (lbpColumn)   lbpColumn.remove();
            if (lbpTotalRow) lbpTotalRow.remove();
            if (totalpriceusd) totalpriceusd.innerHTML = totalusd;
            break;
        default:
            if (totalpriceusd) totalpriceusd.innerHTML = totalusd;
            if (totalpricelbp) totalpricelbp.innerHTML = totalLbp;
            break;
    }

    // Company name
    const companyNamePart = document.querySelector("#companyName");
    if (!companyName) {
        if (companyNamePart) companyNamePart.remove();
    } else {
        companyNamePart.innerHTML = companyName + " (INV# " + transId + ")";
    }

    // Phone
    const phoneNumberPart = document.querySelector("#phoneNumber");
    if (!phoneNumber) {
        if (phoneNumberPart) phoneNumberPart.remove();
    } else {
        phoneNumberPart.innerHTML = phoneNumber;
    }

    // Customer & date (safe null checks)
    if (customerPart) customerPart.innerHTML = customer + ", " + location;
    if (datePart) datePart.innerHTML = date;

    // Ticket width
    const ticket = document.querySelector("#ticket");
    if (pagewidth) {
        ticket.style.maxWidth = pagewidth;
        ticket.style.width    = pagewidth;
    }

    // Rows
    const tableBody = document.querySelector("#tableBod");
    prodArr.forEach((product) => {
        tableBody.innerHTML += `
        <tr>
            <td class="quantity">${product.quantity}</td>
            <td class="description">${product.name}</td>
            ${!target || target !== "USD" ? `<td class="price">${product.unitpricelbp}</td>` : ""}
            ${!target || target !== "LBP" ? `<td class="price">${product.unitpriceusd}</td>` : ""}
        </tr>`;
    });

    // Wait for Cairo font to load then print → rawbt intercepts the print dialog
    document.fonts.ready.then(() => {
        window.print();
    });
};

main();
