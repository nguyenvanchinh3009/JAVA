// package com.example05.example05.vnpay;

// import jakarta.servlet.http.HttpServletRequest;
// import org.springframework.web.bind.annotation.*;

// import java.text.SimpleDateFormat;
// import java.util.*;

// @RestController
// @RequestMapping("/api/vnpay")
// public class VnPayController {

//     @GetMapping("/create-payment")
// public Map<String, String> createPayment(
//         @RequestParam long amount,
//         HttpServletRequest request
// ) {
//     String ipAddr = request.getRemoteAddr();
//     if ("0:0:0:0:0:0:0:1".equals(ipAddr)) {
//         ipAddr = "127.0.0.1";
//     }

//     long vnpAmount = amount * 100; // 🔥 BẮT BUỘC

//     Map<String, String> params = new HashMap<>();
//     params.put("vnp_Version", "2.1.0");
//     params.put("vnp_Command", "pay");
//     params.put("vnp_TmnCode", VnPayConfig.TMN_CODE);
//     params.put("vnp_Amount", String.valueOf(vnpAmount));
//     params.put("vnp_CurrCode", "VND");
//     params.put("vnp_TxnRef", String.valueOf(System.currentTimeMillis()));
//     params.put("vnp_OrderInfo", "Thanh toan don hang");
//     params.put("vnp_OrderType", "other");
//     params.put("vnp_Locale", "vn");
//     params.put("vnp_IpAddr", ipAddr);
//     params.put("vnp_ReturnUrl", VnPayConfig.RETURN_URL);

//     String time = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
//     params.put("vnp_CreateDate", time);

//     String paymentUrl =
//             VnPayConfig.PAY_URL + "?" + VnPayUtil.buildPaymentUrl(params);

//     System.out.println("VNPay amount = " + vnpAmount);
//     System.out.println("PAY URL = " + paymentUrl);

//     return Map.of("url", paymentUrl);
// }


//     @GetMapping("/payment-return")
//     public Map<String, Object> paymentReturn(HttpServletRequest request) {

//         Map<String, String> params = new HashMap<>();
//         request.getParameterMap().forEach((k, v) -> params.put(k, v[0]));

//         boolean valid = VnPayUtil.verifySignature(new HashMap<>(params));

//         Map<String, Object> result = new HashMap<>();
//         if (valid && "00".equals(params.get("vnp_ResponseCode"))) {
//             result.put("status", "success");
//             result.put("orderId", params.get("vnp_TxnRef"));
//         } else {
//             result.put("status", "fail");
//             result.put("code", params.get("vnp_ResponseCode"));
//         }
//         return result;
//     }
// }
