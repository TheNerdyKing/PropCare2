import { Router } from "express";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";

const contractorRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "PLACEHOLDER_JWT_SECRET";

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

contractorRouter.get("/", authenticate, async (req: any, res) => {
  try {
    const contractors = await prisma.contractor.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { name: "asc" }
    });
    res.json(contractors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default contractorRouter;
