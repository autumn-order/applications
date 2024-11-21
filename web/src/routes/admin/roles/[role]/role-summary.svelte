<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { SeatRoleDto } from '$lib/model/seat_role';

	export let role: SeatRoleDto;
</script>

<Card.Root class="h-full">
	<Card.Header class="pb-4 border-b border-color">
		<Card.Title class="text-xl">Role Summary</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<h2 class="text-lg">{role.name}</h2>
	</Card.Content>
	<Card.Header class="pb-4 border-b border-color">
		<Card.Title class="text-xl">Role Stats</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<ul class="flex justify-evenly">
			<li>
				Members: <span class="bg-neutral-800 rounded-lg px-1.5 dark:text-white"
					>{role.member_count}</span
				>
			</li>
		</ul>
	</Card.Content>
</Card.Root>
