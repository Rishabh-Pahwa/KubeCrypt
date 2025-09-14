<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let file: File | null = null;
	let status: string | null = null;

	function readFileAsText(f: File): Promise<string> {
		return new Promise((res, rej) => {
			const reader = new FileReader();
			reader.onload = () => res(String(reader.result));
			reader.onerror = () => rej(reader.error);
			reader.readAsText(f);
		});
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files?.length) {
			file = target.files[0];
			status = `✅ Loaded file: ${file.name}`;
			const content = await readFileAsText(file);
			// dispatch a custom event with name and content
			dispatch('load', { name: file.name, content });
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.files.length) {
			file = e.dataTransfer.files[0];
			status = `✅ Loaded file: ${file.name}`;
			const content = await readFileAsText(file);
			dispatch('load', { name: file.name, content });
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}
</script>

<div>
	<div class="max-w-4xl mx-auto">
		<!-- Card -->
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
		>
			<!-- Header -->
			<div class="p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-800 dark:text-white">1. Load Encryption Key</h2>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Upload or drag and drop your public PEM file to begin.
				</p>
			</div>

			<!-- Body -->
			<div class="p-6">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					id="drop-zone"
					class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					onclick={() => document.getElementById('file-input')?.click()}
				>
					<!-- Prompt -->
					{#if !file}
						<div id="drop-zone-prompt" class="flex flex-col items-center justify-center pt-5 pb-6">
							<svg
								class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 20 16"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
								/>
							</svg>
							<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
								<span class="font-semibold">Click to upload</span> or drag and drop
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Public PEM file (.pem)</p>
						</div>
					{/if}

					<!-- Status -->
					{#if status}
						<div
							id="drop-zone-status"
							class="flex flex-col items-center justify-center text-center text-green-600 dark:text-green-400"
						>
							<p class="text-sm">{status}</p>
						</div>
					{/if}

					<!-- Hidden file input -->
					<input
						id="file-input"
						type="file"
						class="hidden"
						accept=".pem,application/x-x509-ca-cert,text/plain"
						onchange={handleFileSelect}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
