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

    // Fix encoding issues and remove non-Latin characters
    const fixEncoding = (text) => {
        if (!text) return '';
        // Decode any URL-encoded characters
        let decoded = decodeURIComponent(text);
        // Remove all non-ASCII characters (keep only basic Latin)
        return decoded.replace(/[^\x00-\x7F]/g, '').trim();
    };

    const quantities = split("quantity").map(q => fixEncoding(q));

    const prodArr = split("products").map((name, i) => {
        const lbpRaw = fixEncoding(split("unitpricelbp")[i]);
        const usdRaw = fixEncoding(split("unitpriceusd")[i]);
        return {
            name: fixEncoding(name),
            quantity: quantities[i],
            unitpricelbp: splitSubTotal && parseInt(lbpRaw) ? (parseInt(lbpRaw) / parseInt(quantities[i])) : lbpRaw,
            unitpriceusd: splitSubTotal && parseFloat(usdRaw) ? (parseFloat(usdRaw) / parseInt(quantities[i])) : usdRaw,
        };
    });

    const $ = (id) => document.getElementById(id);

    // Fix all text parameters
    const cleanedCompanyName = fixEncoding(companyName);
    const cleanedCustomer = fixEncoding(customer);
    const cleanedLocation = fixEncoding(location);
    const cleanedPhoneNumber = fixEncoding(phoneNumber);
    const cleanedTransId = fixEncoding(transId);
    const cleanedTotalLbp = fixEncoding(totalLbp);
    const cleanedTotalusd = fixEncoding(totalusd);
    const cleanedPotsLarge = fixEncoding(potsRemainingLarge);
    const cleanedPotsMedium = fixEncoding(potsRemainingMedium);
    const cleanedAmountPaid = fixEncoding(amountPaid);
    const cleanedAmountPaidLbp = fixEncoding(amountPaidLbp);

    // Company
    const cn = $("companyName");
    if (cn) {
        if (cleanedCompanyName) {
            cn.textContent = cleanedCompanyName;
        } else {
            cn.remove();
        }
    }

    // Invoice Number
    const invNum = $("invoiceNumber");
    if (invNum) {
        if (cleanedTransId) {
            invNum.textContent = `INV# ${cleanedTransId}`;
        } else {
            invNum.remove();
        }
    }

    // Customer
    const cu = $("customer");
    if (cu) {
        cu.textContent = [cleanedCustomer, cleanedLocation].filter(Boolean).join(" · ");
    }

    // Phone
    const ph = $("phoneNumber");
    if (ph) { 
        if (cleanedPhoneNumber) {
            ph.textContent = cleanedPhoneNumber;
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
        if (pl) pl.textContent = (cleanedPotsLarge || 0) + "L";
        if (pm) pm.textContent = (cleanedPotsMedium || 0) + "M";
    }

    // Paid section
    const pls = $("paidLeftSection");
    if (!enablePaidLeft && pls) { pls.remove(); }
    else {
        const ap = $("amountPaid");    
        const al = $("amountPaidLbp");
        if (ap) ap.textContent = cleanedAmountPaid || 0;
        if (al) al.textContent = cleanedAmountPaidLbp || 0;
        // Remove balance if it exists
        const alf = $("amountLeft");   
        if (alf) {
            const balanceRow = alf.closest('tr');
            if (balanceRow) balanceRow.remove();
        }
    }

    // Totals & columns
    const lbpCol = $("lbpColumn"), usdCol = $("usdColumn");
    const lbpRow = $("lbpTotalRow"), usdRow = $("usdTotalRow");
    const tlbp = $("totalpricelbp"), tusd = $("totalpriceusd");

    if (target === "LBP") {
        if (usdCol) usdCol.remove();
        if (usdRow) usdRow.remove();
        if (tlbp) tlbp.textContent = cleanedTotalLbp;
    } else if (target === "USD") {
        if (lbpCol) lbpCol.remove();
        if (lbpRow) lbpRow.remove();
        if (tusd) tusd.textContent = cleanedTotalusd;
    } else {
        if (tlbp) tlbp.textContent = cleanedTotalLbp;
        if (tusd) tusd.textContent = cleanedTotalusd;
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
        const row = tbody.insertRow();
        const qtyCell = row.insertCell(0);
        const descCell = row.insertCell(1);
        
        qtyCell.className = "qty";
        qtyCell.textContent = quantity;
        
        descCell.className = "desc";
        descCell.textContent = name;
        
        if (target !== "USD") {
            const lbpCell = row.insertCell(2);
            lbpCell.className = "price";
            lbpCell.textContent = unitpricelbp;
        }
        
        if (target !== "LBP") {
            const usdCell = row.insertCell(target !== "USD" ? 3 : 2);
            usdCell.className = "price";
            usdCell.textContent = unitpriceusd;
        }
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
