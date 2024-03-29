function generateOrderId() {
  return "ORD" + Date.now().toString(36).toUpperCase();
}

function getCurrentDateTimeInMalaysia() {
  const now = new Date();
  const malaysiaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8 in milliseconds

  return malaysiaTime.toISOString();
}


function encodeFileToBase64(file, callback) {
  const reader = new FileReader();

  reader.onload = function () {
    callback(reader.result.split(',')[1]); // Extract base64 part from data URL
  };

  reader.readAsDataURL(file);
}

function handleFormSubmission() {
  const customerName = document.getElementById("customer-name").value;
  const phoneNumber = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const orderReceiptInput = document.getElementById("customer-pay");
  const orderId = generateOrderId();
  const orderDate = getCurrentDateTimeInMalaysia();

  const newOrder = {
    orderId,
    orderDate,
    customer: {
      customerName,
      phoneNumber,
      address,
    },
    items: orderDetails.cartItems,
    totalPrice: orderDetails.totalPrice,
    orderReceipt: '', // Initialize orderReceipt
    fileType: '', 
  };

  const orderReceiptFile = orderReceiptInput.files[0];

  if (orderReceiptFile) {
    // Extract file extension
    const fileName = orderReceiptFile.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Set fileType based on file extension
    newOrder.fileType = fileExtension;
  }

  // Encode the file to base64
  encodeFileToBase64(orderReceiptFile, function (base64Data) {
    
    // Update orderReceipt with the encoded data
    newOrder.orderReceipt = base64Data;

    // Continue with the rest of the code (inside the callback)
    const jsonContent = JSON.stringify(newOrder, null, 2);

    // const blob = new Blob([jsonContent], { type: "application/json" });

    const link = document.createElement("a");

    // link.href = URL.createObjectURL(blob);

    link.download = "order.json";

    document.body.appendChild(link);

    // link.click();

    document.body.removeChild(link);

    console.log(jsonContent);

    fetch(
      "https://nasi-aj-backend-service.onrender.com/nasi_aj/api/v2/submitOrder",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Add this line
        },
        body: jsonContent,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        console.log("Order submitted successfully:", data);
        alert("Order completed. Thank you!");
      })
      .catch((error) => {
        console.error("Error submitting order:", error);
        alert("Error submitting order. Please try again.");
      });
  });
}

const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener("click", handleFormSubmission);

function displayOrderDetails(orderDetails) {
  const receiptContainer = document.getElementById("receipt-container");
  receiptContainer.innerHTML = "<h2>Your Order Details:</h2>";

  if (orderDetails && orderDetails.cartItems.length > 0) {
    const ul = document.createElement("ul");

    orderDetails.cartItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.itemName} - RM${item.price.toFixed(2)} x ${
        item.quantity
      } = RM${item.total.toFixed(2)}`;
      ul.appendChild(li);
    });

    receiptContainer.appendChild(ul);

    // Display total price
    receiptContainer.innerHTML += `<p>Total Price: RM${orderDetails.totalPrice}</p>`;
    receiptContainer.innerHTML +=
      "<img style='width: 30%;height: 100%;' src='../assets/qr_mb.jpg' /><img style='width: 30%;height: 100%;' src='../assets/qr_tng.jpg' />";
  } else {
    receiptContainer.innerHTML += "<p>No items in the order.</p>";
  }
}

// Retrieve orderDetails from the query parameter in the URL
const searchParams = new URLSearchParams(window.location.search);
const orderDetailsParam = searchParams.get("orderDetails");
const orderDetails = JSON.parse(orderDetailsParam);

// Call the displayOrderDetails function
displayOrderDetails(orderDetails);
console.log(orderDetails);
