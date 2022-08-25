<script>
	export let label;
</script>

<div class="labelledInput">
	<span>{label}</span>
	<slot />
</div>

<style lang="scss">
	.labelledInput {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		> :global(*:nth-child(2)) {
			flex: 1;
		}
	}
</style>
