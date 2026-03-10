def build_verify_otp_template(
    recipient_name: str,
    otp_code: str,
    expiry_minutes: int = 10,
    brand_name: str = 'Chakra Jothidanilayam',
) -> dict:
    subject = f'{brand_name} - Verify your email'

    text = (
        f'Hello {recipient_name},\n\n'
        f'Your OTP to verify your email is: {otp_code}\n'
        f'This OTP is valid for {expiry_minutes} minutes.\n\n'
        'If you did not request this, you can safely ignore this email.\n\n'
        f'- {brand_name}'
    )

    html = f"""
<!DOCTYPE html>
<html lang=\"en\">
  <body style=\"margin:0;padding:24px;background:#f5f6fb;font-family:Arial,sans-serif;color:#1f2937;\">
    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">
      <tr>
        <td align=\"center\">
          <table role=\"presentation\" width=\"480\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#ffffff;border-radius:12px;padding:24px;\">
            <tr>
              <td>
                <h2 style=\"margin:0 0 12px 0;font-size:20px;color:#111827;\">Verify your email</h2>
                <p style=\"margin:0 0 12px 0;font-size:14px;\">Hello {recipient_name},</p>
                <p style=\"margin:0 0 16px 0;font-size:14px;\">Use the OTP below to verify your email address.</p>
                <div style=\"font-size:30px;letter-spacing:8px;font-weight:700;background:#eef2ff;color:#3730a3;padding:12px 16px;border-radius:8px;text-align:center;\">{otp_code}</div>
                <p style=\"margin:16px 0 8px 0;font-size:13px;color:#4b5563;\">This OTP is valid for {expiry_minutes} minutes.</p>
                <p style=\"margin:0;font-size:12px;color:#6b7280;\">If you did not request this, you can safely ignore this email.</p>
                <p style=\"margin:20px 0 0 0;font-size:13px;color:#111827;\">— {brand_name}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""".strip()

    return {
        'subject': subject,
        'text': text,
        'html': html,
    }
