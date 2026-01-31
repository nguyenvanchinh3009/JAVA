const express = require("express");
const cors = require("cors");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const app = express();
const port = 3001;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= VNPay CONFIG ================= */
const vnpay = new VNPay({
  tmnCode: "ZF0TAZK7",
  secureSecret: "MPLLUIN83GDL9YOBLAUP3C6P3VQ4LGF8", // 🔐 1 CHỖ DUY NHẤT
  vnpayHost: "https://sandbox.vnpayment.vn",
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

/* ================= CREATE PAYMENT ================= */
app.post("/api/payment", async (req, res) => {
  try {
    const { amount, cartId } = req.body;

    if (!amount || amount <= 0 || !cartId) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount or cartId",
      });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100, // ✅ VNPay x100
      vnp_IpAddr:
        req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      vnp_TxnRef: `${cartId}_${Date.now()}`,
      vnp_OrderInfo: `Thanh toán giỏ hàng #${cartId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:3000/payment-result",
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    return res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Create payment failed",
    });
  }
});

/* ================= VERIFY PAYMENT ================= */
app.get("/api/vnpay-return", (req, res) => {
  try {
    const verifyResult = vnpay.verifyReturnUrl(req.query);

    if (verifyResult.isSuccess) {
      return res.json({
        success: true,
        code: verifyResult.vnp_ResponseCode,
        orderId: verifyResult.vnp_TxnRef,
        amount: verifyResult.vnp_Amount,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verify failed",
      code: verifyResult.vnp_ResponseCode,
    });
  } catch (err) {
    console.error("VNPay verify error:", err);
    return res.status(500).json({
      success: false,
      message: "Verify error",
    });
  }
});

/* ================= START SERVER ================= */
app.listen(port, () => {
  console.log(`🚀 VNPay server running at http://localhost:${port}`);
});
