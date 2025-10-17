import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import FormData from "form-data";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// ----------------- Generate Article -----------------
export const generateArticle = async (req, res) => {
  try {
    const { userId, plan, free_usage } = req;
    const { prompt, length = 500 } = req.body;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type) VALUES(${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------- Generate Blog Title -----------------
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId, plan, free_usage } = req;
    const { prompt } = req.body;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type) VALUES(${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------- Generate Image -----------------
export const generateImage = async (req, res) => {
  try {
    const { userId, plan } = req;
    const { prompt, publish } = req.body;

    if (plan !== 'premium') {
      return res.json({ success: false, message: "This feature is only available for premium users." });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      { headers: { 'x-api-key': process.env.CLIPDROP_API_KEY }, responseType: "arraybuffer" }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations(user_id, prompt, content, type, publish) VALUES(${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ----------------- Remove Image Background -----------------
export const removeImageBackground = async (req, res) => {
  try {
    const { userId, plan, free_usage } = req;
    const image = req.file;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "This feature is only available for premium users." });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, { transformation: [{ effect: "background_removal" }] });

    await sql`INSERT INTO creations(user_id, prompt, content, type) VALUES(${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  } finally {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
  }
};

// ----------------- Remove Object from Image -----------------
export const removeImageObject = async (req, res) => {
  try {
    const { userId, plan, free_usage } = req;
    const { object } = req.body;
    const image = req.file;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "This feature is only available for premium users." });
    }

    const result = await cloudinary.uploader.upload(image.path);
    const imageUrl = cloudinary.url(result.public_id, { transformation: [{ effect: `gen_remove:${object}` }] });

    await sql`INSERT INTO creations(user_id, prompt, content, type) VALUES(${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  } finally {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
  }
};

// ----------------- Resume Review -----------------
export const reviewResume = async (req, res) => {
  try {
    const { userId, plan, free_usage } = req;
    const resume = req.file;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({ success: false, message: "This feature is only available for premium users." });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)" });
    }

    const dataBuffer = await fs.readFile(resume.path);
    const pdfData = await pdf(dataBuffer);

    await fs.unlink(resume.path).catch(() => {});

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type) VALUES(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.json({ success: true, content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
