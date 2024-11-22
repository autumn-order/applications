<script lang="ts">
	import {
		ApplicationInterests,
		ApplicationLanguages,
		ApplicationRegion,
		ApplicationReferrer,
		type ApplicationQuestionsDto,
		type ApplicationDto
	} from '$lib/model/application';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { DISCORD_LINK } from '../../../../constants';
	import { Button } from '$lib/components/ui/button';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import Fa from 'svelte-fa';
	import {
		faArrowLeft,
		faArrowRight,
		faFloppyDisk,
		faCheck
	} from '@fortawesome/free-solid-svg-icons';
	import type { Selected } from 'bits-ui';
	import { onDestroy } from 'svelte';
	import { submitApplicationQuestions } from '$lib/stores/application';
	import { ApplicationSteps } from '../ApplicationSection.svelte';
	import { mapEnumArrayToPairs } from '$lib/utils';

	interface Region {
		key: string;
		value: ApplicationRegion;
	}

	interface Referrer {
		key: string;
		value: ApplicationReferrer;
	}

	interface Language {
		key: string;
		value: ApplicationLanguages;
	}

	interface Interest {
		key: string;
		value: ApplicationInterests;
	}

	function handleLanguageSelect(object: Selected<Language> | undefined) {
		const language = object?.value;

		if (language) {
			if (!applicationQuestions.languages.includes(language.value)) {
				applicationQuestions.languages = [...applicationQuestions.languages, language.value];
			}

			if (!selectedLanguages.some((item) => item.key === language.key)) {
				selectedLanguages = [...selectedLanguages, language];
			}
		}
	}

	function handleInterestSelect(object: Selected<Interest> | undefined) {
		const interest = object?.value;

		if (interest) {
			if (!applicationQuestions.interests.includes(interest.value)) {
				applicationQuestions.interests = [...applicationQuestions.interests, interest.value];
			}

			if (!selectedInterests.some((item) => item.key === interest.key)) {
				selectedInterests = [...selectedInterests, interest];
			}
		}
	}

	function removeLanguage(language: Language) {
		if (applicationQuestions.languages.includes(language.value)) {
			applicationQuestions.languages = applicationQuestions.languages.filter(
				(lang) => lang !== language.value
			);
		}

		if (selectedLanguages.includes(language)) {
			selectedLanguages = selectedLanguages.filter((selected) => selected !== language);
		}
	}

	function removeInterest(interest: Interest) {
		if (applicationQuestions.interests.includes(interest.value)) {
			applicationQuestions.interests = applicationQuestions.interests.filter(
				(lang) => lang !== interest.value
			);
		}
		if (selectedInterests.includes(interest)) {
			selectedInterests = selectedInterests.filter((selected) => selected !== interest);
		}
	}

	function handleSelectReferrer(object: Selected<Referrer> | undefined) {
		const referrer = object?.value;

		if (referrer) {
			applicationQuestions.referrer = referrer.value;
		}
	}

	function handleSelectRegion(object: Selected<Region> | undefined) {
		const region = object?.value;

		if (region) {
			applicationQuestions.region = region.value;
		}
	}

	function handleEndGoalInput(event: InputEvent) {
		const target = event.target as HTMLInputElement | null;
		if (target) {
			if (target.value.length > 250) {
				applicationQuestions.end_goals = target.value.slice(0, 250);
			} else {
				applicationQuestions.end_goals = target.value;
			}
		}
	}

	function handleWhyAutumnInput(event: InputEvent) {
		const target = event.target as HTMLInputElement | null;
		if (target) {
			if (target.value.length > 250) {
				applicationQuestions.why_autumn = target.value.slice(0, 250);
			} else {
				applicationQuestions.why_autumn = target.value;
			}
		}
	}

	async function saveQuestions() {
		if (!application) {
			return;
		}

		await submitApplicationQuestions(applicationQuestions);

		progress_saved = true;
	}

	async function handleNextStep() {
		if (!application) {
			setViewedStep(3);
			return;
		}

		await submitApplicationQuestions(applicationQuestions);

		setViewedStep(3);
	}

	onDestroy(() => {
		if (application) {
			submitApplicationQuestions(applicationQuestions);
		}
	});

	export let setViewedStep: Function;
	export let setCurrentStep: Function;

	let application: ApplicationDto | null | undefined = $$props.application;
	let progress_saved: undefined | boolean = undefined;

	let applicationQuestions: ApplicationQuestionsDto = {
		referrer: null,
		region: null,
		languages: [] as ApplicationLanguages[],
		interests: [] as ApplicationInterests[],
		end_goals: '',
		why_autumn: ''
	};

	if (application && application.questions) {
		applicationQuestions = {
			...application.questions
		};
	}

	const regions: Region[] = Object.entries(ApplicationRegion).map(([key, value]) => ({
		key,
		value
	}));
	const referralSources: Referrer[] = Object.entries(ApplicationReferrer).map(([key, value]) => ({
		key,
		value
	}));

	let languages: Language[] = Object.entries(ApplicationLanguages).map(([key, value]) => ({
		key,
		value
	}));
	let interests: Interest[] = Object.entries(ApplicationInterests).map(([key, value]) => ({
		key,
		value
	}));

	let selectedLanguages: Language[] = mapEnumArrayToPairs(
		ApplicationLanguages,
		applicationQuestions.languages
	);
	let selectedInterests: Interest[] = mapEnumArrayToPairs(
		ApplicationInterests,
		applicationQuestions.interests
	);

	$: languages = Object.entries(ApplicationLanguages)
		.map(([key, value]) => ({ key, value }))
		.filter((language) => !selectedLanguages.some((selected) => selected.value === language.value));

	$: interests = Object.entries(ApplicationInterests)
		.map(([key, value]) => ({ key, value }))
		.filter((interest) => !selectedInterests.some((selected) => selected.value === interest.value));

	$: questions_complete = false;
	$: goals_length = applicationQuestions.end_goals.length;
	$: why_length = applicationQuestions.why_autumn.length;

	$: {
		if (
			applicationQuestions.referrer !== null &&
			applicationQuestions.region !== null &&
			applicationQuestions.languages.length > 0 &&
			applicationQuestions.interests.length > 0 &&
			applicationQuestions.end_goals !== '' &&
			applicationQuestions.why_autumn !== ''
		) {
			if (questions_complete !== true) {
				questions_complete = true;
				setCurrentStep(ApplicationSteps.Review);
			}

			progress_saved = false;
		} else {
			if (questions_complete === true) {
				setCurrentStep(ApplicationSteps.Questions);
			}

			progress_saved = false;
			questions_complete = false;
		}
	}
</script>

<div class="flex flex-col justify-between flex-grow gap-2 h-full w-full p-2 lg:p-6">
	<form>
		<h1 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">
			Step 3. Application Questions
		</h1>
		<div class="w-full flex flex-wrap">
			<ul class="w-full lg:w-1/2 flex flex-col gap-4 px-6 py-4">
				<li class="flex flex-col gap-2">
					<label for="hear_about_us">How did you hear about us?</label>
					<Select.Root portal={null} onSelectedChange={handleSelectReferrer}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder={applicationQuestions.referrer ?? 'Choose Source'} />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Select Source</Select.Label>
								{#each referralSources as source}
									<Select.Item value={source} label={source.value}>{source.value}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="referrer" />
					</Select.Root>
				</li>
				<li class="flex flex-col gap-2">
					<label for="region">Region</label>
					<Select.Root portal={null} onSelectedChange={handleSelectRegion}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder={applicationQuestions.region ?? 'Choose Region'} />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Select Region</Select.Label>
								{#each regions as region}
									<Select.Item value={region} label={region.value}>{region.value}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="region" />
					</Select.Root>
				</li>
				<li class="flex flex-col gap-2">
					<label for="languages">Languages</label>
					<ul class="flex flex-wrap gap-2 {selectedLanguages.length === 0 ? 'hidden' : ''}">
						{#each selectedLanguages as language}
							<li>
								<button
									type="button"
									on:click={() => removeLanguage(language)}
									class="border border-color rounded px-2 hover:invert-[0.25]"
									>{language.value}</button
								>
							</li>
						{/each}
					</ul>
					<Select.Root portal={null} onSelectedChange={handleLanguageSelect}>
						<Select.Trigger class="w-full">
							<p class="text-neutral-500 dark:text-neutral-400">Select Language</p>
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Select Language</Select.Label>
								{#each languages as language}
									<Select.Item value={language} label={language.value}>{language.value}</Select.Item
									>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</li>
				<li class="flex flex-col gap-2">
					<label for="interests">Interests</label>
					<ul class="flex flex-wrap gap-2 {selectedInterests.length === 0 ? 'hidden' : ''}">
						{#each selectedInterests as interest}
							<li>
								<button
									type="button"
									on:click={() => removeInterest(interest)}
									class="border border-color rounded px-2 hover:invert-[0.25]"
									>{interest.value}</button
								>
							</li>
						{/each}
					</ul>
					<Select.Root portal={null} onSelectedChange={handleInterestSelect}>
						<Select.Trigger class="w-full">
							<p class="text-neutral-500 dark:text-neutral-400">Select Interest</p>
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Select Interest</Select.Label>
								{#each interests as interest}
									<Select.Item value={interest} label={interest.value}>{interest.value}</Select.Item
									>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</li>
			</ul>
			<ul class="w-full lg:w-1/2 flex flex-col gap-8 px-6 py-4">
				<li class="flex flex-col gap-2">
					<label for="end_goals">What are your end goals in EVE Online?</label>
					<Textarea
						id="end_goals"
						name="end_goals"
						class="w-full p-2 h-28 border rounded"
						on:input={handleEndGoalInput}
						bind:value={applicationQuestions.end_goals}
					/>
					<p>
						<span>{goals_length}</span> / 250 characters
					</p>
				</li>
				<li class="flex flex-col gap-2">
					<label for="choose_autumn">What made you choose Autumn?</label>
					<Textarea
						id="choose_autumn"
						name="choose_autumn"
						class="w-full p-2 h-28 border rounded"
						on:input={handleWhyAutumnInput}
						bind:value={applicationQuestions.why_autumn}
					/>
					<p>
						<span>{why_length}</span> / 250 characters
					</p>
				</li>
			</ul>
		</div>
	</form>
	<div class="justify-self-end">
		<ul class="flex flex-wrap justify-center py-4 w-full gap-2">
			<li>
				<a href={DISCORD_LINK} target="_blank">
					<Button class="flex gap-2" variant="outline">
						<Fa icon={faDiscord} size="lg" />
						<p>Questions? Ask us in Discord!</p>
					</Button>
				</a>
			</li>
			<li>
				<Button class="flex gap-2" disabled={!application} on:click={() => saveQuestions()}>
					<Fa icon={faFloppyDisk} size="lg" />
					<p>Save Progress</p>
				</Button>
			</li>
		</ul>
		<ul>
			{#if questions_complete}
				<li>
					<p class="text-center">
						Application questions complete! You can now move on to the next step.
					</p>
				</li>
			{/if}
			{#if progress_saved === true}
				<li class="gap-2 mt-2 flex items-center justify-center">
					<Fa icon={faCheck} class="text-green-700" />
					<p class="text-center text-green-700">Progress saved!</p>
				</li>
			{/if}
		</ul>
		<ul class="flex w-full justify-between gap-2 mt-6">
			<li>
				<Button class="flex gap-2 items-center" variant="outline" on:click={() => setViewedStep(1)}>
					<Fa icon={faArrowLeft} />
					<p>Previous Step</p>
				</Button>
			</li>
			<li>
				<Button
					class="flex gap-2 items-center"
					variant="outline"
					disabled={!questions_complete && application !== null}
					on:click={() => handleNextStep()}
				>
					<p>Next Step</p>
					<Fa icon={faArrowRight} />
				</Button>
			</li>
		</ul>
	</div>
</div>
