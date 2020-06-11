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
		background-color: #fffeeb;
		background-image: url("./img/soft-wallpaper.png");
		position: absolute;
		left: calc((100vw - 8.5in) / 2);
		box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.25);
	}
</style>