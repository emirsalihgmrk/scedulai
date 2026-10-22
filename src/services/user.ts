import { updateUser } from "@/dal/user/mutations";
import { saveTimeZoneSchema } from "@/schemas/user";
import type { SaveTimeZoneInput } from "@/schemas/user";
import { getCurrentUserService } from "@/services/auth";

// Reported by the browser on every visit; guests have nowhere to keep it.
export async function saveTimeZoneService(
  input: SaveTimeZoneInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) return;

  const { timeZone } = saveTimeZoneSchema.parse(input);
  if (timeZone === user.timeZone) return;

  await updateUser(user.id, { timeZone });
}
