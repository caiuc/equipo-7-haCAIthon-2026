import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.purchaseRequest.deleteMany()
  await prisma.transfer.deleteMany()
  await prisma.stockOffer.deleteMany()
  await prisma.stockRequest.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.medicationSupplier.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.consumptionRecord.deleteMany()
  await prisma.medication.deleteMany()
  await prisma.healthCenter.deleteMany()

  // Suppliers
  const supplierX = await prisma.supplier.create({ data: { name: 'Proveedor X', contactName: 'Ana Ruiz', email: 'ana@provx.example', phone: '+56912345678' } })
  const supplierY = await prisma.supplier.create({ data: { name: 'Proveedor Y', contactName: 'Carlos Vega', email: 'carlos@provy.example', phone: '+56987654321' } })

  // Medications
  const meds = await Promise.all([
    prisma.medication.create({ data: { name: 'Losartán', dosage: '50 mg', unit: 'unidad' } }),
    prisma.medication.create({ data: { name: 'Metformina', dosage: '850 mg', unit: 'unidad' } }),
    prisma.medication.create({ data: { name: 'Paracetamol', dosage: '500 mg', unit: 'unidad' } }),
    prisma.medication.create({ data: { name: 'Insulina NPH', dosage: '', unit: 'unidad' } }),
    prisma.medication.create({ data: { name: 'Atorvastatina', dosage: '20 mg', unit: 'unidad' } }),
  ])

  // Link meds to suppliers
  await prisma.medicationSupplier.create({ data: { medicationId: meds[0].id, supplierId: supplierX.id } })
  await prisma.medicationSupplier.create({ data: { medicationId: meds[1].id, supplierId: supplierY.id } })
  await prisma.medicationSupplier.create({ data: { medicationId: meds[2].id, supplierId: supplierX.id } })

  // Health centers with plausible coords (Santiago areas)
  const centersData = [
    { name: 'CESFAM A', type: 'CESFAM', latitude: -33.493, longitude: -70.600 },
    { name: 'CESFAM B', type: 'CESFAM', latitude: -33.485, longitude: -70.610 },
    { name: 'CESFAM C', type: 'CESFAM', latitude: -33.470, longitude: -70.620 },
    { name: 'COSAM San Joaquín', type: 'COSAM', latitude: -33.498, longitude: -70.606 },
    { name: 'COSAM La Florida', type: 'COSAM', latitude: -33.517, longitude: -70.572 },
    { name: 'COSAM Macul', type: 'COSAM', latitude: -33.475, longitude: -70.614 },
    { name: 'SAPU San Miguel', type: 'SAPU', latitude: -33.484, longitude: -70.656 },
    { name: 'Hospital Barros Luco Trudeau', type: 'HOSPITAL', latitude: -33.479, longitude: -70.667 },
  ]

  const centers = [] as any[]
  for (const c of centersData) {
    const created = await prisma.healthCenter.create({ data: { name: c.name, type: c.type as any, address: c.name + ' address', latitude: c.latitude, longitude: c.longitude } })
    centers.push(created)
  }

  const now = new Date()

  // Inventories: create for a subset of medications with varied stocks
  // CESFAM B: Losartán stock 100, demand 30, next restock 8 days, safetyStockDays 2
  const cesfamB = centers.find((c) => c.name === 'CESFAM B')
  const losartan = meds.find((m) => m.name === 'Losartán')
  await prisma.inventory.create({ data: { healthCenterId: cesfamB.id, medicationId: losartan.id, currentStock: 100, estimatedDailyDemand: 30, safetyStockDays: 2, nextRestockDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000) } })

  // CESFAM A: Losartán stock 1000, demand 25
  const cesfamA = centers.find((c) => c.name === 'CESFAM A')
  await prisma.inventory.create({ data: { healthCenterId: cesfamA.id, medicationId: losartan.id, currentStock: 1000, estimatedDailyDemand: 25, safetyStockDays: 3, nextRestockDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) } })

  // Other centers inventories (mixed)
  const cesfamC = centers.find((c) => c.name === 'CESFAM C')
  await prisma.inventory.create({ data: { healthCenterId: cesfamC.id, medicationId: losartan.id, currentStock: 150, estimatedDailyDemand: 20, safetyStockDays: 2, nextRestockDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000) } })

  const cosamSJ = centers.find((c) => c.name === 'COSAM San Joaquín')
  await prisma.inventory.create({ data: { healthCenterId: cosamSJ.id, medicationId: losartan.id, currentStock: 300, estimatedDailyDemand: 10, safetyStockDays: 3, nextRestockDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } })

  // Add inventories for other medications for demo
  for (const center of centers) {
    for (const med of meds.slice(1)) {
      await prisma.inventory.create({ data: { healthCenterId: center.id, medicationId: med.id, currentStock: Math.floor(200 + Math.random() * 800), estimatedDailyDemand: Math.floor(5 + Math.random() * 30), safetyStockDays: 3, nextRestockDate: new Date(now.getTime() + (7 + Math.floor(Math.random() * 10)) * 24 * 60 * 60 * 1000) } })
    }
  }

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
