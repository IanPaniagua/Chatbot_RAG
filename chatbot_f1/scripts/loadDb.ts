import { DataAPIClient } from "@datastax/astra-db-ts";
import puppeteer from "puppeteer-core";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY } = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.skysports.com/f1',
    'https://www.formula1.com/'
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

// Crear la colección en Astra DB
const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric
            }
        });
        console.log(res);
    } catch (error) {
        console.error("Error al crear la colección:", error);
    }
};

// Función para cargar los datos de ejemplo
const loadSampleData = async () => {
    try {
        const collection = await db.collection(ASTRA_DB_COLLECTION);
        for (const url of f1Data) {
            const content = await scrapePage(url);  // Obtener el contenido de la página
            const cleanContent = content.replace(/<[^>]*>?/gm, '');  // Eliminar etiquetas HTML
            const chunks = await splitter.splitText(cleanContent);  // Dividir el contenido en partes

            for (const chunk of chunks) {
                const embedding = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunk,
                    encoding_format: "float"
                });

                const vector = embedding.data[0].embedding;

                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk
                });
                console.log(res);
            }
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
};

// Función para hacer scraping de una página
const scrapePage = async (url: string) => {
    try {
        // Si el navegador no está iniciado, lo lanzamos
        const browser = await startBrowser();

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const result = await page.evaluate(() => document.body.innerHTML);  // Obtener el contenido HTML de la página

        await browser.close();
        return result;
    } catch (error) {
        console.error(`Error al hacer scraping en ${url}:`, error);
        return "";
    }
};

// Función para iniciar el navegador (solo es necesario si no tienes Puppeteer completo)
async function startBrowser() {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true
    });

    console.log("Navegador iniciado correctamente.");
    return browser;
}

// Ejecutar la creación de la colección y la carga de datos
const initialize = async () => {
    await createCollection();
    await loadSampleData();
};

initialize().catch(console.error);