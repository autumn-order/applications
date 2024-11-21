import { AUTUMN_CORPORATION_IDS } from "../constants";
import ApplicationRepository, {
  GetApplicationResult,
} from "../data/application";
import { getCharacterAffiliations } from "../utils/eve/character";
import { ApplicationStatus } from "../model/application";
import CharacterRepository from "../data/character";
import { createEveCorporation } from "../service/corporation";
import {
  sendExpiredApplicationNotification,
  sendJoinedApplicationNotification,
} from "../service/webhook";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export default async function updateApplications(
  db: BetterSQLite3Database,
): Promise<string> {
  const applicationRepository = new ApplicationRepository(db);
  const characterRepository = new CharacterRepository(db);

  const pending_applications = await applicationRepository.get({
    status: ApplicationStatus.Pending,
  });
  const accepted_applications = await applicationRepository.get({
    status: ApplicationStatus.Accepted,
  });

  const pending_and_accepted_applications = pending_applications.concat(
    accepted_applications,
  );

  if (pending_and_accepted_applications.length === 0) {
    return "Ran update applications task, no applications to update.";
  }

  const currentDate = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  let unexpired_applications: GetApplicationResult[] = [];
  let expired_applications_count: number = 0;

  for (const application of pending_and_accepted_applications) {
    if (new Date(application.application.last_updated) < thirtyDaysAgo) {
      application.application.status = ApplicationStatus.Expired;

      await applicationRepository.update(application.application);
      expired_applications_count++;

      await sendExpiredApplicationNotification(db, application);
    } else if (application.application.status === ApplicationStatus.Accepted) {
      unexpired_applications.push(application);
    }
  }

  if (unexpired_applications.length === 0) {
    return `Ran update applications task, marked ${expired_applications_count} as expired, no unexpired applications to update.`;
  }

  const character_ids = unexpired_applications.map(
    (a) => a.character.character_id,
  );

  const affiliations = await getCharacterAffiliations(character_ids);
  let joined_applications_count: number = 0;
  let not_yet_accepted_count: number = 0;

  for (const application of unexpired_applications) {
    const affiliation = affiliations.find(
      (a) => a.character_id === application.character.character_id,
    );

    if (!affiliation) {
      console.error(
        `Failed to retrieve affiliation for character_id ${application.character.character_id} from ESI for user ${application.user.id}`,
      );
      continue;
    }

    if (AUTUMN_CORPORATION_IDS.includes(affiliation.corporation_id)) {
      application.application.status = ApplicationStatus.Joined;

      await applicationRepository.update(application.application);
      joined_applications_count++;

      await sendJoinedApplicationNotification(db, application);
    } else {
      not_yet_accepted_count++;
    }

    if (application.character.corporation_id !== affiliation.corporation_id) {
      application.character.corporation_id = affiliation.corporation_id;

      await createEveCorporation(db, affiliation.corporation_id);

      await characterRepository.update(application.character);
    }
  }

  return `Ran update applications task, marked ${expired_applications_count} applications as expired & ${joined_applications_count} as joined. ${not_yet_accepted_count} have not yet been accepted.`;
}
