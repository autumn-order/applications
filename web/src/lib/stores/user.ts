import type { UserDto } from "$lib/model/user";
import { writable, type Writable } from "svelte/store";
import { updateApplication } from "./application";

import { PUBLIC_VITE_BACKEND_URL } from '$env/static/public'

// undefined = user not fetched yet
// null = user fetched, no user found
// UserDto = user fetched successfully
const USER_STORE = writable<UserDto | undefined | null>(undefined);
let fetchPromise: Promise<UserDto | null> | null = null;

export const fetchUser = async (): Promise<UserDto | null> => {
    const response = await fetch(`${PUBLIC_VITE_BACKEND_URL}/auth/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        return null;
    }

    const result: UserDto = await response.json();
    return result;
}

export const getUser = (): Writable<UserDto | undefined | null> => {
    let user: UserDto | undefined | null = undefined;
    const unsubscribe = USER_STORE.subscribe(value => {
        user = value;
    });
    unsubscribe();

    if (user === undefined) {
        (async () => {
            if (!fetchPromise) {
                fetchPromise = fetchUser();
            }
            user = await fetchPromise;
            USER_STORE.set(user);
        })();
    }

    return USER_STORE;
}

export const logout = async () => {
    updateApplication(undefined);
    USER_STORE.set(null);

    await fetch(`${PUBLIC_VITE_BACKEND_URL}/auth/logout`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });
}
