/**
 * AI Grant & Funding Finder — Backend
 * -----------------------------------
 * Express server that receives a startup domain/query from the frontend,
 * calls IBM watsonx.ai (Granite model) to generate funding recommendations,
 * and returns the result as JSON.
 *
 * Required environment variables (see .env.example):
 *   IBM_API_KEY   - IBM Cloud IAM API key
 *   PROJECT_ID    - watsonx.ai project ID
 *   REGION        - e.g. us-south, eu-de, au-syd
 *   MODEL_ID      - e.g. ibm/granite-3-2-8b-instruct
 *   PORT          - (optional) port to run the server on, default 3000
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const {
  IBM_API_KEY,
  PROJECT_ID,
  REGION = "us-south",
  MODEL_ID = "ibm/granite-3-2-8b-instruct",
  PORT = 3000,
} = process.env;

// Simple in-memory cache for the IAM token so we don't fetch a new one on every request
let cachedToken = null;
let tokenExpiry = 0;

async function getIamToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!IBM_API_KEY || IBM_API_KEY.includes("your_")) {
    throw new Error(
      "IBM_API_KEY is missing or still set to a placeholder. Add a real key to backend/.env"
    );
  }

  const response = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: IBM_API_KEY,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IAM token request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Refresh a minute before actual expiry
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function generateFundingInsights(query) {
  const token = await getIamToken();

  const prompt = `You are an assistant that helps startups find funding.
A startup working in the domain of "${query}" is looking for grants, investors,
incubators, and accelerator programs.

List 4-6 realistic categories of funding opportunities that would suit this
domain, with a one-sentence explanation for each. Keep the tone practical and
specific to the domain given.`;

  const url = `https://${REGION}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model_id: MODEL_ID,
      project_id: PROJECT_ID,
      input: prompt,
      parameters: {
        decoding_method: "greedy",
        max_new_tokens: 400,
        repetition_penalty: 1.1,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`watsonx.ai request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const generated = data?.results?.[0]?.generated_text;

  if (!generated) {
    throw new Error("No generated text returned from watsonx.ai");
  }

  return generated.trim();
}

app.post("/api/find-funding", async (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Please provide a startup domain." });
  }

  try {
    const insights = await generateFundingInsights(query.trim());
    res.json({ query: query.trim(), insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch funding insights.",
      details: err.message,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`AI Grant & Funding Finder backend running on port ${PORT}`);
});
