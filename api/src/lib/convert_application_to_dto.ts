import { DbApplication, DbApplicationInterests, DbApplicationLanguages } from "data/application";
import { ApplicationDto, ApplicationInterests, ApplicationLanguages, ApplicationLocation, ApplicationQuestionsDto, ApplicationReferrer, ApplicationRegion, ApplicationStatus } from "model/application";
import { UserDto } from "model/user";

export default function convertToApplicationDto(
    application: DbApplication,
    user_dto: UserDto,
    interests: DbApplicationInterests[],
    languages: DbApplicationLanguages[],
    reviewer_user_dto: UserDto | undefined,
): ApplicationDto {
    let locationEnum: ApplicationLocation;
    let statusEnum: ApplicationStatus;
    let referrerEnum: ApplicationReferrer | null;
    let regionEnum: ApplicationRegion | null;

    if (application.reviewer_user_id !== null && reviewer_user_dto === undefined) {
        throw new Error(`Reviewing user DTO not provided for application ID ${application.id} while application's reviewer_user_id is not null`);
    }

    try {
        const result = Object.values(ApplicationLocation).find(value => value === application.location);
        if (result === undefined) {
            throw new Error(`Invalid application location entry "${application.location}" for application ID ${application.id}`);
        }

        locationEnum = result;
    } catch (error) {
        throw new Error(`Invalid application location entry: ${application.location} for application ID ${application.id}`);
    }

    try {
        const result = Object.values(ApplicationStatus).find(value => value === application.status);
        if (result === undefined) {
            throw new Error(`Invalid application status entry: ${application.status} for application ID ${application.id}`);
        }

        statusEnum = result;
    } catch (error) {
        throw new Error(`Invalid application status entry: ${application.status} for application ID ${application.id}`);
    }

    try {
        if (application.referrer === null) {
            referrerEnum = null;
        } else {
            const result = Object.values(ApplicationReferrer).find(value => value === application.referrer);
            if (result === undefined) {
                throw new Error(`Invalid application referrer entry: ${application.referrer} for application ID ${application.id}`);
            }

            referrerEnum = result;
        }
    } catch (error) {
        throw new Error(`Invalid application referrer entry: ${application.referrer} for application ID ${application.id}`);
    }

    try {
        if (application.region === null) {
            regionEnum = null;
        } else {
            const result = Object.values(ApplicationRegion).find(value => value === application.region);
            if (result === undefined) {
                throw new Error(`Invalid application region entry: ${application.region} for application ID ${application.id}`);
            }

            regionEnum = result;
        }
    } catch (error) {
        throw new Error(`Invalid application region entry: ${application.region} for application ID ${application.id}`);
    }

    let languagesEnumArray: ApplicationLanguages[] = [];
    let interestsEnumArray: ApplicationInterests[] = [];

    for (let i = 0; i < languages.length; i++) {
        try {
            const languageEnum = Object.values(ApplicationLanguages).find(value => value === languages[i].language);
            if (languageEnum === undefined) {
                throw new Error(`Invalid language entry: ${languages[i].language} for application ID ${application.id}`);
            }
            languagesEnumArray.push(languageEnum as ApplicationLanguages);
        } catch (error) {
            throw new Error(`Invalid language entry: ${languages[i].language} for application ID ${application.id}`);
        }
    }

    for (let i = 0; i < interests.length; i++) {
        try {
            const interestEnum = Object.values(ApplicationInterests).find(value => value === interests[i].interest);
            if (interestEnum === undefined) {
                throw new Error(`Invalid interest entry: ${interests[i].interest} for application ID ${application.id}`);
            }
            interestsEnumArray.push(interestEnum as ApplicationInterests);
        } catch (error) {
            throw new Error(`Invalid interest entry: ${interests[i].interest} for application ID ${application.id}`);
        }
    }

    const seatCompleted = application.seat_completed === 1;
    const discordCompleted = application.discord_completed === 1;

    const questions_dto: ApplicationQuestionsDto = {
        referrer: referrerEnum,
        region: regionEnum,
        languages: languagesEnumArray,
        interests: interestsEnumArray,
        end_goals: application.end_goals,
        why_autumn: application.why_autumn,
    }

    const application_dto: ApplicationDto = {
        id: application.id,
        user: user_dto,
        reviewer: reviewer_user_dto,
        status: statusEnum,
        rejection_reason: application.rejection_reason,
        location: locationEnum,
        seat_completed: seatCompleted,
        discord_completed: discordCompleted,
        questions: questions_dto,
        last_updated: new Date(application.last_updated)
    };

    return application_dto;
}