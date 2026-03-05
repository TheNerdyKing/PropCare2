import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

// Seed demo data for the current tenant
router.post("/seed", authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;

  try {
    // 1. Create Demo Properties
    const properties = await Promise.all([
      prisma.property.create({
        data: {
          name: "Sunset Apartments",
          address: "Zürichstrasse 45",
          zipCode: "8001",
          city: "Zürich",
          tenantId
        }
      }),
      prisma.property.create({
        data: {
          name: "Alpine Heights",
          address: "Gstaad Road 12",
          zipCode: "3780",
          city: "Gstaad",
          tenantId
        }
      }),
      prisma.property.create({
        data: {
          name: "Lakeside Villa",
          address: "Quai du Mont-Blanc 13",
          zipCode: "1201",
          city: "Genève",
          tenantId
        }
      })
    ]);

    // 2. Create Demo Tickets
    await Promise.all([
      prisma.ticket.create({
        data: {
          referenceId: `PC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          propertyId: properties[0].id,
          unit: "402",
          urgency: "URGENT",
          description: "Water leaking from the ceiling in the bathroom. It's starting to affect the floor.",
          contactName: "Hans Müller",
          contactEmail: "hans@example.com",
          status: "OPEN",
          tenantId,
          aiResult: {
            create: {
              category: "PLUMBING",
              urgency: "URGENT",
              recommendedContractors: JSON.stringify(["SwissPlumb AG", "QuickFix Sanitär"]),
              draftEmailSubject: "Urgent: Water Leak at Sunset Apartments #402",
              draftEmailBody: "Hello, we have an urgent plumbing issue...",
              missingInfo: "[]"
            }
          }
        }
      }),
      prisma.ticket.create({
        data: {
          referenceId: `PC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          propertyId: properties[1].id,
          unit: "10B",
          urgency: "NORMAL",
          description: "The heating in the living room is not working. The radiator stays cold.",
          contactName: "Sarah Schneider",
          contactEmail: "sarah@example.com",
          status: "IN_PROGRESS",
          tenantId,
          aiResult: {
            create: {
              category: "HEATING",
              urgency: "NORMAL",
              recommendedContractors: JSON.stringify(["Alpine Heat Solutions"]),
              draftEmailSubject: "Maintenance: Heating issue at Alpine Heights #10B",
              draftEmailBody: "Hello, a tenant reported a heating issue...",
              missingInfo: "[]"
            }
          }
        }
      })
    ]);

    res.json({ success: true, message: "Demo data seeded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
});

// Clear demo data for the current tenant
router.post("/clear", authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;

  try {
    // Delete in order to respect foreign keys
    // First, delete AI Results and Audit Logs associated with tickets of this tenant
    const tickets = await prisma.ticket.findMany({ where: { tenantId }, select: { id: true } });
    const ticketIds = tickets.map(t => t.id);

    await prisma.aiResult.deleteMany({ where: { ticketId: { in: ticketIds } } });
    await prisma.auditLog.deleteMany({ where: { ticketId: { in: ticketIds } } });
    await prisma.attachment.deleteMany({ where: { ticketId: { in: ticketIds } } });
    await prisma.outboundEmail.deleteMany({ where: { ticketId: { in: ticketIds } } });
    
    await prisma.ticket.deleteMany({ where: { tenantId } });
    await prisma.contractorPropertyMap.deleteMany({ 
      where: { property: { tenantId } } 
    });
    await prisma.property.deleteMany({ where: { tenantId } });

    res.json({ success: true, message: "Demo data cleared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear demo data" });
  }
});

export default router;
