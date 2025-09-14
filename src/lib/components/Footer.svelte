<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<div class="px-8">
	<div class="group flex flex-col gap-4 justify-center items-center p-4 lg:w-1/2 mx-auto my-10">
		<!-- Icon Links -->
		<div class="flex gap-4">
			<a
				href="https://github.com/Rishabh-Pahwa"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
			>
				<Icon
					icon="mdi:github"
					class="inline w-7 h-7 hover:text-gray-500 transition-colors duration-200"
				/>
			</a>
			<a
				href="https://linkedin.com/in/pahwarishabh"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="LinkedIn"
			>
				<Icon
					icon="mdi:linkedin"
					class="inline w-7 h-7 hover:text-blue-500 transition-colors duration-200"
				/>
			</a>
		</div>

		<!-- Footer Text -->
		<span class="text-base font-medium whitespace-nowrap dark:text-white flex items-center gap-2">
			<span class="inline-block transition-transform duration-300 group-hover:rotate-60">
				&lt;/&gt;
			</span>
			<Icon icon="noto:orange-heart" class="inline w-6 h-6" />
			by
			<a
				href="https://rishabhpahwa.in"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Rishabh-Portfolio"
			>
				<b class="ml-1">Rishabh Pahwa</b>
			</a>
		</span>
		<p class="text-gray-400 text-sm">
			&copy; {new Date().getFullYear()} All Rights Reserved.
		</p>
	</div>
</div>
