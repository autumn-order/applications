<script lang="ts">
	let user = $$props.user;

	let user_name = '';

	if (user) {
		user_name = user.character_name;
	}
</script>

<div class="flex flex-col flex-grow gap-2 justify-center items-center h-full w-full p-2 lg:p-6">
	<div>
		<enhanced:img
			src="/static/logo512black.png?w=256&h=256"
			class="w-64 h-64 block dark:hidden"
			alt="site logo"
		/>
		<enhanced:img
			src="/static/logo512white.png?w=256&h=256"
			class="w-64 h-64 hidden dark:block"
			alt="site logo"
		/>
	</div>
	<h1 class="text-gradient text-xl sm:text-2xl font-bold w-full text-center">
		Welcome to Autumn {user_name}!
	</h1>
	<div class="flex flex-col text-center gap-1">
		<p>
			From here your next step is to follow the <a
				class="link-color"
				href="https://wiki.autumn-order.com/en/getting-started">Getting Started Guide</a
			> which will walk you through getting setup and geting moved over to us.
		</p>
		<p>
			If you have any alts you wish to add to the corporation you can follow this guide: <a
				class="link-color"
				href="https://wiki.autumn-order.com/en/adding-alts">Adding Alts</a
			>
		</p>
	</div>
</div>
