<script lang="ts">
	import { AccordionItem, Accordion, Textarea, Button } from 'flowbite-svelte';
	import Icon from '@iconify/svelte';

	let encoded = $state('');
	let decoded = $state('');

	$effect(() => {
		try {
			decoded = encoded ? atob(encoded) : '';
		} catch (err) {
			decoded = '⚠️ Invalid Base64 string';
		}
	});

	async function copyToClipboard(content) {
		try {
			await navigator.clipboard.writeText(content);
		} catch (err) {
			console.error(err);
		}
	}
</script>

<Accordion class="max-w-4xl mx-auto">
	<AccordionItem>
		{#snippet header()}
			<div>
				<div class="flex items-center space-x-2">
					<Icon icon="tabler:number-64-small" class="border border-gray-500 rounded h-9 w-9" />
					<span class="font-bold text-xl"> Base64 Decoder</span>
				</div>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					An optional utility to decode Base64 strings.
				</p>
			</div>
		{/snippet}
		<div class="flex justify-center space-x-4 w-full">
			<div class="flex flex-col w-1/2 mt-2">
				<p class="text-gray-300">Encoded String</p>
				<Textarea
					placeholder="Paste base64 string here"
					bind:value={encoded}
					rows={2}
					class="mt-2 w-full"
				/>
			</div>
			<div class="flex flex-col w-1/2">
				<div class="flex items-center justify-between">
					<p class="text-gray-300">Decoded Output</p>
					<Button onclick={() => copyToClipboard(decoded)} name="Copy">
						<Icon icon="flowbite:file-copy-solid" class="h-5 w-5" />
					</Button>
				</div>
				<Textarea
					placeholder="Decoded string will appear here"
					bind:value={decoded}
					readonly
					rows={2}
					class="w-full"
				/>
			</div>
		</div>
	</AccordionItem>
</Accordion>
