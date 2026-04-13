import 'dotenv/config'
import { prisma } from '../src/prisma';

async function main() {
    await prisma.expense.createMany({
        data: [
            { amount: 72.45, categoryId: 1, createdAt: new Date("2026-01-05"), description: "Walmart groceries", userId: 1 },
            { amount: 1200, categoryId: 3, createdAt: new Date("2026-01-01"), description: "January rent", userId: 1 },
            { amount: 15.75, categoryId: 7, createdAt: new Date("2026-01-10"), description: "Lunch at cafe", userId: 1 },
            { amount: 49.99, categoryId: 5, createdAt: new Date("2026-01-15"), description: "Netflix subscription", userId: 1 },
            { amount: 65.20, categoryId: 1, createdAt: new Date("2026-02-03"), description: "Costco groceries", userId: 1 },
            { amount: 22.30, categoryId: 4, createdAt: new Date("2026-02-08"), description: "Uber ride downtown", userId: 1 },
            { amount: 89.99, categoryId: 6, createdAt: new Date("2026-02-18"), description: "Amazon order - headphones", userId: 1 },
            { amount: 110.00, categoryId: 2, createdAt: new Date("2026-03-02"), description: "Electricity bill", userId: 1 },
            { amount: 35.40, categoryId: 7, createdAt: new Date("2026-03-14"), description: "Dinner with friends", userId: 1 },
            { amount: 18.99, categoryId: 8, createdAt: new Date("2026-04-03"), description: "Pharmacy purchase", userId: 1 }
        ]
    });
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
    });