import { writable } from "svelte/store";

export const hostConfig = writable(
	JSON.parse(window.localStorage.getItem("hostConfig") || "{}")
);
hostConfig.subscribe((config) => {
	window.localStorage.setItem("hostConfig", JSON.stringify(config));
});
