<script>
	import Word from './Word.svelte';
	let words = ["hi", "hello"];
</script>

<main>
 {#each words as w}
	<Word word={w}/>
 {/each}
</main>

<style>
</style>