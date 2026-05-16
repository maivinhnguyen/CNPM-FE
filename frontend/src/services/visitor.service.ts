import { mockVisitorPasses, delay } from "@/mock/data";
import type { VisitorPass } from "@/types";

class VisitorService {
  private passes: VisitorPass[] = [...mockVisitorPasses];

  async getMyPasses(userId: string): Promise<VisitorPass[]> {
    await delay(300);
    return this.passes
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createVisitorPass(userId: string, visitorName: string, visitorPhone: string, vehiclePlate: string, validDate: string): Promise<VisitorPass> {
    await delay(500);
    const newPass: VisitorPass = {
      id: "vp" + Date.now(),
      userId,
      visitorName,
      visitorPhone,
      vehiclePlate,
      validDate,
      status: "valid",
      qrCodeData: `VISITOR-${vehiclePlate}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.passes.unshift(newPass);
    return newPass;
  }
}

export const visitorService = new VisitorService();
