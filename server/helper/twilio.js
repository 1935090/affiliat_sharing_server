const dev = process.env.NODE_ENV !== "production";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

export const sendSMSCode = async ({ to, code }) => {

  try {
    const result = await client.messages
      .create({
        from: "+13345649356",
        body: `ASPF Phone OTP. Your code is [${code}]`,
        to,
      })

    return { result: "success" }
  } catch (error) {
    return { result: "error", error: error.toString() }
  };
}