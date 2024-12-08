import { writable } from 'svelte/store';
import { type ApplicationFilters } from '$lib/model/application';

export const APPLICATION_FILTERS = writable<ApplicationFilters | undefined>(undefined);
