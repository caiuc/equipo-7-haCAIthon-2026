import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { HealthCenterType, PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definido para el seed");
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

  const supplierZ = await prisma.supplier.create({
    data: {
      name: "Proveedor Z",
      contactName: "María Fernández",
      email: "maria@proveedorz.cl",
      phone: "+56911223344",
    },
  });

  const medications = await Promise.all([
    prisma.medication.create({ data: { name: "Losartan", dosage: "50 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Metformina", dosage: "850 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Paracetamol", dosage: "500 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Insulina NPH", dosage: "UI", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Atorvastatina", dosage: "20 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Amoxicilina", dosage: "500 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Salbutamol", dosage: "100 mcg", unit: "inhalador" } }),
    prisma.medication.create({ data: { name: "Omeprazol", dosage: "20 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Enalapril", dosage: "10 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Levotiroxina", dosage: "100 mcg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Sertralina", dosage: "50 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Quetiapina", dosage: "25 mg", unit: "unidad" } }),
    prisma.medication.create({ data: { name: "Clonazepam", dosage: "0.5 mg", unit: "unidad" } }),
  ]);

  for (const medication of medications) {
    const supplierId =
      ["Insulina NPH", "Sertralina", "Quetiapina", "Clonazepam"].includes(
        medication.name,
      )
        ? supplierY.id
        : ["Amoxicilina", "Salbutamol"].includes(medication.name)
          ? supplierZ.id
          : supplierX.id;

    await prisma.medicationSupplier.create({
      data: {
        medicationId: medication.id,
        supplierId,
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
      address: "San Joaquín, cerca del límite con La Florida",
      latitude: -33.4938,
      longitude: -70.5908,
    },
    {
      name: "CESFAM B",
      type: HealthCenterType.CESFAM,
      address: "San Joaquín, cerca de Macul",
      latitude: -33.4858,
      longitude: -70.6001,
    },
    {
      name: "CESFAM C",
      type: HealthCenterType.CESFAM,
      address: "Sector La Legua, San Joaquín",
      latitude: -33.5003,
      longitude: -70.6339,
    },
    {
      name: "COSAM San Joaquin",
      type: HealthCenterType.COSAM,
      address: "Santa Rosa, San Joaquín",
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
    {
      name: "CESFAM La Florida",
      type: HealthCenterType.CESFAM,
      address: "Avenida La Florida 6015, La Florida",
      latitude: -33.5242,
      longitude: -70.5889,
    },
    {
      name: "CESFAM Los Castaños",
      type: HealthCenterType.CESFAM,
      address: "Diagonal Los Castaños 5820, La Florida",
      latitude: -33.5225,
      longitude: -70.5987,
    },
    {
      name: "CESFAM Bellavista",
      type: HealthCenterType.CESFAM,
      address: "Froilán Roa 6420, La Florida",
      latitude: -33.5181,
      longitude: -70.5905,
    },
    {
      name: "CESFAM Maffioletti",
      type: HealthCenterType.CESFAM,
      address: "Avenida Central 301, La Florida",
      latitude: -33.5344,
      longitude: -70.5728,
    },
    {
      name: "CESFAM Félix de Amesti",
      type: HealthCenterType.CESFAM,
      address: "Macul",
      latitude: -33.4869,
      longitude: -70.5951,
    },
    {
      name: "CESFAM Santa Julia",
      type: HealthCenterType.CESFAM,
      address: "Macul",
      latitude: -33.4976,
      longitude: -70.6028,
    },
    {
      name: "CESFAM Padre Alberto Hurtado",
      type: HealthCenterType.CESFAM,
      address: "Macul",
      latitude: -33.4738,
      longitude: -70.6087,
    },
    {
      name: "CESFAM Padre Manuel Villaseca",
      type: HealthCenterType.CESFAM,
      address: "Luis Matte Larraín 2312, Puente Alto",
      latitude: -33.5854,
      longitude: -70.5822,
    },
    {
      name: "CESFAM Bernardo Leighton",
      type: HealthCenterType.CESFAM,
      address: "Miguel Ángel 1929, Puente Alto",
      latitude: -33.5993,
      longitude: -70.5794,
    },
    {
      name: "CESFAM Padre Esteban Gumucio",
      type: HealthCenterType.CESFAM,
      address: "Central 281, La Granja",
      latitude: -33.5357,
      longitude: -70.6259,
    },
    {
      name: "COSAM La Pintana",
      type: HealthCenterType.COSAM,
      address: "Patagonia 12834, La Pintana",
      latitude: -33.5834,
      longitude: -70.6352,
    },
    {
      name: "COSAM Puente Alto",
      type: HealthCenterType.COSAM,
      address: "Puente Alto",
      latitude: -33.6101,
      longitude: -70.5757,
    },
    {
      name: "COSAM Ñuñoa",
      type: HealthCenterType.COSAM,
      address: "Ñuñoa",
      latitude: -33.4569,
      longitude: -70.5979,
    },
    {
      name: "COSAM Santiago",
      type: HealthCenterType.COSAM,
      address: "Santiago Centro",
      latitude: -33.4489,
      longitude: -70.6693,
    },
    {
      name: "SAPU La Florida",
      type: HealthCenterType.SAPU,
      address: "Avenida La Florida 6015, La Florida",
      latitude: -33.5246,
      longitude: -70.5898,
    },
    {
      name: "SAR Los Castaños",
      type: HealthCenterType.SAPU,
      address: "Diagonal Los Castaños 5820, La Florida",
      latitude: -33.5227,
      longitude: -70.5989,
    },
    {
      name: "SAPU Bernardo Leighton",
      type: HealthCenterType.SAPU,
      address: "Miguel Ángel 1929, Puente Alto",
      latitude: -33.5995,
      longitude: -70.5798,
    },
    {
      name: "SAPU Padre Esteban Gumucio",
      type: HealthCenterType.SAPU,
      address: "Padre Esteban Gumucio 281, La Granja",
      latitude: -33.536,
      longitude: -70.6266,
    },
    {
      name: "Hospital Sótero del Río",
      type: HealthCenterType.HOSPITAL,
      address: "Concha y Toro 3459, Puente Alto",
      latitude: -33.5766,
      longitude: -70.5834,
    },
    {
      name: "Hospital La Florida Dra. Eloísa Díaz",
      type: HealthCenterType.HOSPITAL,
      address: "Froilán Roa 6542, La Florida",
      latitude: -33.5178,
      longitude: -70.5879,
    },
    {
      name: "Hospital El Pino",
      type: HealthCenterType.HOSPITAL,
      address: "San Bernardo",
      latitude: -33.5699,
      longitude: -70.6753,
    },
    {
      name: "Hospital San José",
      type: HealthCenterType.HOSPITAL,
      address: "Independencia",
      latitude: -33.4138,
      longitude: -70.6535,
    },
    {
      name: "Hospital Dr. Félix Bulnes",
      type: HealthCenterType.HOSPITAL,
      address: "Cerro Navia",
      latitude: -33.4228,
      longitude: -70.7355,
    },
    {
      name: "Hospital El Carmen de Maipú",
      type: HealthCenterType.HOSPITAL,
      address: "Maipú",
      latitude: -33.5056,
      longitude: -70.7716,
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

  const centersWithLosartan = new Set([
    "CESFAM A",
    "CESFAM B",
    "CESFAM C",
    "COSAM San Joaquin",
    "COSAM La Florida",
    "COSAM Macul",
    "SAPU San Miguel",
    "Hospital Barros Luco Trudeau",
  ]);

  for (const center of healthCenters) {
    if (centersWithLosartan.has(center.name)) {
      continue;
    }

    const centerFactor =
      center.type === HealthCenterType.HOSPITAL
        ? 1.6
        : center.type === HealthCenterType.SAPU
          ? 1.25
          : 1;

    await prisma.inventory.create({
      data: {
        healthCenterId: center.id,
        medicationId: losartan.id,
        currentStock: Math.round(420 * centerFactor),
        estimatedDailyDemand: Math.round(18 * centerFactor),
        safetyStockDays: 3,
        nextRestockDate: daysFromNow(8),
      },
    });
  }

  const templateByMedication: Record<string, { baseStock: number; baseDemand: number }> = {
    Metformina: { baseStock: 520, baseDemand: 22 },
    Paracetamol: { baseStock: 780, baseDemand: 34 },
    "Insulina NPH": { baseStock: 310, baseDemand: 12 },
    Atorvastatina: { baseStock: 460, baseDemand: 16 },
    Amoxicilina: { baseStock: 360, baseDemand: 15 },
    Salbutamol: { baseStock: 160, baseDemand: 6 },
    Omeprazol: { baseStock: 540, baseDemand: 20 },
    Enalapril: { baseStock: 410, baseDemand: 14 },
    Levotiroxina: { baseStock: 300, baseDemand: 10 },
    Sertralina: { baseStock: 240, baseDemand: 8 },
    Quetiapina: { baseStock: 190, baseDemand: 7 },
    Clonazepam: { baseStock: 150, baseDemand: 5 },
  };

  const inventoryOverrides: Record<
    string,
    { stock: number; demand: number; safetyStockDays: number; restockDays: number }
  > = {
    "CESFAM Los Castaños|Metformina": {
      stock: 80,
      demand: 32,
      safetyStockDays: 3,
      restockDays: 7,
    },
    "CESFAM Bellavista|Salbutamol": {
      stock: 14,
      demand: 8,
      safetyStockDays: 2,
      restockDays: 6,
    },
    "SAPU La Florida|Paracetamol": {
      stock: 95,
      demand: 52,
      safetyStockDays: 2,
      restockDays: 5,
    },
    "Hospital Sótero del Río|Insulina NPH": {
      stock: 120,
      demand: 48,
      safetyStockDays: 4,
      restockDays: 7,
    },
    "CESFAM Padre Manuel Villaseca|Amoxicilina": {
      stock: 35,
      demand: 18,
      safetyStockDays: 3,
      restockDays: 6,
    },
    "COSAM La Pintana|Sertralina": {
      stock: 18,
      demand: 11,
      safetyStockDays: 3,
      restockDays: 8,
    },
    "COSAM Ñuñoa|Quetiapina": {
      stock: 12,
      demand: 9,
      safetyStockDays: 3,
      restockDays: 7,
    },
    "Hospital El Carmen de Maipú|Levotiroxina": {
      stock: 70,
      demand: 28,
      safetyStockDays: 4,
      restockDays: 8,
    },
    "CESFAM Santa Julia|Enalapril": {
      stock: 20,
      demand: 15,
      safetyStockDays: 2,
      restockDays: 5,
    },
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
      const override = inventoryOverrides[`${center.name}|${name}`];

      await prisma.inventory.create({
        data: {
          healthCenterId: center.id,
          medicationId: medication.id,
          currentStock: override?.stock ?? stock,
          estimatedDailyDemand: override?.demand ?? demand,
          safetyStockDays: override?.safetyStockDays ?? 3,
          nextRestockDate: daysFromNow(override?.restockDays ?? 7 + (demand % 4)),
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
