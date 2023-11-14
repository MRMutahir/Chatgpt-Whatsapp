const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const openai = require("openai");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// OpenAI setup
const openaiApiKey = process.env.OPENAI_API_KEY;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Endpoint for receiving WhatsApp messages
app.post("/whatsapp/messages", async (req, res) => {
  const incomingMessage = req.body.Body;
  const senderNumber = req.body.From;
  //   res.json("ok444");

  try {
    // Use ChatGPT API to generate a response
    const chatGPTResponse = await openai.Completion.create({
      engine: "text-davinci-002", // or any available engine
      prompt: incomingMessage,
      max_tokens: 150,
    });

    const generatedResponse = chatGPTResponse.choices[0].text.trim();

    // Send the response back to the user via WhatsApp
    await twilioClient.messages.create({
      from: "whatsapp:+12512206517", // Your Twilio WhatsApp number
      body: generatedResponse,
      to: `whatsapp:${senderNumber}`,
    });

    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("Error:", error.messages);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
