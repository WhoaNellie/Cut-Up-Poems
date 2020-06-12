<script>
	import Words from './Words.svelte';
	let words = ["hi","heey", "ahoy", "hello", "sup", "yarr", "ya ha ha"];
</script>

<main>
	<div class="pasteHere">
	
	</div>
	<Words {words}/>
</main>
<!-- ideas
 splash words onto page
 shake phone to shuffle
 menu of what types of words to select
	parts of speech
	yes/no curses
	random/suggested articles
	completely random
	font size
 -->
<style>
	.pasteHere{
		width: 90vw;
		height: 90vh;
		background-image: url("./img/soft-wallpaper.jpg");
		position: absolute;
		left: calc((100vw - 90vw) / 2);
		top: 5vh;
		box-shadow: 2px 2px 5px 3px rgba(0,0,0,0.25);
	}
	.pasteHere::after{
		content: '';
		background-color: #fffeeb52;
		position: absolute;
		width: 90vw;
		height: 90vh;
	}
</style>