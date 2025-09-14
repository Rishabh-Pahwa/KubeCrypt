// components/toastStore.ts
import { writable } from 'svelte/store';

export const toastMessage = writable('');
export const toastVisible = writable(false);

export function showToast(message: string) {
	toastMessage.set(message);
	toastVisible.set(true);
}
