import { Router } from "express";
import {
    requestKnowledgeGeneration,
    saveKnowledge,
    getKnowledgeList,
    saveDraft,
    getDrafts,
    deleteDraft
} from "../controllers/knowledgeController.js";

const router = Router();
console.log("✅ Loading Knowledge Routes");

// Route to generate structured data from raw text using AI
router.post("/generate", requestKnowledgeGeneration);

// Route to save the final approved knowledge to database
router.post("/", saveKnowledge);

// Route to list all knowledge
router.get("/", getKnowledgeList);

// Drafts
router.post("/drafts", saveDraft);
router.get("/drafts", getDrafts);
router.delete("/drafts/:id", deleteDraft);

export default router;
