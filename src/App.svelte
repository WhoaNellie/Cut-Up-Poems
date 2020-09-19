<script>
	import Words from './Words.svelte';
	let words = ["hi","heey", "ahoy", "hello", "sup", "yarr", "ya ha ha"];
	let wordsStr = '';

	function getWords(){
		words = [];
		//find test-string for this, possibly add invisible chars?
		words = wordsStr.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, '');
		words = wordsStr.split(" ");
	}
</script>

<main>
	<div id="chooseWords">
		<textarea id="words" cols="30" rows="10" placeholder="Words to Use" bind:value={wordsStr}></textarea>
		<button id="submitWords" on:click={getWords}>Submit</button>
	</div>
	
	<!-- <div class="pasteHere">
	</div> -->
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
	#chooseWords{
		position: fixed;
		top: 0;
		right: 0;
		z-index: 2;
		width: min-content;
		height: min-content;
	}

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