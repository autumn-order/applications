import ApplicationRepository, {
  GetApplicationResult,
} from "../data/application";
import UserRepository from "../data/user";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Context } from "hono";
import convertToApplicationDto from "../lib/convert_application_to_dto";
import convertUserToDto from "../lib/convert_user_to_dto";
import {
  ApplicationDto,
  ApplicationLocation,
  ApplicationReferrer,
  ApplicationRegion,
  ApplicationStatus,
} from "../model/application";
import { UserDto } from "../model/user";
import {
  sendNewApplicationNotification,
  sendReviewReadyApplicationNotification,
} from "./webhook";
import fetchSeatCharacterUserId from "../utils/seat/character";
import { PutApplicationQuestionsBody } from "../routes/application/application";

async function getApplicationReviewer(
  reviewer_user_id: number | null,
  userRepository: UserRepository,
): Promise<UserDto | undefined> {
  let reviewer_user_dto: UserDto | undefined = undefined;

  if (reviewer_user_id) {
    const reviewer =
      await userRepository.getUserMainCharacter(reviewer_user_id);

    if (!reviewer) {
      throw new Error(
        `Failed to retrieve main character for ${reviewer_user_id}`,
      );
    }

    reviewer_user_dto = convertUserToDto(
      reviewer.user.id,
      reviewer.character,
      reviewer.corporation,
    );
  }

  return reviewer_user_dto;
}

export async function getApplication(
  ctx: Context,
  user_id: number,
): Promise<ApplicationDto | Response> {
  const userRepository = new UserRepository(ctx.var.db);
  const applicationRepository = new ApplicationRepository(ctx.var.db);

  const user_applications = await applicationRepository.get({
    user_id: user_id,
  });

  const most_recent_application = user_applications.sort(
    (a: GetApplicationResult, b: GetApplicationResult) =>
      new Date(b.application.last_updated).getTime() -
      new Date(a.application.last_updated).getTime(),
  )[0];

  if (
    !most_recent_application ||
    most_recent_application.application.status === ApplicationStatus.Expired
  ) {
    ctx.status(404);
    return ctx.text("No valid application found.");
  }

  const application = most_recent_application;

  const user_dto = convertUserToDto(
    application.user.id,
    application.character,
    application.corporation,
  );
  const reviewer_user_dto = await getApplicationReviewer(
    application.application.reviewer_user_id,
    userRepository,
  );

  return convertToApplicationDto(
    application.application,
    user_dto,
    application.interests,
    application.languages,
    reviewer_user_dto,
  );
}

export async function setApplicationLocation(
  ctx: Context,
  user_id: number,
  location: ApplicationLocation,
): Promise<ApplicationDto | Response> {
  const userRepository = new UserRepository(ctx.var.db);
  const applicationRepository = new ApplicationRepository(ctx.var.db);

  const user_applications = await applicationRepository.get({
    user_id: user_id,
  });
  const rejected_application = user_applications.find(
    (entry) =>
      entry.application.status === ApplicationStatus.Rejected &&
      new Date(entry.application.last_updated) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );

  if (rejected_application) {
    ctx.status(400);
    return ctx.text(
      "You have been rejected within the last 30 days, you are welcome to apply again after the 30 day cooldown.",
    );
  }

  const pending_application = user_applications.find(
    (entry) => entry.application.status === ApplicationStatus.Pending,
  );

  let application: GetApplicationResult;

  if (pending_application) {
    application = pending_application;

    application.application.location = location;

    const updated_application = await applicationRepository.update(
      application.application,
    );

    if (!updated_application) {
      ctx.status(500);
      return ctx.text("Failed to update application");
    }

    application.application = updated_application;
  } else {
    const new_application = await applicationRepository.createApplication(
      user_id,
      location,
    );

    if (!new_application) {
      ctx.status(500);
      return ctx.text(`Failed to create application for ${user_id}`);
    }

    const result = await applicationRepository.get({ id: new_application.id });

    if (!result[0]) {
      ctx.status(500);
      return ctx.text(
        `Failed to retrieve application for ${new_application.id}`,
      );
    }

    application = result[0];

    await sendNewApplicationNotification(ctx.var.db, application);
  }

  const user_dto = convertUserToDto(
    application.user.id,
    application.character,
    application.corporation,
  );
  const reviewer_user_dto = await getApplicationReviewer(
    application.application.reviewer_user_id,
    userRepository,
  );

  return convertToApplicationDto(
    application.application,
    user_dto,
    application.interests,
    application.languages,
    reviewer_user_dto,
  );
}

export async function getApplicationSeatStatus(
  ctx: Context,
  user_id: number,
): Promise<ApplicationDto | Response> {
  const userRepository = new UserRepository(ctx.var.db);
  const applicationRepository = new ApplicationRepository(ctx.var.db);

  const user_applications = await applicationRepository.get({
    user_id: user_id,
  });
  const pending_application = user_applications.find(
    (entry) => entry.application.status === ApplicationStatus.Pending,
  );

  if (!pending_application) {
    ctx.status(404);
    return ctx.text("No pending application found");
  }

  if (!pending_application.application.seat_completed) {
    const seat_user_id = await fetchSeatCharacterUserId(
      pending_application.character.character_id,
    );

    if (seat_user_id) {
      pending_application.application.seat_completed = 1;

      const updated_application = await applicationRepository.update(
        pending_application.application,
      );

      if (!updated_application) {
        throw new Error(
          `Failed to update application with id ${pending_application.application.id} to SeAT completed`,
        );
      }
    }
  }

  const user_dto = convertUserToDto(
    pending_application.user.id,
    pending_application.character,
    pending_application.corporation,
  );
  const reviewer_user_dto = await getApplicationReviewer(
    pending_application.application.reviewer_user_id,
    userRepository,
  );

  return convertToApplicationDto(
    pending_application.application,
    user_dto,
    pending_application.interests,
    pending_application.languages,
    reviewer_user_dto,
  );
}

export async function setApplicationDiscordComplete(
  ctx: Context,
  user_id: number,
): Promise<ApplicationDto | Response> {
  const userRepository = new UserRepository(ctx.var.db);
  const applicationRepository = new ApplicationRepository(ctx.var.db);

  const user_applications = await applicationRepository.get({
    user_id: user_id,
  });
  const pending_application = user_applications.find(
    (entry) => entry.application.status === ApplicationStatus.Pending,
  );

  if (!pending_application) {
    ctx.status(404);
    return ctx.text("No pending application found");
  }

  if (!pending_application.application.discord_completed) {
    pending_application.application.discord_completed = 1;

    const updated_application = await applicationRepository.update(
      pending_application.application,
    );

    if (!updated_application) {
      throw new Error(
        `Failed to update application with id ${pending_application.application.id} to Discord completed`,
      );
    }

    pending_application.application = updated_application;
  }

  const user_dto = convertUserToDto(
    pending_application.user.id,
    pending_application.character,
    pending_application.corporation,
  );
  const reviewer_user_dto = await getApplicationReviewer(
    pending_application.application.reviewer_user_id,
    userRepository,
  );

  return convertToApplicationDto(
    pending_application.application,
    user_dto,
    pending_application.interests,
    pending_application.languages,
    reviewer_user_dto,
  );
}

export async function setApplicationQuestions(
  ctx: Context,
  user_id: number,
  body: PutApplicationQuestionsBody,
): Promise<ApplicationDto | Response> {
  const userRepository = new UserRepository(ctx.var.db);
  const applicationRepository = new ApplicationRepository(ctx.var.db);

  const user_applications = await applicationRepository.get({
    user_id: user_id,
  });
  const pending_application = user_applications.find(
    (entry) => entry.application.status === ApplicationStatus.Pending,
  );

  if (!pending_application) {
    ctx.status(404);
    return ctx.text("No pending application found");
  }

  if (body.why_autumn.length > 250) {
    ctx.status(400);
    return ctx.text(
      '"What made you choose Autumn?" answer must be less than 250 characters',
    );
  }

  if (body.end_goals.length > 250) {
    ctx.status(400);
    return ctx.text(
      '"What are your end goals in EVE Online?" answer must be less than 250 characters',
    );
  }

  const uniqueLanguages = new Set(body.languages);
  const uniqueInterests = new Set(body.interests);

  (pending_application.application.referrer = body.referrer
    ? body.referrer.toString()
    : null),
    (pending_application.application.region = body.region
      ? body.region.toString()
      : null),
    (pending_application.application.end_goals = body.end_goals);
  pending_application.application.why_autumn = body.why_autumn;

  pending_application.interests =
    await applicationRepository.updateApplicationInterests(
      pending_application.application.id,
      Array.from(uniqueInterests),
    );
  pending_application.languages =
    await applicationRepository.updateApplicationLanguages(
      pending_application.application.id,
      Array.from(uniqueLanguages),
    );

  const updated_application = await applicationRepository.update(
    pending_application.application,
  );

  if (!updated_application) {
    throw new Error(
      `Failed to update application with id ${pending_application.application.id}`,
    );
  }

  pending_application.application = updated_application;

  const user_dto = convertUserToDto(
    pending_application.user.id,
    pending_application.character,
    pending_application.corporation,
  );
  const reviewer_user_dto = await getApplicationReviewer(
    pending_application.application.reviewer_user_id,
    userRepository,
  );

  if (
    pending_application.interests.length > 0 &&
    pending_application.languages.length > 0 &&
    pending_application.application.referrer &&
    pending_application.application.region &&
    pending_application.application.end_goals &&
    pending_application.application.why_autumn &&
    !pending_application.application.questions_completed
  ) {
    await sendReviewReadyApplicationNotification(
      ctx.var.db,
      pending_application,
    );

    pending_application.application.questions_completed = 1;

    const updated_application = await applicationRepository.update(
      pending_application.application,
    );

    if (!updated_application) {
      throw new Error(
        `Failed to update application with id ${pending_application.application.id} with questions marked as completed.`,
      );
    }

    pending_application.application = updated_application;
  }

  return convertToApplicationDto(
    pending_application.application,
    user_dto,
    pending_application.interests,
    pending_application.languages,
    reviewer_user_dto,
  );
}
