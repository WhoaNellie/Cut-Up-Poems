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

        // e.target.offsetHeight/2 
        e.target.style.top = clientY + "px";
        e.target.style.left = clientX + "px";
    }
        document.addEventListener("mousemove", listener);
        e.target.style.zIndex = top;
        top++;
       
    }

    function handleRelease(){
        document.removeEventListener("mousemove", listener);
    }

    function generateTextStyle(){
        let size = (1.7 + Math.random()*1.2).toFixed(2) + "rem";
        let colors = ["#333", "#271d1d", "#1d1d27", "#464646", "#0e0e0a", "#8a1503", "#2a3980", "#282894"];
        let fonts = ["serif", "sans-serif", "helvetica", "arial", "Times New Roman", "Georgia", "Book Antiqua", "Impact", "Lucida Sans Unicode", "Courier New", "Lucida Console", "Trebuchet MS"];
        let padding = `${Math.random().toFixed(2)}rem ${Math.random().toFixed(2)}rem ${Math.random().toFixed(2)}rem ${Math.random().toFixed(2)}rem`;
        let background = `hsl(44, 100%, ${95+Math.floor(Math.random()*6)}%)`;

        return `font-size: ${size};
                fill: ${colors[Math.floor(Math.random()*colors.length)]};
                font-family: ${fonts[Math.floor(Math.random()*fonts.length)]};`;
    }

    function generatePaperStyle(){

    }

    function getSVGWidth(svh){
        console.log(svh)
    }
</script>

{#each words as word}
<svg 
    width={word.length + 5 + "em"}
    height="10ex"
    on:mousedown={handleDrag}
    on:mouseup={handleRelease}>
<text 
    y="50"
    style={generateTextStyle()}>
        {word}    
    </text>
</svg>
    
{/each}


<style>
    svg{
        /* width: fit-content; */
        background-color: white;
        box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.25);
        position: absolute;
        user-select: none;
    }
    text{
        pointer-events: none;
    }

    svg:hover{
        cursor: grab;
    }

    svg:active{
        cursor: grabbing;
    }
</style>