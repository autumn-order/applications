import { type ApplicationLocation, type ApplicationQuestionsDto, type ApplicationDto, ApplicationStatus } from '$lib/model/application'
import { get, writable, type Writable } from 'svelte/store'

import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public'
import { CORPORATIONS } from '../../constants';

// undefined = application not fetched yet
// null = application fetched, no application found
// ApplicationDto = application fetched successfully
const APPLICATION_STORE = writable<ApplicationDto | null | undefined>(undefined)
let fetchPromise: Promise<ApplicationDto | null> | null = null;

export const updateApplication = async (application: ApplicationDto | null | undefined) => {
    APPLICATION_STORE.set(application);
}

export const fetchApplication = async (): Promise<ApplicationDto | null> => {
    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/application`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        return null;
    }

    const result: ApplicationDto = await response.json();

    if (!CORPORATIONS.some(corp => corp.corporation_id === result.user?.corporation_id)) {
        switch (result.status) {
            case ApplicationStatus.Pending:
                break;
            case ApplicationStatus.Rejected:
                break;
            case ApplicationStatus.Accepted:
                break;
            default:
                return null;
        }
    }

    return result;
}

export const getApplication = (): Writable<ApplicationDto | null | undefined> => {
    let application: ApplicationDto | null | undefined = undefined;
    const unsubscribe = APPLICATION_STORE.subscribe(value => {
        application = value;
    });
    unsubscribe();

    if (application === undefined) {
        (async () => {
            if (!fetchPromise) {
                fetchPromise = fetchApplication();
            }
            application = await fetchPromise;
            APPLICATION_STORE.set(application);
        })();
    }

    return APPLICATION_STORE;
}

// Application Steps
// Step 1.
export async function setApplicationLocation(application_location: ApplicationLocation) {
    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/application/location`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            location: application_location
        })
    });

    if (!response.ok) {
        return false;
    }

    const updated_application: ApplicationDto = await response.json();

    APPLICATION_STORE.set(updated_application);
}

// Step 2.
export async function checkSeAT(): Promise<boolean> {
    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/application/seat-status`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        return false;
    }

    const updated_application: ApplicationDto = await response.json();

    APPLICATION_STORE.set(updated_application);

    return true;
}

// Step 3.
export async function setDiscordComplete(): Promise<boolean> {
    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/application/discord-complete`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        return false;
    }

    const updated_application: ApplicationDto = await response.json();

    APPLICATION_STORE.set(updated_application);

    if (updated_application.discord_completed) {
        return true
    } else {
        return false
    }
}

// Step 4.
export async function submitApplicationQuestions(questions: ApplicationQuestionsDto): Promise<void> {
    function areApplicationQuestionsEqual(a: ApplicationQuestionsDto, b: ApplicationQuestionsDto): boolean {
        return a.referrer === b.referrer &&
            a.region === b.region &&
            JSON.stringify(a.languages) === JSON.stringify(b.languages) &&
            JSON.stringify(a.interests) === JSON.stringify(b.interests) &&
            a.end_goals === b.end_goals &&
            a.why_autumn === b.why_autumn;
    }

    const current_application = get(APPLICATION_STORE);

    if (current_application) {
        if (areApplicationQuestionsEqual(current_application.questions, questions)) {
            return;
        }
    }

    if (questions.why_autumn.length > 250) {
        questions.why_autumn = questions.why_autumn.slice(0, 250);
    }

    if (questions.end_goals.length > 250) {
        questions.end_goals = questions.end_goals.slice(0, 250);
    }

    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/application/questions`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(questions)
    });

    if (!response.ok) {
        return;
    }

    const updated_application: ApplicationDto = await response.json();

    APPLICATION_STORE.set(updated_application);
}