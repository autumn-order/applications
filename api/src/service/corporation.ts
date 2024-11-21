import CorporationRepository, {
  DbCorporation,
  DbCreateCorporation,
} from "../data/corporation";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { getCorporationInfo } from "../utils/eve/corporation";

export async function createEveCorporation(
  db: BetterSQLite3Database<Record<string, never>>,
  corporation_id: number,
): Promise<DbCorporation> {
  const corporationRepository = new CorporationRepository(db);

  const existing_corporation =
    await corporationRepository.getCorporation(corporation_id);

  if (!existing_corporation) {
    const corporation = await getCorporationInfo(corporation_id);

    const new_corporation: DbCreateCorporation = {
      corporation_id: corporation_id,
      corporation_name: corporation.name,
    };

    const created_corporation =
      await corporationRepository.createCorporation(new_corporation);

    if (!created_corporation) {
      throw new Error("Failed to create corporation");
    }

    return created_corporation;
  }

  return existing_corporation;
}
