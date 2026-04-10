
const main = () => {
    window.jsPDF = window.jspdf.jsPDF
    const parameters = new URLSearchParams(window.location.search);
    let params = {};
    const cleanUpData = (key) => {
        return key.split(",").map((ind) => ind.trim());
    };
    for (var value of parameters.keys()) {
        params[value] = parameters.get(value);
    }
    console.log(params);
    const {
        products,
        quantity,
        unitpricelbp,
        unitpriceusd,
        customer,
        location,
        date, companyName, phoneNumber,
        totalLbp, target,
        totalusd, pagewidth, savePdf, splitSubTotal, potsRemainingLarge, transId,
        potsRemainingMedium, amountPaid, amountPaidLbp, amountLeft, enablePots, enablePaidLeft
    } = params;

    const prodArr = [];
    cleanUpData(products).forEach((name) => prodArr.push({ name }));
    const quantities = cleanUpData(quantity)
    quantities.forEach(
        (quantity, i) => (prodArr[i].quantity = quantity));
    cleanUpData(unitpricelbp).forEach(
        (unitpricelbp, i) => {
            if (!splitSubTotal) {
                prodArr[i].unitpricelbp = unitpricelbp
            } else {
                if (parseInt(unitpricelbp) != 0) {

                    prodArr[i].unitpricelbp = parseInt(unitpricelbp) / parseInt(quantities[i])
                } else {

                    prodArr[i].unitpricelbp = 0
                }
            }
        }
    );
    cleanUpData(unitpriceusd).forEach(
        (unitpriceusd, i) => {
            if (!splitSubTotal) {
                prodArr[i].unitpriceusd = unitpriceusd
            } else {
                if (parseFloat(unitpriceusd) != 0) {

                    prodArr[i].unitpriceusd = parseFloat(unitpriceusd) / parseInt(quantities[i])
                } else {
                    prodArr[i].unitpriceusd = 0
                }
            }
        }
    );
    const lbpColumn = document.querySelector("#lbpColumn")
    const usdColumn = document.querySelector("#usdColumn")
    const lbpTotalRow = document.querySelector("#lbpTotalRow")
    const usdTotalRow = document.querySelector("#usdTotalRow")
    const customerPart = document.querySelector("#customer");
    const potsRemainingLargePart = document.querySelector("#potsRemainingLarge");
    const potsRemainingMediumPart = document.querySelector("#potsRemainingMedium");
    const totalpricelbpPart = document.querySelector("#totalpricelbp");
    const totalpriceusdPart = document.querySelector("#totalpriceusd");
    const amountPaidPart = document.querySelector("#amountPaid");
    const amountPaidLbpPart = document.querySelector("#amountPaidLbp");
    const amountLeftPart = document.querySelector("#amountLeft");
    const potsSection = document.querySelector("#potsSection")
    const paidLeftSection = document.querySelector("#paidLeftSection")
    const invoiceNumber = document.querySelector("#invoiceNumber")
    invoiceNumber.innerHTML = "INV#" + transId
    console.log(totalusd)
    potsRemainingLargePart.innerHTML = (potsRemainingLarge ? potsRemainingLarge : 0) + ' L'
    potsRemainingMediumPart.innerHTML = (potsRemainingMedium ? potsRemainingMedium : 0) + ' M'
    amountPaidPart.innerHTML = (amountPaid ? amountPaid : 0)
    amountPaidLbpPart.innerHTML = (amountPaidLbp ? amountPaidLbp : 0)
    amountLeftPart.innerHTML = (amountLeft ? amountLeft : 0)
    console.log(enablePots)
    if (enablePots === undefined || enablePots === "") {
        potsSection.remove()
    }
    if (enablePaidLeft === undefined || enablePaidLeft === "") {
        paidLeftSection.remove()
    }
    switch (target) {
        case "LBP":
            usdColumn.remove()
            usdTotalRow.remove()
            totalpricelbpPart.innerHTML = totalLbp;
            break;
        case "USD":
            lbpColumn.remove()
            lbpTotalRow.remove()
            totalpriceusdPart.innerHTML = totalusd;
            break;
        default:
            totalpriceusdPart.innerHTML = totalusd;
            totalpricelbpPart.innerHTML = totalLbp;
            break;
    }
    const companyNamePart = document.querySelector("#companyName");
    if (!companyName) {
        companyNamePart.remove()
    } else {

        companyNamePart.innerHTML = companyName
    }
    const phoneNumberPart = document.querySelector("#phoneNumber");
    if (!phoneNumber) {
        phoneNumberPart.remove()
    } else {

        phoneNumberPart.innerHTML = phoneNumber
    }
    customerPart.innerHTML = customer + ", " + location;
    // const locationPart = document.querySelector("#location");
    // locationPart.innerHTML = location;
    const datePart = document.querySelector("#date");
    datePart.innerHTML = date;
    const tableBody = document.querySelector("#tableBod");

    prodArr.forEach((product) => {
        tableBody.innerHTML += `
<tr>
<td class="quantity">${product.quantity}</td>
<td class="description">${product.name}</td>
${!target || target === "LBP" ? `<td class="price">${product.unitpricelbp}</td>` : ""}
${!target || target === "USD" ? `<td class="price">${product.unitpriceusd}</td>` : ""}
</tr>`;
    });


    const toPrint = document.querySelector("#toPrint");

    const ticket = document.querySelector("#ticket")
    ticket.style.maxWidth = pagewidth;
    ticket.style.width = pagewidth;
    var doc = new jsPDF(ticket.clientHeight < ticket.clientWidth ? "l" : "p", "px", [ticket.clientHeight, ticket.clientWidth]);
    doc.html(ticket, {
        callback: function (doc) {
            const base64Full = doc.output('datauri')
            if (savePdf) doc.save()
            document.location.href =
                "rawbt:data:application/pdf;base64," + base64Full.split("base64,")[1];
        }
    });

};
main();

