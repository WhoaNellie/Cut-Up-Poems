<script>
	import Words from './Words.svelte';
	let words = [];
	let wordsStr = 
`Take a newspaper.
Take some scissors.
Choose from this paper an article of the length you want to make your poem.
Cut out the article.
Next carefully cut out each of the words that makes up this article and put them all in a bag.
Shake gently.
Next take out each cutting one after the other.
Copy conscientiously in the order in which they left the bag.
The poem will resemble you.
And there you are—an infinitely original author of charming sensibility, even though unappreciated by the vulgar herd.`;
	let visible = true;

	function getWords(){
		visible = false;
		words = [];
		//find test-string for this, possibly add invisible chars?
		words = wordsStr.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, '');
		words = wordsStr.split(" ");
		
	}
</script>


<main>
	{#if visible}
	<div id="chooseWords">
		<h1>To Make a Dadaist Poem</h1>
		<p>This is a virtual poetry maker based on Tristan Tzara's instructions! Paste any text below and rearrange to your heart's content.</p>
		<textarea id="words" cols="30" rows="10" bind:value={wordsStr}></textarea>
		<button id="submitWords" on:click={getWords}>Cut Out</button>
	</div>
	{/if}
	
	<Words {words}/>
</main>
<!-- ideas
 splash words onto page
 shake phone to shuffle
 wikipedia api?
 menu of what types of words to select
	parts of speech
	yes/no curses
	random/suggested articles
	completely random
	font size
 -->
<style>
	#chooseWords{
		/* position: fixed;
		top: max(30vh, calc(50vh - 250px));
		left: max(30vw, calc(50vw - 350px)); */
		margin: max(20vh, calc(40vh - 250px)) auto;
		z-index: 2;
		width: min(40vw, 700px);
		height: min(40vh, 500px);
		text-align: center;

		color: rgb(255, 247, 238);
	}

	#words{
		width: 100%;
	}

	#submitWords{
		width: 50%;
	}

	#chooseWords.collapsed{

	}

</style>