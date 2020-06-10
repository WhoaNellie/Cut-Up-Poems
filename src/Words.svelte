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
            let text = svgs[i].lastChild;
            let height = text.getBBox().height;
            let width = text.getBBox().width;

            let calcHeight = height + text.getBBox().y + Math.random()*3;
            let calcWidth = width + text.getBBox().x + Math.random()*15;

            svgs[i].setAttribute("height", calcHeight);
            svgs[i].setAttribute("width", calcWidth);

            svgs[i].firstChild.setAttribute("d", `M 0 0 H ${calcWidth} V ${calcHeight} H 0 Z`);
        }
    })
</script>

{#each words as word}
<svg 
    on:mousedown={handleDrag}
    on:mouseup={handleRelease}
>
    <path 
    d="M 0 0 H 100 V 100 H 0 Z"
    fill="hsl(44, 100%, {97+Math.floor(Math.random()*4)}%)"
    
    >    
    </path>

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
        position: absolute;
        user-select: none;
    }

    path{
        box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.25);
        pointer-events: none;
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