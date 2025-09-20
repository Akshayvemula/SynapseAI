import OpenAI from "openai";
import sql from "../configs/db.js";
import {clerkClient} from "@clerk/express"
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


// generate article


export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth; // Clerk auth
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Usage limits
    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    // Call AI model (adjust based on actual SDK you're using)
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    // Save to DB
    await sql`
      INSERT INTO creations(user_id, prompt, content, type) 
      VALUES(${userId}, ${prompt}, ${content}, 'article')
    `;

    // Update usage if not premium
    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    // Success response
    res.json({
      success: true,
      content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};








//blog title

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    // Adjust depending on SDK
    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations(user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

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











// generate image 




export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage || 0; // make sure to fetch this

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer"
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations(user_id, prompt, content, type, publish) 
      VALUES(${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({
      success: true,
      content: secure_url
    });

  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// remove background




export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file; // multer file
    const plan = req.plan;
    const free_usage = req.free_usage || 0; // make sure to fetch this

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal" }]
    });

    await sql`
      INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    res.json({
      success: true,
      content: secure_url
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// remove object 




export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage || 0;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    const result = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(result.public_id, {
      transformation: [{ effect: `gen_remove:${object}` }] // check if supported
    });

    await sql`
      INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    res.json({
      success: true,
      content: imageUrl
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
}

// review resume

export const reviewResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage || 0;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB)"
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    // Delete the uploaded file after processing
    fs.unlinkSync(resume.path);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations(user_id, prompt, content, type)
      VALUES(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};








