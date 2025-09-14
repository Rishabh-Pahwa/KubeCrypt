<script lang="ts">
	import { Toast } from 'flowbite-svelte';
	import { slide } from 'svelte/transition';
	import { CheckCircleSolid } from 'flowbite-svelte-icons';
	import { toastMessage, toastVisible } from '$lib/stores/toastStore';
	import { tick } from 'svelte';
	import { onDestroy } from 'svelte';

	let counter = 6;
	let hideTimeout: ReturnType<typeof setTimeout>;
	let countdownInterval: ReturnType<typeof setInterval>;

	// Reactive to toastVisible
	$: if ($toastVisible) {
		startCountdown();
	} else {
		clearTimeout(hideTimeout);
		clearInterval(countdownInterval);
	}

	function startCountdown() {
		counter = 7;

		// Clear any old timers
		clearTimeout(hideTimeout);
		clearInterval(countdownInterval);

		// Start countdown display
		countdownInterval = setInterval(() => {
			counter--;
		}, 1000);

		// Auto-hide toast
		hideTimeout = setTimeout(() => {
			toastVisible.set(false);
			clearInterval(countdownInterval);
		}, 6000); // 6s
	}

	onDestroy(() => {
		clearTimeout(hideTimeout);
		clearInterval(countdownInterval);
	});
</script>

{#if $toastVisible}
	<Toast
		dismissable={false}
		transition={slide}
		color={undefined}
		class="bg-green-100 text-white-500 dark:bg-green-800 dark:text-white-200 fixed bottom-5 right-5 z-50"
	>
		{#snippet icon()}
			<CheckCircleSolid class="h-5 w-5" />
		{/snippet}
		{$toastMessage}
	</Toast>
{/if}
