// package com.example05.example05.vnpay;

// import javax.crypto.Mac;
// import javax.crypto.spec.SecretKeySpec;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.util.*;

// public class VnPayUtil {

//     /* ================= HMAC SHA512 ================= */
//     public static String hmacSHA512(String key, String data) {
//         try {
//             Mac hmac = Mac.getInstance("HmacSHA512");
//             SecretKeySpec secretKey =
//                     new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
//             hmac.init(secretKey);
//             byte[] raw = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

//             StringBuilder sb = new StringBuilder();
//             for (byte b : raw) sb.append(String.format("%02x", b));
//             return sb.toString();
//         } catch (Exception e) {
//             throw new RuntimeException("Error HMAC SHA512", e);
//         }
//     }

//     /* ================= BUILD PAYMENT URL ================= */
//     public static String buildPaymentUrl(Map<String, String> params) {
//         try {
//             List<String> keys = new ArrayList<>(params.keySet());
//             Collections.sort(keys);

//             StringBuilder query = new StringBuilder();
//             StringBuilder hashData = new StringBuilder();

//             for (String key : keys) {
//                 String value = params.get(key);
//                 if (value != null && !value.isEmpty()) {

//                     String encodedValue =
//                             URLEncoder.encode(value, StandardCharsets.US_ASCII.toString());

//                     // query
//                     query.append(key).append("=").append(encodedValue).append("&");

//                     // hashData (PHẢI ENCODE)
//                     hashData.append(key).append("=").append(encodedValue).append("&");
//                 }
//             }

//             query.deleteCharAt(query.length() - 1);
//             hashData.deleteCharAt(hashData.length() - 1);

//             String secureHash =
//                     hmacSHA512(VnPayConfig.HASH_SECRET, hashData.toString());

//             return query + "&vnp_SecureHash=" + secureHash;
//         } catch (Exception e) {
//             throw new RuntimeException(e);
//         }
//     }

//     /* ================= VERIFY RETURN ================= */
//     public static boolean verifySignature(Map<String, String> params) {

//         String vnpSecureHash = params.remove("vnp_SecureHash");
//         params.remove("vnp_SecureHashType");

//         // chỉ lấy vnp_
//         Map<String, String> filtered = new HashMap<>();
//         for (Map.Entry<String, String> e : params.entrySet()) {
//             if (e.getKey().startsWith("vnp_")) {
//                 filtered.put(e.getKey(), e.getValue());
//             }
//         }

//         List<String> keys = new ArrayList<>(filtered.keySet());
//         Collections.sort(keys);

//         StringBuilder hashData = new StringBuilder();
//         for (String key : keys) {
//             String value = filtered.get(key);
//             if (value != null && !value.isEmpty()) {
//                 hashData.append(key)
//                         .append("=")
//                         .append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
//                         .append("&");
//             }
//         }

//         hashData.deleteCharAt(hashData.length() - 1);

//         String calculatedHash =
//                 hmacSHA512(VnPayConfig.HASH_SECRET, hashData.toString());

//         System.out.println("HASH DATA : " + hashData);
//         System.out.println("CALC HASH : " + calculatedHash);
//         System.out.println("VNP HASH  : " + vnpSecureHash);

//         return calculatedHash.equalsIgnoreCase(vnpSecureHash);
//     }
// }
