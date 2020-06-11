<script>
	import Words from './Words.svelte';
	let words = ["hi","heey", "ahoy", "hello", "sup", "yarr", "ya ha ha"];
</script>

<main>
	<div class="pasteHere">
	
	</div>
	<Words {words}/>
</main>

<style>
	.pasteHere{
		width: 8.5in;
		height: 11in;
		background-color: whitesmoke;
		position: absolute;
		left: calc((100vw - 8.5in) / 2);
		top: -15%;
		box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.25);
	}
</style>