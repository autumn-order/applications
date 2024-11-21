import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

import * as schema from "schema";
import {
  ApplicationInterests,
  ApplicationLanguages,
  ApplicationLocation,
  ApplicationStatus,
} from "model/application";
import { DbUser } from "./user";
import { DbCharacter } from "./character";
import { DbCorporation } from "./corporation";

export type DbApplication = {
  id: number;
  user_id: number;
  status: string;
  location: string;
  rejection_reason: string;
  reviewer_user_id: number | null;
  seat_completed: number; // DB should return a 0 or 1 to represent boolean
  discord_completed: number; // DB should return a 0 or 1 to represent boolean
  questions_completed: number; // DB should return a 0 or 1 to represent boolean
  referrer: string | null;
  region: string | null;
  end_goals: string;
  why_autumn: string;
  created: string;
  last_updated: string;
};

export type UpdateDbApplication = Omit<
  DbApplication,
  "id" | "user_id" | "created" | "last_updated"
>;
export type DbApplicationFilters = Pick<
  DbApplication,
  | "id"
  | "user_id"
  | "status"
  | "location"
  | "seat_completed"
  | "discord_completed"
> & {
  user_ids?: number[];
};

export type DbApplicationInterests = {
  id: number;
  application_id: number;
  interest: string;
};

export type DbApplicationLanguages = {
  id: number;
  application_id: number;
  language: string;
};

export interface GetApplicationResult {
  application: DbApplication;
  interests: DbApplicationInterests[];
  languages: DbApplicationLanguages[];
  user: DbUser;
  character: DbCharacter;
  corporation: DbCorporation;
}

export default class ApplicationRepository {
  private db: BetterSQLite3Database<Record<string, never>>;

  constructor(db: BetterSQLite3Database<Record<string, never>>) {
    this.db = db;
  }

  async createApplication(
    user_id: number,
    location: ApplicationLocation,
  ): Promise<DbApplication | null> {
    const location_string: string = location.toString();
    const status_string: string = ApplicationStatus.Pending.toString();

    const application_values = {
      user_id,
      status: status_string,
      location: location_string,
      seat_completed: 0,
      discord_completed: 0,
      referrer: null,
      region: null,
      end_goals: "",
      why_autumn: "",
      created: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    const result: DbApplication[] = await this.db
      .insert(schema.Application)
      .values(application_values)
      .returning();

    if (result[0]) {
      return result[0];
    } else {
      return null;
    }
  }

  async get(
    filters?: Partial<DbApplicationFilters>,
    limit?: number,
    offset?: number,
  ): Promise<GetApplicationResult[]> {
    let subquery = this.db
      .select({ id: schema.Application.id })
      .from(schema.Application);

    if (filters) {
      const conditions = [];

      if (filters.id) {
        conditions.push(eq(schema.Application.id, filters.id));
      }
      if (filters.status) {
        conditions.push(
          eq(schema.Application.status, filters.status.toString()),
        );
      }
      if (filters.location) {
        conditions.push(
          eq(schema.Application.location, filters.location.toString()),
        );
      }
      if (filters.seat_completed != null) {
        conditions.push(
          eq(schema.Application.seat_completed, filters.seat_completed),
        );
      }
      if (filters.discord_completed != null) {
        conditions.push(
          eq(schema.Application.discord_completed, filters.discord_completed),
        );
      }
      if (filters.user_id) {
        conditions.push(eq(schema.Application.user_id, filters.user_id));
      }
      if (filters.user_ids) {
        conditions.push(inArray(schema.Application.user_id, filters.user_ids));
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        subquery = subquery.where(and(...conditions));
      }
    }

    //@ts-ignore TODO: set type
    subquery = subquery
      .orderBy(desc(schema.Application.last_updated))
      .limit(limit)
      .offset(offset);

    // Main query to fetch the data
    const query = this.db
      .select()
      .from(schema.Application)
      .innerJoin(schema.User, eq(schema.Application.user_id, schema.User.id))
      .innerJoin(
        schema.Character,
        eq(schema.User.main_character_id, schema.Character.character_id),
      )
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      )
      .leftJoin(
        schema.Interests,
        eq(schema.Application.id, schema.Interests.application_id),
      )
      .leftJoin(
        schema.Language,
        eq(schema.Application.id, schema.Language.application_id),
      )
      .where(inArray(schema.Application.id, subquery));

    const result: {
      application: DbApplication;
      language: DbApplicationLanguages | null;
      interests: DbApplicationInterests | null;
      user: DbUser;
      character: DbCharacter;
      corporation: DbCorporation;
    }[] = await query;

    const map = new Map<
      string,
      {
        application: DbApplication;
        languages: DbApplicationLanguages[];
        interests: DbApplicationInterests[];
        user: DbUser;
        character: DbCharacter;
        corporation: DbCorporation;
      }
    >();

    result.forEach((item) => {
      const appId = item.application.id.toString();
      if (map.has(appId)) {
        const existingEntry = map.get(appId)!;
        if (item.language) {
          existingEntry.languages.push(item.language);
        }
        if (item.interests) {
          existingEntry.interests.push(item.interests);
        }
      } else {
        map.set(appId, {
          application: item.application,
          languages: item.language ? [item.language] : [],
          interests: item.interests ? [item.interests] : [],
          user: item.user,
          character: item.character,
          corporation: item.corporation,
        });
      }
    });

    return Array.from(map.values());
  }

  async getApplicationById(
    application_id: number,
  ): Promise<DbApplication | null> {
    const result: DbApplication[] = await this.db
      .select()
      .from(schema.Application)
      .where(eq(schema.Application.id, application_id));

    if (result[0]) {
      return result[0];
    } else {
      return null;
    }
  }

  async getApplicationCount(
    filters: Partial<DbApplicationFilters>,
  ): Promise<number> {
    let query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.Application);

    if (filters) {
      const conditions = [];

      if (filters.id) {
        conditions.push(eq(schema.Application.id, filters.id));
      }
      if (filters.status) {
        conditions.push(
          eq(schema.Application.status, filters.status.toString()),
        );
      }
      if (filters.location) {
        conditions.push(
          eq(schema.Application.location, filters.location.toString()),
        );
      }
      if (filters.seat_completed != null) {
        conditions.push(
          eq(schema.Application.seat_completed, filters.seat_completed),
        );
      }
      if (filters.discord_completed != null) {
        conditions.push(
          eq(schema.Application.discord_completed, filters.discord_completed),
        );
      }
      if (filters.user_id) {
        conditions.push(eq(schema.Application.user_id, filters.user_id));
      }
      if (filters.user_ids) {
        conditions.push(inArray(schema.Application.user_id, filters.user_ids));
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        query = query.where(and(...conditions));
      }
    }

    const result: { count: number }[] = await query;

    return result[0].count;
  }

  async update(application: DbApplication): Promise<DbApplication | null> {
    application.last_updated = new Date().toISOString();

    const result: DbApplication[] = await this.db
      .update(schema.Application)
      .set(application)
      .where(eq(schema.Application.id, application.id))
      .returning();

    if (result[0]) {
      return result[0];
    } else {
      return null;
    }
  }

  async updateApplicationInterests(
    application_id: number,
    interests: ApplicationInterests[],
  ): Promise<DbApplicationInterests[]> {
    const interest_strings: string[] = Array.from(new Set(interests)).map(
      (interest) => interest.toString(),
    );

    let db_interests: DbApplicationInterests[] = await this.db
      .select()
      .from(schema.Interests)
      .where(eq(schema.Interests.application_id, application_id));

    const new_interests = interests.filter(
      (interest) => !db_interests.some((i) => i.interest === interest),
    );
    const missing_interest_ids = db_interests
      .filter((i) => !interest_strings.includes(i.interest))
      .map((i) => i.id);

    let db_interests_result: DbApplicationInterests[] = db_interests.filter(
      (i) => !missing_interest_ids.includes(i.id),
    );

    if (missing_interest_ids.length > 0) {
      await this.db
        .delete(schema.Interests)
        .where(inArray(schema.Interests.id, missing_interest_ids));
    }
    if (new_interests.length > 0) {
      const result: DbApplicationInterests[] = await this.db
        .insert(schema.Interests)
        .values(
          new_interests.map((interest) => ({
            application_id: application_id,
            interest: interest.toString(),
          })),
        )
        .returning();
      db_interests_result = db_interests_result.concat(result);
    }

    return db_interests_result;
  }

  async updateApplicationLanguages(
    application_id: number,
    languages: ApplicationLanguages[],
  ): Promise<DbApplicationLanguages[]> {
    const language_strings: string[] = Array.from(new Set(languages)).map(
      (language) => language.toString(),
    );

    let db_languages: DbApplicationLanguages[] = await this.db
      .select()
      .from(schema.Language)
      .where(eq(schema.Language.application_id, application_id));

    const new_languages = languages.filter(
      (language) => !db_languages.some((i) => i.language === language),
    );
    const missing_language_ids = db_languages
      .filter((i) => !language_strings.includes(i.language))
      .map((i) => i.id);

    let db_languages_result: DbApplicationLanguages[] = db_languages.filter(
      (i) => !missing_language_ids.includes(i.id),
    );

    if (missing_language_ids.length > 0) {
      await this.db
        .delete(schema.Language)
        .where(inArray(schema.Language.id, missing_language_ids));
    }
    if (new_languages.length > 0) {
      const result: DbApplicationLanguages[] = await this.db
        .insert(schema.Language)
        .values(
          new_languages.map((language) => ({
            application_id: application_id,
            language: language.toString(),
          })),
        )
        .returning();
      db_languages_result = db_languages_result.concat(result);
    }

    return db_languages_result;
  }
}
