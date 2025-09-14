<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Textarea,
		Label,
		Input,
		Select,
		Button,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyCell,
		TableBodyRow
	} from 'flowbite-svelte';
	import yaml from 'js-yaml';
	import { showToast } from '$lib/stores/toastStore';
	import Icon from '@iconify/svelte';
	import EncryptionKeyUploader from '$lib/components/EncryptionKeyUploader.svelte';
	import Base64Accordion from '$lib/components/Base64Accordion.svelte';

	let keyName: string | null = null;
	let keyContent: string | null = null;
	let pem = $state(null);
	let secretYaml = $state('');
	let sealedYaml = $state('');
	let showYamlCode = $state(false);

	let secretJson = $state({
		namespace: 'default',
		name: 'secret',
		type: 'Opaque',
		dataItems: [{ DB_PASSWORD: 'HighSecurityPassword' }]
	});

	function onKeyLoad(event: CustomEvent) {
		// event.detail contains { name, content }
		keyName = event.detail.name;
		keyContent = event.detail.content;
		pem = keyContent;
	}

	// ─── YAML Generator Using js-yaml
	function generateYamlDataSection(json) {
		const data = {};
		json.dataItems.forEach((item) => {
			const [key, value] = Object.entries(item)[0];
			data[key] = btoa(value); // base64 encode
		});
		const secret = {
			apiVersion: 'v1',
			kind: 'Secret',
			metadata: {
				name: json.name,
				namespace: json.namespace
			},
			type: json.type,
			data
		};
		return yaml.dump(secret, { indent: 2 });
	}

	function updateYaml() {
		secretYaml = generateYamlDataSection(secretJson);
	}

	// ─── YAML to Form Conversion
	function updateForm() {
		try {
			const parsedYaml = yaml.load(secretYaml);

			if (parsedYaml && parsedYaml.kind === 'Secret' && parsedYaml.data) {
				const dataItems = Object.entries(parsedYaml.data).map(([key, value]) => {
					return { [key]: atob(value) };
				});

				secretJson = {
					namespace: parsedYaml.metadata.namespace,
					name: parsedYaml.metadata.name,
					type: parsedYaml.type,
					dataItems: dataItems
				};
			} else {
				console.error('Invalid YAML secret format.');
				showToast('Invalid YAML secret format. Please check the content.');
			}
		} catch (e) {
			console.error('Failed to parse YAML:', e);
			showToast('Failed to parse YAML. Please check for syntax errors.');
		}
	}

	// ─── Data Item Manipulation
	function addItem() {
		secretJson.dataItems = [...secretJson.dataItems, { '': '' }];
		updateYaml();
	}

	function updateItemKey(index, newKey) {
		const currentItem = secretJson.dataItems[index];
		const [oldKey, value] = Object.entries(currentItem)[0];
		delete currentItem[oldKey];
		currentItem[newKey] = value;
		updateYaml();
	}

	function updateItemValue(index, newValue) {
		const currentItem = secretJson.dataItems[index];
		const [key] = Object.keys(currentItem);
		currentItem[key] = newValue;
		updateYaml();
	}

	function deleteItem(index) {
		secretJson.dataItems.splice(index, 1);
		secretJson.dataItems = [...secretJson.dataItems];
		updateYaml();
	}

	// ─── Sealed Secret Generator
	async function generateSealed() {
		if (!pem) {
			sealedYaml = 'PEM not loaded or invalid.';
			return;
		}
		if (
			secretJson.dataItems.some((item) => {
				const [key, value] = Object.entries(item)[0];
				return !key?.trim() || !value?.trim();
			})
		) {
			showToast('Secret contains invalid/empty keys or values. Kindly remove them first');
			return;
		}

		const response = await fetch('/api/kubeseal', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret: secretYaml, pem })
		});

		const data = await response.json();
		sealedYaml = yaml.dump(yaml.load(data.sealed)) || 'Sealing failed.';
	}

	async function copyToClipboard(content) {
		try {
			await navigator.clipboard.writeText(content);
			showToast('Copied to clipboard');
		} catch {
			showToast('Could not copy to clipboard');
		}
	}

	onMount(() => {
		updateYaml();
	});
</script>

<div class="flex flex-col gap-6 p-4 sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto my-10">
	<EncryptionKeyUploader on:load={onKeyLoad} />

	<div>
		<div class="max-w-4xl mx-auto">
			<!-- Card -->
			<div
				class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
			>
				<!-- Header -->
				<div class="p-6 border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold text-gray-800 dark:text-white">
							2. Create Your Secret
						</h2>
						<Button
							onclick={() => {
								showYamlCode = !showYamlCode;
								if (!showYamlCode) updateForm();
							}}
							class=" border border-gray-500 flex items-center"
						>
							{#if !showYamlCode}
								<Icon icon="pepicons-pop:file" class="h-5 w-5 mr-2" /> View Yaml
							{:else}
								<Icon icon="fluent:form-24-filled" class="h-5 w-5 mr-2" /> View Form
							{/if}
						</Button>
					</div>
				</div>

				<!-- Body -->
				<div class="p-6">
					{#if !showYamlCode}
						<div class="flex flex-col gap-2 m-4">
							<div class="flex gap-4 mb-4">
								<Label class="w-full">
									<span class="text-white">Secret Name</span>
									<Input
										bind:value={secretJson.name}
										oninput={updateYaml}
										placeholder="Enter name"
									/>
								</Label>
								<Label class="w-full">
									<span class="text-white">Namespace</span>
									<Input
										bind:value={secretJson.namespace}
										oninput={updateYaml}
										placeholder="Enter namespace"
									/>
								</Label>
								<Label class="w-full">
									<span class="text-white">Type</span>
									<Select
										placeholder="Enter type"
										bind:value={secretJson.type}
										items={[
											{ value: 'Opaque', name: 'Opaque' },
											{ value: 'kubernetes.io/tls', name: 'TLS' }
										]}
										onchange={updateYaml}
									/>
								</Label>
							</div>
							<Label class="text-white">Data</Label>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								Enter secret keys and their plain text values below. They will be Base64 encoded
								automatically.
							</p>

							<Table shadow hoverable>
								<TableHead>
									<TableHeadCell>Key</TableHeadCell>
									<TableHeadCell>Value</TableHeadCell>
									<TableHeadCell></TableHeadCell>
								</TableHead>
								<TableBody>
									{#each secretJson.dataItems as item, index}
										<TableBodyRow>
											<TableBodyCell>
												<Input
													type="text"
													value={Object.keys(item)[0]}
													oninput={(e) => updateItemKey(index, e.target.value)}
													placeholder="Key"
												/>
											</TableBodyCell>
											<TableBodyCell>
												<Textarea
													class="w-full"
													value={Object.values(item)[0]}
													oninput={(e) => updateItemValue(index, e.target.value)}
													placeholder="Value"
													rows={1}
												/>
											</TableBodyCell>
											<TableBodyCell>
												{#if index >= 0}
													<button
														title="Remove secret"
														aria-label="Remove secret"
														onclick={() => deleteItem(index)}
														class="ml-2"
													>
														<Icon
															icon="fluent:delete-24-filled"
															class="w-7 h-7 hover:text-red-500 transition-colors duration-200"
														/>
													</button>
												{/if}
											</TableBodyCell>
										</TableBodyRow>
									{/each}
								</TableBody>
							</Table>
							<div class="flex items-center gap-2 mt-2 ml-3">
								<Button color={'green'} onclick={addItem}>Add Secret</Button>
							</div>
						</div>
					{:else}
						<Textarea
							bind:value={secretYaml}
							placeholder={`apiVersion: v1\nkind: Secret\nmetadata:\n  name: service\n  namespace: fes\ntype: Opaque\ndata:\n  key: dmFsdWU=`}
							rows={15}
							class="w-full mt-4"
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div>
		<div class="max-w-4xl mx-auto">
			<!-- Card -->
			<div
				class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
			>
				<!-- Header -->
				<div class="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold text-gray-800 dark:text-white">
						3. Generate Sealed Secret
					</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
						Click the button to encrypt your secret using your cluster's pem file.
					</p>

					<Button onclick={generateSealed} name="Seal" color={'blue'} class="ml-2 mt-2">
						<Icon icon="icon-park-outline:file-lock" class="w-5 h-5 mr-2" /> Seal Secret
					</Button>
				</div>
				{#if sealedYaml}
					<!-- Body -->
					<div class="p-6">
						<div class="flex items-center justify-between">
							<div class="text-white text-xl">Result</div>

							<Button
								onclick={() => copyToClipboard(sealedYaml)}
								name="Copy"
								class=" border border-gray-500 flex items-center"
							>
								<Icon icon="flowbite:file-copy-solid" class="h-5 w-5 mr-2" color="alternative" />
								Copy
							</Button>
						</div>

						<Textarea bind:value={sealedYaml} readonly rows={15} class="mt-2 w-full" />
					</div>
				{/if}
			</div>
		</div>
	</div>
	<Base64Accordion />
</div>
