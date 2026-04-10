import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";

const RULES = [
  { level: "L1", min: 0 },
  { level: "L2", min: 1000 },
  { level: "L3", min: 5000 },
];

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccount(userId: string) {
    let account = await this.prisma.membershipAccount.findUnique({ where: { userId } });
    if (!account) {
      account = await this.prisma.membershipAccount.create({ data: { userId } });
    }
    return account;
  }

  async changePoints(userId: string, changeValue: number, reason: string) {
    const account = await this.getAccount(userId);
    const points = account.points + changeValue;
    const level = [...RULES].reverse().find((r) => points >= r.min)?.level ?? "L1";

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.membershipAccount.update({
        where: { id: account.id },
        data: { points, currentLevel: level, version: { increment: 1 } },
      });
      await tx.pointsLedger.create({
        data: { accountId: account.id, changeValue, reason },
      });
      return updated;
    });
  }

  async ledger(userId: string) {
    const account = await this.prisma.membershipAccount.findUnique({ where: { userId } });
    if (!account) throw new NotFoundException("Membership account not found");
    return this.prisma.pointsLedger.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
    });
  }
}
