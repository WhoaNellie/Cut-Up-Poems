<script>
    import { onMount } from 'svelte';
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
        // console.log(e.target.height.baseVal.value);
        e.target.style.top = clientY - e.target.height.baseVal.value/2 + "px";
        e.target.style.left = clientX - e.target.width.baseVal.value/2 + "px";
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

    // function getSVGWidth(svh){
    //     console.log(svh)
    // }

    // document.addEventListener("DOMContentLoaded", function(){
    //     let svgs = document.getElementsByTagName("svg");
    //     console.log(svgs);
    // })

    onMount(() => {
        let svgs = Array.from(document.getElementsByTagName("svg"));
        for(let i = 0; i < svgs.length; i++){
            let text = svgs[i].firstChild;
            let height = text.getBBox().height;
            let width = text.getBBox().width;

            console.log(text.getBBox());

            svgs[i].setAttribute("height", height + text.getBBox().y + Math.random()*3);
            svgs[i].setAttribute("width", width + text.getBBox().x + Math.random()*15)
        }
    })
</script>

{#each words as word}
<svg 
    on:mousedown={handleDrag}
    on:mouseup={handleRelease}>
<text 
    x={5 + Math.random()*20}
    y={30 + Math.random()*20}
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