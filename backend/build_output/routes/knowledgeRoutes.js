import { Router } from "express";
import { requestKnowledgeGeneration, saveKnowledge, getKnowledgeList } from "../controllers/knowledgeController.js";
const router = Router();
// Route to generate structured data from raw text using AI
router.post("/generate", requestKnowledgeGeneration);
// Route to save the final approved knowledge to database
router.post("/", saveKnowledge);
// Route to list all knowledge
router.get("/", getKnowledgeList);
export default router;
//# sourceMappingURL=knowledgeRoutes.js.map