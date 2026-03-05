import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { analyzeMaintenanceRequest } from "../services/aiService";

console.log("[PublicRouter] Module executing...");

const publicRouter = Router();
console.log("[Router] Public router initialized");

const TicketSchema = z.object({
  propertyId: z.string(),
  unit: z.string().optional(),
  urgency: z.enum(["NOT_SURE", "NORMAL", "URGENT", "EMERGENCY"]),
  description: z.string().min(10),
  contactName: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  permissionToEnter: z.boolean(),
  aiResult: z.any().optional(), // From frontend
});

publicRouter.post("/tickets", async (req, res) => {
  try {
    const data = TicketSchema.parse(req.body);
    
    // Find property to get tenantId
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Perform AI Analysis
    console.log("[PublicRouter] Analyzing ticket with AI...");
    const aiResult = await analyzeMaintenanceRequest(data.description);

    const referenceId = `PC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const ticket = await prisma.ticket.create({
      data: {
        referenceId,
        propertyId: data.propertyId,
        unit: data.unit,
        urgency: data.urgency === "NOT_SURE" ? aiResult.urgency : data.urgency,
        description: data.description,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        permissionToEnter: data.permissionToEnter,
        tenantId: property.tenantId,
        aiResult: {
          create: {
            category: aiResult.category,
            urgency: aiResult.urgency,
            recommendedContractors: JSON.stringify(aiResult.recommendedContractors),
            draftEmailSubject: aiResult.draftEmail.subject,
            draftEmailBody: aiResult.draftEmail.body,
            missingInfo: JSON.stringify(aiResult.missingInfo),
          }
        },
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        action: "TICKET_CREATED",
        details: JSON.stringify({ source: "PUBLIC_FORM" }),
      },
    });

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      // Fetch full ticket data for the dashboard
      const fullTicket = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: { 
          property: { select: { name: true } },
          aiResult: { select: { category: true, urgency: true } }
        }
      });
      io.to(`tenant:${property.tenantId}`).emit("ticket-created", fullTicket);
    }

    res.json({ success: true, referenceId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Get properties for the public form (filtered by tenant)
publicRouter.get("/properties", async (req, res) => {
  const { tenantId } = req.query;
  console.log(`[GET] /api/public/properties?tenantId=${tenantId}`);
  
  if (!tenantId) return res.status(400).json({ error: "Missing tenantId" });

  try {
    // First, try to find the tenant by subdomain if it's not a UUID
    let actualTenantId = tenantId as string;
    if (tenantId === "demo") {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain: "demo" }
      });
      if (tenant) actualTenantId = tenant.id;
    }

    const properties = await prisma.property.findMany({
      where: { tenantId: actualTenantId },
      select: { id: true, name: true, address: true },
    });

    // Fallback for demo purposes if DB is empty
    if (properties.length === 0 && tenantId === "demo") {
      console.log("[GET] No properties found in DB, returning fallback data");
      return res.json([
        { id: "fallback-1", name: "Sunset Apartments", address: "Zürichstrasse 45, 8001 Zürich" },
        { id: "fallback-2", name: "Alpine Heights", address: "Gstaad Road 12, 3780 Gstaad" }
      ]);
    }

    console.log(`[GET] Found ${properties.length} properties`);
    res.json(properties);
  } catch (error: any) {
    console.error("[GET] /properties error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default publicRouter;
