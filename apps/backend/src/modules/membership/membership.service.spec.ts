import { MembershipService } from "./membership.service";

describe("MembershipService", () => {
  it("should be defined", () => {
    const service = new MembershipService({} as never);
    expect(service).toBeDefined();
  });
});
