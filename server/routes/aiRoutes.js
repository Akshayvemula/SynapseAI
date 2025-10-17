import express from 'express';
import { 
  generateArticle, 
  generateBlogTitle, 
  generateImage, 
  removeImageBackground, 
  removeImageObject, 
  reviewResume 
} from '../controllers/aiController.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';

const aiRouter = express.Router();

// Articles & Blog Titles (text generation)
aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);

// Images
aiRouter.post('/generate-image', auth, generateImage);

// Image edits
aiRouter.post('/remove-image-background', auth, upload.single('image'), removeImageBackground);
aiRouter.post('/remove-image-object', auth, upload.single('image'), removeImageObject);

// Resume review
aiRouter.post('/resume-review', auth, upload.single('resume'), reviewResume);

export default aiRouter;
