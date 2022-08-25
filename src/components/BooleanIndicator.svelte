<script>
	export let state;
	export let trueMessage;
	export let falseMessage;
</script>

<span class="indicator" class:green={state}>
	<!-- <span class="indicatorDot" class:green={state} /> -->
	{state ? trueMessage : falseMessage}
</span>

<style>
	.indicator {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 4px;
		color: black;
		padding: 3px 4px;
		border-radius: 4px;
		font-weight: bold;
		background-color: var(--red);
	}
	.indicatorDot {
		display: inline-block;
		width: 1em;
		height: 1em;
		border-radius: 50%;
		background-color: var(--red);
	}
	.green {
		background-color: var(--green);
	}
</style>
