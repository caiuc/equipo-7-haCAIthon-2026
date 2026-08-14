import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { HealthCenterType, PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no esta definido para el seed");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number) {
  return new Date(Date.now() + days * DAY);
}

async function main() {
  await prisma.purchaseRequest.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.stockOffer.deleteMany();
  await prisma.stockRequest.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.medicationSupplier.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.consumptionRecord.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.healthCenter.deleteMany();

  const supplierX = await prisma.supplier.create({
    data: {
      name: "Proveedor X",
      contactName: "Ana Ruiz",
      email: "ana@proveedorx.cl",
      phone: "+56912345678",
    },
  });

  const supplierY = await prisma.supplier.create({
    data: {
      name: "Proveedor Y",
      contactName: "Carlos Vega",
      email: "carlos@proveedory.cl",
      phone: "+56987654321",
    },
  });

  const medications = await Promise.all([
    prisma.medication.create({ data: { name: "Losartan", dosage: "50 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Metformina", dosage: "850 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Paracetamol", dosage: "500 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Insulina NPH", dosage: "UI", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Atorvastatina", dosage: "20 mg", unit: "unidad" } }),
  ]);

  for (const medication of medications) {
    await prisma.medicationSupplier.create({
      data: {
        medicationId: medication.id,
        supplierId: medication.name === "Insulina NPH" ? supplierY.id : supplierX.id,
      },
    });
  }

  const healthCentersInput: Array<{
    name: string;
    type: HealthCenterType;
    address: string;
    latitude: number;
    longitude: number;
  }> = [
    {
      name: "CESFAM A",
      type: HealthCenterType.CESFAM,
      address: "San Joaquin, cerca del limite con La Florida",
      latitude: -33.4938,
      longitude: -70.5908,
    },
    {
      name: "CESFAM B",
      type: HealthCenterType.CESFAM,
      address: "San Joaquin, cerca de Macul",
      latitude: -33.4858,
      longitude: -70.6001,
    },
    {
      name: "CESFAM C",
      type: HealthCenterType.CESFAM,
      address: "Sector La Legua, San Joaquin",
      latitude: -33.5003,
      longitude: -70.6339,
    },
    {
      name: "COSAM San Joaquin",
      type: HealthCenterType.COSAM,
      address: "Santa Rosa, San Joaquin",
      latitude: -33.4978,
      longitude: -70.6215,
    },
    {
      name: "COSAM La Florida",
      type: HealthCenterType.COSAM,
      address: "Avenida La Florida",
      latitude: -33.5171,
      longitude: -70.5752,
    },
    {
      name: "COSAM Macul",
      type: HealthCenterType.COSAM,
      address: "Avenida Macul",
      latitude: -33.4788,
      longitude: -70.6001,
    },
    {
      name: "SAPU San Miguel",
      type: HealthCenterType.SAPU,
      address: "Gran Avenida, San Miguel",
      latitude: -33.4874,
      longitude: -70.6578,
    },
    {
      name: "Hospital Barros Luco Trudeau",
      type: HealthCenterType.HOSPITAL,
      address: "Gran Avenida 3204, San Miguel",
      latitude: -33.4866,
      longitude: -70.6529,
    },
  ];

  const healthCenters = await Promise.all(
    healthCentersInput.map((center) =>
      prisma.healthCenter.create({
        data: center,
      }),
    ),
  );

  const centerByName = Object.fromEntries(
    healthCenters.map((center) => [center.name, center]),
  );
  const medicationByName = Object.fromEntries(
    medications.map((medication) => [medication.name, medication]),
  );

  const losartan = medicationByName["Losartan"];

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["CESFAM B"].id,
      medicationId: losartan.id,
      currentStock: 100,
      estimatedDailyDemand: 30,
      safetyStockDays: 2,
      nextRestockDate: daysFromNow(8),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["CESFAM A"].id,
      medicationId: losartan.id,
      currentStock: 1000,
      estimatedDailyDemand: 25,
      safetyStockDays: 3,
      nextRestockDate: daysFromNow(10),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["CESFAM C"].id,
      medicationId: losartan.id,
      currentStock: 130,
      estimatedDailyDemand: 18,
      safetyStockDays: 2,
      nextRestockDate: daysFromNow(9),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["COSAM San Joaquin"].id,
      medicationId: losartan.id,
      currentStock: 320,
      estimatedDailyDemand: 11,
      safetyStockDays: 3,
      nextRestockDate: daysFromNow(7),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["COSAM La Florida"].id,
      medicationId: losartan.id,
      currentStock: 260,
      estimatedDailyDemand: 16,
      safetyStockDays: 3,
      nextRestockDate: daysFromNow(8),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["COSAM Macul"].id,
      medicationId: losartan.id,
      currentStock: 310,
      estimatedDailyDemand: 14,
      safetyStockDays: 3,
      nextRestockDate: daysFromNow(9),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["SAPU San Miguel"].id,
      medicationId: losartan.id,
      currentStock: 210,
      estimatedDailyDemand: 12,
      safetyStockDays: 2,
      nextRestockDate: daysFromNow(6),
    },
  });

  await prisma.inventory.create({
    data: {
      healthCenterId: centerByName["Hospital Barros Luco Trudeau"].id,
      medicationId: losartan.id,
      currentStock: 900,
      estimatedDailyDemand: 35,
      safetyStockDays: 4,
      nextRestockDate: daysFromNow(7),
    },
  });

  const templateByMedication: Record<string, { baseStock: number; baseDemand: number }> = {
    Metformina: { baseStock: 520, baseDemand: 22 },
    Paracetamol: { baseStock: 780, baseDemand: 34 },
    "Insulina NPH": { baseStock: 310, baseDemand: 12 },
    Atorvastatina: { baseStock: 460, baseDemand: 16 },
  };

  for (const center of healthCenters) {
    for (const [name, template] of Object.entries(templateByMedication)) {
      const medication = medicationByName[name];
      const centerFactor =
        center.type === HealthCenterType.HOSPITAL
          ? 1.5
          : center.type === HealthCenterType.SAPU
            ? 1.2
            : 1;
      const stock = Math.round(template.baseStock * centerFactor);
      const demand = Math.round(template.baseDemand * centerFactor);

      await prisma.inventory.create({
        data: {
          healthCenterId: center.id,
          medicationId: medication.id,
          currentStock: stock,
          estimatedDailyDemand: demand,
          safetyStockDays: 3,
          nextRestockDate: daysFromNow(7 + (demand % 4)),
        },
      });
    }
  }

  for (const center of healthCenters) {
    for (const medication of medications) {
      for (let dayOffset = 1; dayOffset <= 7; dayOffset += 1) {
        const inventory = await prisma.inventory.findFirstOrThrow({
          where: {
            healthCenterId: center.id,
            medicationId: medication.id,
          },
        });

        await prisma.consumptionRecord.create({
          data: {
            healthCenterId: center.id,
            medicationId: medication.id,
            date: daysFromNow(-dayOffset),
            quantityConsumed: Math.max(
              1,
              Math.round(
                inventory.estimatedDailyDemand * (0.85 + (dayOffset % 3) * 0.1),
              ),
            ),
          },
        });
      }
    }
  }

  console.log("Seed completed: MedStock demo data ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
