import { Router } from "express";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";

const dashboardRouter = Router();
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

dashboardRouter.get("/stats", authenticate, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const [openCount, inProgressCount, completedCount, propertyCount] = await Promise.all([
      prisma.ticket.count({ where: { tenantId, status: "OPEN" } }),
      prisma.ticket.count({ where: { tenantId, status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { tenantId, status: "COMPLETED" } }),
      prisma.property.count({ where: { tenantId } }),
    ]);

    res.json({
      open: openCount,
      inProgress: inProgressCount,
      completed: completedCount,
      properties: propertyCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default dashboardRouter;
