import { UserDto } from "./user";

export enum ApplicationLocation {
    Highsec = "Highsec",
    Nullsec = "Nullsec"
}

export enum ApplicationStatus {
    Pending = "Pending",
    Rejected = "Rejected",
    Cancelled = "Cancelled",
    Accepted = "Accepted",
    Joined = "Joined",
    Expired = "Expired"
}

export enum ApplicationReferrer {
    LocalChat = "Local Chat",
    CorpFinder = "Corp Finder",
    EnglishRecruitment = "English Recruitment",
    EveForums = "EVE Forums",
    RedditEveJobs = "r/evejobs",
    RedditEve = "r/eve",
    Friend = "Friend",
    Other = "Other"
}

export enum ApplicationRegion {
    Africa = "Africa",
    Asia = "Asia",
    Australia = "Australia",
    Europe = "Europe",
    NorthAmerica = "North America",
    SouthAmerica = "South America"
}

export enum ApplicationLanguages {
    English = "English",
    French = "French",
    German = "German",
    Spanish = "Spanish",
    Russian = "Russian",
    Chinese = "Chinese",
    Japanese = "Japanese",
    Korean = "Korean"
}

export enum ApplicationInterests {
    PvP = "PvP",
    PvE = "PvE",
    Mining = "Mining",
    Industry = "Industry",
    Exploration = "Exploration",
    CorporationLeadership = "Corporation Leadership",
    FleetCommand = "Fleet Command"
}

export interface ApplicationQuestionsDto {
    referrer: ApplicationReferrer | null;
    region: ApplicationRegion | null;
    languages: ApplicationLanguages[];
    interests: ApplicationInterests[];
    end_goals: string;
    why_autumn: string;
};

export interface ApplicationDto {
    id: number;
    user: UserDto;
    reviewer: UserDto | undefined;
    status: ApplicationStatus;
    rejection_reason: string;
    location: ApplicationLocation;
    seat_completed: boolean;
    discord_completed: boolean;
    questions: ApplicationQuestionsDto;
    last_updated: Date;
}

export interface GetApplicationsDto {
    applications: ApplicationDto[];
    total: number;
}