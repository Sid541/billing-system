/*************************
 REGISTRATION
**************************/
function register() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (!user || !pass) {
        alert("Please fill all fields");
        return;
    }

    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);

    alert("Registration Successful");
    location.href = "login.html";
}

/*************************
 LOGIN
**************************/
function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    if (
        user === localStorage.getItem("user") &&
        pass === localStorage.getItem("pass")
    ) {
        location.href = "dashboard.html";
    } else {
        alert("Invalid Username or Password");
    }
}

/*************************
 LOGOUT
**************************/
function logout() {
    location.href = "login.html";
}

/*************************
 DASHBOARD – GST & DISCOUNT (not applied in item-wise billing)
**************************/
function saveSettings() {
    let discount = document.getElementById("discount").value || 0;
    let gst = document.getElementById("gst").value || 0;

    localStorage.setItem("dashboardDiscount", discount);
    localStorage.setItem("dashboardGst", gst);

    alert("Dashboard GST & Discount saved");
}

/*************************
 BILLING – ITEM-WISE GST & DISCOUNT
**************************/
let grandTotal = 0;
let billingItems = JSON.parse(localStorage.getItem("billingItems") || "[]");

function addItem() {
    let productName = document.getElementById("product").value;
    let price = Number(document.getElementById("price").value);
    let qty = Number(document.getElementById("qty").value);
    let itemDiscount = Number(document.getElementById("itemDiscount").value) || 0;
    let itemGst = Number(document.getElementById("itemGst").value) || 0;

    if (!productName || price <= 0 || qty <= 0) {
        alert("Enter valid item details");
        return;
    }

    let amount = price * qty;
    let discountAmount = (amount * itemDiscount) / 100;
    let afterDiscount = amount - discountAmount;
    let gstAmount = (afterDiscount * itemGst) / 100;
    let total = afterDiscount + gstAmount;

    grandTotal += total;

    // Save the item for invoice
    billingItems.push({
        product: productName,
        price: price,
        qty: qty,
        amount: amount,
        discount: itemDiscount,
        discountAmt: discountAmount,
        gst: itemGst,
        gstAmt: gstAmount,
        total: total
    });

    localStorage.setItem("billingItems", JSON.stringify(billingItems));
    localStorage.setItem("billTotal", grandTotal.toFixed(2));

    // Update billing table in HTML
    let itemsTable = document.getElementById("items");
    itemsTable.innerHTML += `
        <tr>
            <td>${productName}</td>
            <td>${price}</td>
            <td>${qty}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${itemDiscount}%</td>
            <td>${discountAmount.toFixed(2)}</td>
            <td>${itemGst}%</td>
            <td>${gstAmount.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
        </tr>
    `;

    document.getElementById("total").innerText = grandTotal.toFixed(2);

    // Clear inputs
    document.getElementById("product").value = "";
    document.getElementById("price").value = "";
    document.getElementById("qty").value = "";
    document.getElementById("itemDiscount").value = "";
    document.getElementById("itemGst").value = "";
}

/*************************
 PROCEED TO INVOICE/PAYMENT
**************************/
function goToPayment() {
    if (grandTotal <= 0) {
        alert("Please add some items first!");
        return;
    }
    location.href = "invoice.html";
}

/*************************
 INVOICE PAGE LOGIC (invoice.html)
**************************/
if (document.getElementById("invoiceItems")) {
    let tbody = document.getElementById("invoiceItems");
    let items = JSON.parse(localStorage.getItem("billingItems") || "[]");
    let total = localStorage.getItem("billTotal") || 0;

    items.forEach(item => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.product}</td>
            <td>${item.price}</td>
            <td>${item.qty}</td>
            <td>${item.amount.toFixed(2)}</td>
            <td>${item.discount}%</td>
            <td>${item.discountAmt.toFixed(2)}</td>
            <td>${item.gst}%</td>
            <td>${item.gstAmt.toFixed(2)}</td>
            <td>${item.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("grandTotal").innerText = total;

    // Generate QR code (example: UPI link)
    let qr = new QRCode(document.getElementById("qrcode"), {
        text: `upi://pay?pa=example@upi&pn=Demo&am=${total}`,
        width: 128,
        height: 128
    });
}

/*************************
 DOWNLOAD PDF FROM INVOICE
**************************/
function downloadInvoice() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    let y = 20;
    let items = JSON.parse(localStorage.getItem("billingItems") || "[]");
    let total = localStorage.getItem("billTotal") || 0;

    doc.setFontSize(16);
    doc.text("Invoice", 20, y);
    y += 10;

    items.forEach((item, i) => {
        doc.setFontSize(12);
        doc.text(
            `${i + 1}. ${item.product} | Qty: ${item.qty} | Price: ${item.price} | Disc: ${item.discount}% | GST: ${item.gst}% | Total: ${item.total.toFixed(2)}`,
            10,
            y
        );
        y += 10;
    });

    y += 5;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${total}`, 10, y);

    doc.save("Invoice.pdf");
}

/*************************
 PAYMENT PAGE LOGIC
**************************/
if (document.getElementById("payAmount")) {
    document.getElementById("payAmount").innerText = localStorage.getItem("billTotal");
}

function pay() {
    alert("Payment Successful!");
    location.href = "receipt.html";
}

/*************************
 RECEIPT PAGE LOGIC
**************************/
if (document.getElementById("receiptAmount")) {
    document.getElementById("receiptAmount").innerText = localStorage.getItem("billTotal");
    // Clear items after payment
    localStorage.removeItem("billingItems");
    localStorage.removeItem("billTotal");
    grandTotal = 0;
    billingItems = [];
}
