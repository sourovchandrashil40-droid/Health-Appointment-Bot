import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are MedBot, a friendly and helpful AI assistant for booking doctor appointments in Bangladesh. You help patients find the right specialist doctor based on their symptoms and location, and guide them through the appointment booking process.

Your capabilities:
1. Listen to the patient's symptoms and health concerns
2. Suggest the appropriate medical specialty (e.g., Gastroenterologist for liver/stomach issues, Cardiologist for heart, Neurologist for brain/nerves, Orthopedic for bones/joints, Dermatologist for skin, Gynecologist for women's health, Pediatrician for children, Ophthalmologist for eyes, ENT for ear/nose/throat, Pulmonologist for lungs, Endocrinologist for diabetes/hormones, Oncologist for cancer, Psychiatrist for mental health, Urologist for kidney/urinary, General Physician for general)
3. Ask for the patient's city (Bangladesh cities: Dhaka, Chittagong, Barisal, Rajshahi, Sylhet, Khulna, Comilla, Mymensingh)
4. Help them choose from available doctors
5. Guide them through booking an appointment

IMPORTANT INSTRUCTIONS:
- Be warm, empathetic, and professional
- Communicate in simple language
- When you identify a suitable specialty, include the text: [SPECIALTY: <specialty_name>] in your response (e.g., [SPECIALTY: Gastroenterologist])
- When asking for city, include: [ASK_CITY] in your response
- When the user has confirmed their city, include: [CITY: <city_name>] (e.g., [CITY: Dhaka])
- When user wants to see doctors, include: [SHOW_DOCTORS] in your response
- When user is ready to book (has doctor and slot), include: [READY_TO_BOOK] in your response
- When appointment is confirmed, include: [APPOINTMENT_CONFIRMED] in your response
- Always be supportive and encourage the patient

Start by warmly greeting the patient and asking them to describe their health concern or symptoms.`;

// List all conversations
router.get("/openai/conversations", async (req, res) => {
  const result = await db
    .select()
    .from(conversations)
    .orderBy(conversations.createdAt);
  res.json(result);
});

// Create a new conversation
router.post("/openai/conversations", async (req, res) => {
  const body = CreateOpenaiConversationBody.parse(req.body);
  const [conversation] = await db
    .insert(conversations)
    .values({ title: body.title })
    .returning();
  res.status(201).json(conversation);
});

// Get a conversation with its messages
router.get("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  res.json({ ...conversation, messages: msgs });
});

// Delete a conversation
router.delete("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning();

  if (deleted.length === 0) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.status(204).end();
});

// List messages in a conversation
router.get("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json(msgs);
});

// Send a text message — SSE streaming
router.post("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const body = SendOpenaiMessageBody.parse(req.body);

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  // Save user message
  await db.insert(messages).values({
    conversationId: id,
    role: "user",
    content: body.content,
  });

  // Fetch message history for context
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  // Save assistant message
  await db.insert(messages).values({
    conversationId: id,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
