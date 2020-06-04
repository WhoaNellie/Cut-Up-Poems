<script>
    export let words;
    let clientY = 0;
    let clientX = 0;

    let listener;

    let top = words.length+1;

    function handleDrag(e){
        listener = function(mouseEvent) {
        clientY = mouseEvent.clientY;
        clientX = mouseEvent.clientX;

        e.target.style.top = clientY - e.target.offsetHeight/2 + "px";
        e.target.style.left = clientX - e.target.offsetWidth/2 + "px";
    }
        document.addEventListener("mousemove", listener);
        e.target.style.zIndex = top;
        top++;
       
    }

    function handleRelease(){
        document.removeEventListener("mousemove", listener);
    }

    function generateStyle(){
        let size = (2 + Math.random()*1.1).toFixed(2) + "rem";
        let colors = ["#333", "#271d1d", "#1d1d27", "#464646", "#0e0e0a", "#8a1503", "#2a3980", "#282894"];
        let fonts = ["serif", "sans-serif", "helvetica", "arial", "Times New Roman"];

        return `font-size: ${size};
                color: ${colors[Math.floor(Math.random()*colors.length)]};
                font-family: ${fonts[Math.floor(Math.random()*fonts.length)]}`;
    }


</script>

{#each words as word}
    <div 
        on:mousedown={handleDrag}
        on:mouseup={handleRelease}
        style={generateStyle()}
    >
        {word}    
    </div>
{/each}

<style>
    div{
        /* padding: 1% 2%; */
        width: fit-content;
        background-color: white;
        box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.25);
        position: absolute;
        user-select: none;
    }

    div:hover{
        cursor: grab;
    }

    div:active{
        cursor: grabbing;
    }
</style>