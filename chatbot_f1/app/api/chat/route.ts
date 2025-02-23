import { streamText, openai } from "ai"; // Importa openai desde ai
import { OpenAI } from "openai"; // SDK oficial de OpenAI
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

// Inicializa OpenAI con su API key
const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });

// Inicializa la base de datos
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content || "";

    let docContext = "";

    // Obtener embedding del mensaje más reciente
    const embeddingResponse = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    const embedding = embeddingResponse.data[0].embedding;

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(
        {},
        {
          sort: { $vector: embedding },
          limit: 10,
        }
      );

      const documents = await cursor.toArray();
      const docsMaps = documents?.map((doc) => doc.text);
      docContext = JSON.stringify(docsMaps);
    } catch (error) {
      console.error("Error querying db:", error);
      docContext = "";
    }

    const template = {
      role: "system",
      content: `You are an AI assistant who knows everything about Formula 1. Use the below context to augment what you know about Formula One racing. 
      The context will provide you with the most recent page data from Wikipedia, the official F1 website, and other sources. 
      If the context doesn’t include the information you need, answer based on your existing knowledge and don’t mention the source of your information or what the context does 
      or doesn’t include. 
      Format responses using markdown where applicable and don’t return images.
      --------------------
      START CONTEXT
      ${docContext}
      END CONTEXT
      --------------------
      QUESTION: ${latestMessage}
      --------------------`,
    };

    // 🔥 Usar el modelo OpenAI del SDK de "ai"
    const result = await streamText({
      model: openai("gpt-4"), // 💡 CORREGIDO: Se pasa un objeto válido, no un string
      system: template.content,
      messages,
    });

    return new Response(result.toString(), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing request:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
