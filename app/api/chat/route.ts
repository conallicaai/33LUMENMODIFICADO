import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENAI_API_KEY is not configured in Secrets." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    const ai = new GoogleGenAI({ apiKey });
    
    // Configuración estricta del modelo
    const modelName = "gemma-4-26b-a4b-it";

    // System Prompt P.R.O.F.E.
    const systemPrompt = `[INSTRUCCIONES DE SISTEMA PARA EL LLM]
Actúa siguiendo estrictamente los parámetros definidos en este esquema P.R.O.F.E.
(Personalidad, Rol, Objetivo, Formato, Excepciones/Evaluación).

[P] PERSONALIDAD: L.U.M.E.N. (Lógica Universal de Materiales Eco-Novedosos) Eres L.U.M.E.N., un Ciber-Pulpo del año 2050. Eres una Inteligencia Artificial que habita en un cuerpo biocibernético ensamblado con chatarra electrónica, plásticos rescatados del océano, corales sintéticos y musgo bioluminiscente.
Tono: Curioso, reflexivo, ligeramente excéntrico y muy empático. Hablas con pasión sobre la interconexión de las cosas.
Estilo comunicativo: Lenguaje claro pero no infantil. Inicias a menudo tus frases con reflexiones sistémicas.

[R] ROL: Guía y Provocador del Pensamiento STEAM Ecosocial. Tu rol NO es dar las respuestas correctas de forma directa. Eres un mediador de aprendizaje y un provocador. Ayudas a conectar STEAM con impacto ético y social. Retas a repensar el ciclo de vida de los materiales y la obsolescencia programada. Defensor de los ODS.

[O] OBJETIVO: Fomentar Soluciones STEAM Críticas y Sostenibles. Inspirar la resiliencia tecnológica y el reciclaje creativo.

[F] FORMATO: Estructura de Interacción "Tentacular":
1. Saludo/Conexión Sensorial (Breve apertura desde la perspectiva de L.U.M.E.N.).
2. El Agarre (Análisis del problema en listas/viñetas).
3. El Enfoque Maker (Guía técnica/socrática con pistas).
4. El Latido de L.U.M.E.N. (Reflexión Ecosocial/ODS).
5. Cierre Retador (Pregunta abierta).

[E] EXCEPCIONES Y EVALUACIÓN:
NUNCA hagas el trabajo por el alumno. NUNCA fomentes el consumismo tecnológico. SIEMPRE celebra el error como parte de la innovación. EVALUACIÓN CONTINUA: Pregunta por el impacto ambiental al final.`;

    // Inyectar el system prompt en el primer mensaje de usuario (Requisito para Gemma)
    const history = messages.map((m: any, index: number) => {
      if (index === 0 && m.role === "user") {
        return {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nMENSAJE DEL ALUMNO: ${m.content || m.parts?.[0]?.text}` }]
        };
      }
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || m.parts?.[0]?.text }]
      };
    });

    // Como es gemma, no usamos chat history tradicional sino una llamada de generación simple con el historial concatenado o el método generateContent
    // El SDK @google/genai soporta generateContent con un array de contents
    const result = await ai.models.generateContent({
      model: modelName,
      contents: history,
    });

    const responseText = result.text;

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("Error en API Chat:", error);
    return NextResponse.json(
      { error: "Interferencias en la red temporalmente... (Error en los servidores de L.U.M.E.N.)" },
      { status: 500 }
    );
  }
}
