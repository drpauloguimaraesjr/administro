import { Router } from "express";
import {
    requestKnowledgeGeneration,
    saveKnowledge,
    getKnowledgeList,
    saveDraft,
    getDrafts,
    deleteDraft,
    getKnowledgeBase,
    deleteKnowledge
} from "../controllers/knowledgeController.js";

const router = Router();
console.log("✅ Loading Knowledge Routes");

// Route to generate structured data from raw text using AI
router.post("/generate", requestKnowledgeGeneration);

// Route to save the final approved knowledge to database
router.post("/", saveKnowledge);

// Route to list all knowledge (legacy)
router.get("/", getKnowledgeList);

// Route to get knowledge base with search/filter (new)
router.get("/library", getKnowledgeBase);

// Route to delete a knowledge item
router.delete("/:id", deleteKnowledge);

// Drafts
router.post("/drafts", saveDraft);
router.get("/drafts", getDrafts);
router.delete("/drafts/:id", deleteDraft);

export default router;
