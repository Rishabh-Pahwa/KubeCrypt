<script lang="ts">
	import kubecrypt from '$lib/assets/kubecrypt-white.svg';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={kubecrypt} />
</svelte:head>

<Header />
<Toast />

{@render children?.()}

<Footer />
