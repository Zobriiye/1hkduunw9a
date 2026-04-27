const main = () => {
    window.jsPDF = window.jspdf.jsPDF;
    
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    const split = (key) => (params[key] || "").split(",").map(s => s.trim());

    const {
        products, quantity, unitpricelbp, unitpriceusd,
        customer, location, date, companyName, phoneNumber,
        totalLbp, target, totalusd, pagewidth, splitSubTotal,
        potsRemainingLarge, transId, potsRemainingMedium,
        amountPaid, amountPaidLbp, amountLeft, enablePots, enablePaidLeft
    } = params;

    // Function to remove Arabic and any non-Latin characters
    const removeArabic = (text) => {
        if (!text) return '';
        // Remove Arabic characters and any other non-Latin-1 characters
        // Keep: ASCII, Latin-1 Supplement (00-FF), numbers, common punctuation
        let cleaned = '';
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            const code = text.charCodeAt(i);
            // Keep characters in range 32-255 (Latin-1) plus common symbols
            if ((code >= 32 && code <= 255) || code === 8364 || code === 8230) {
                cleaned += char;
            } else if (char === ' ' || char === '-' || char === '.' || char === ',' || char === '·') {
                cleaned += char;
            }
        }
        return cleaned.replace(/\s+/g, ' ').trim();
    };

    const quantities = split("quantity");

    const prodArr = split("products").map((name, i) => {
        const lbpRaw = split("unitpricelbp")[i];
        const usdRaw = split("unitpriceusd")[i];
        return {
            name: removeArabic(name),
            quantity: quantities[i],
            unitpricelbp: splitSubTotal && parseInt(lbpRaw) ? (parseInt(lbpRaw) / parseInt(quantities[i])) : lbpRaw,
            unitpriceusd: splitSubTotal && parseFloat(usdRaw) ? (parseFloat(usdRaw) / parseInt(quantities[i])) : usdRaw,
        };
    });

    const $ = (id) => document.getElementById(id);

    // Clean all text before inserting into DOM
    const cleanedCompanyName = removeArabic(companyName);
    const cleanedCustomer = removeArabic(customer);
    const cleanedLocation = removeArabic(location);
    const cleanedPhoneNumber = removeArabic(phoneNumber);

    // Company
    const cn = $("companyName");
    if (cn) {
        if (cleanedCompanyName) {
            cn.innerHTML = cleanedCompanyName;
        } else {
            cn.remove();
        }
    }

    // Invoice Number
    const invNum = $("invoiceNumber");
    if (invNum) {
        if (transId) {
            invNum.innerHTML = `INV# ${transId}`;
        } else {
            invNum.remove();
        }
    }

    // Customer
    const cu = $("customer");
    if (cu) {
        cu.innerHTML = [cleanedCustomer, cleanedLocation].filter(Boolean).join(" · ");
    }

    // Date
    const dp = $("date");
    if (dp) dp.innerHTML = date || "";

    // Phone
    const ph = $("phoneNumber");
    if (ph) { 
        if (cleanedPhoneNumber) {
            ph.innerHTML = cleanedPhoneNumber;
        } else {
            ph.remove();
        }
    }

    // Pots
    const ps = $("potsSection");
    if (!enablePots && ps) { ps.remove(); }
    else {
        const pl = $("potsRemainingLarge");
        const pm = $("potsRemainingMedium");
        if (pl) pl.innerHTML = (potsRemainingLarge || 0) + "L";
        if (pm) pm.innerHTML = (potsRemainingMedium || 0) + "M";
    }

    // Paid/Left
    const pls = $("paidLeftSection");
    if (!enablePaidLeft && pls) { pls.remove(); }
    else {
        const ap = $("amountPaid");    if (ap) ap.innerHTML = amountPaid || 0;
        const al = $("amountPaidLbp"); if (al) al.innerHTML = amountPaidLbp || 0;
        const alf = $("amountLeft");   if (alf) alf.innerHTML = amountLeft || 0;
    }

    // Totals & columns
    const lbpCol = $("lbpColumn"), usdCol = $("usdColumn");
    const lbpRow = $("lbpTotalRow"), usdRow = $("usdTotalRow");
    const tlbp = $("totalpricelbp"), tusd = $("totalpriceusd");

    if (target === "LBP") {
        if (usdCol) usdCol.remove();
        if (usdRow) usdRow.remove();
        if (tlbp) tlbp.innerHTML = totalLbp;
    } else if (target === "USD") {
        if (lbpCol) lbpCol.remove();
        if (lbpRow) lbpRow.remove();
        if (tusd) tusd.innerHTML = totalusd;
    } else {
        if (tlbp) tlbp.innerHTML = totalLbp;
        if (tusd) tusd.innerHTML = totalusd;
    }

    // Ticket width
    const ticket = $("ticket");
    if (pagewidth && ticket) {
        ticket.style.width = pagewidth;
        ticket.style.maxWidth = pagewidth;
    }

    // Rows
    const tbody = $("tableBod");
    prodArr.forEach(({ quantity, name, unitpricelbp, unitpriceusd }) => {
        tbody.innerHTML += `<tr>
            <td class="qty">${quantity}</td>
            <td class="desc">${name}</td>
            ${target !== "USD" ? `<td class="price">${unitpricelbp}</td>` : ""}
            ${target !== "LBP" ? `<td class="price">${unitpriceusd}</td>` : ""}
        </tr>`;
    });

    // Generate PDF with exact ticket size and send to rawbt
    setTimeout(() => {
        const ticket = $("ticket");
        const width = ticket.clientWidth;
        const height = ticket.clientHeight;
        
        const doc = new jsPDF({
            orientation: height > width ? "p" : "l",
            unit: "px",
            format: [width, height]
        });
        
        doc.html(ticket, {
            callback: function (doc) {
                const base64Full = doc.output('datauri');
                window.location.href = "rawbt:data:application/pdf;base64," + base64Full.split("base64,")[1];
            },
            x: 0,
            y: 0,
            width: width,
            windowWidth: width
        });
    }, 500);
};

main();
