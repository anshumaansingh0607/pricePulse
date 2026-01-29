import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPriceDropAlert(
  userEmail,
  product,
  oldPrice,
  newPrice
) {
      try {
    const priceDrop = oldPrice - newPrice;
    const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(1);
    const { data, error } = await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: userEmail,
  subject: `🎉 Price Drop Alert: ${product.name}`,
  html: ``,
});
if (error) {
  console.error("Resend error:", error);
  return { error };
}
return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
return { error: error.message };
  }
}
