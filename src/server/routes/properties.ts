import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

// Get all properties for the tenant
router.get("/", authenticate, async (req: any, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: "desc" }
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Create a new property
router.post("/", authenticate, async (req: any, res) => {
  const { name, address, zipCode, city } = req.body;
  
  if (!name || !address || !zipCode || !city) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const property = await prisma.property.create({
      data: {
        name,
        address,
        zipCode,
        city,
        tenantId: req.user.tenantId
      }
    });

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`tenant:${req.user.tenantId}`).emit("property-added", property);
    }

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: "Failed to create property" });
  }
});

export default router;
