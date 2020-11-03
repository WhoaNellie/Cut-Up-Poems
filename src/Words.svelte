<script>
    import { onMount, afterUpdate } from 'svelte';
    export let words;
    let clientY = 0;
    let clientX = 0;

    let mouseListener;
    let touchListener;

    let top = words.length+1;

    function handleDrag(e){
        if(e.type === "mousedown"){
            mouseListener = function(mouseEvent) {
                clientY = mouseEvent.clientY;
                clientX = mouseEvent.clientX;

                e.target.style.top = clientY - e.target.height.baseVal.value/2 + "px";
                e.target.style.left = clientX - e.target.width.baseVal.value/2 + "px";
                e.target.style.filter = "drop-shadow(2px 2px 2px #2b2b2173)";
            }
            document.addEventListener("mousemove", mouseListener);
            e.target.style.zIndex = top;
            top++;
        }else if(e.type === "touchstart"){
            touchListener = function(touchEvent) {
                clientY = touchEvent.changedTouches[0].pageY;
                clientX = touchEvent.changedTouches[0].pageX;

                e.target.style.top = clientY - e.target.height.baseVal.value/2 + "px";
                e.target.style.left = clientX - e.target.width.baseVal.value/2 + "px";
                e.target.style.filter = "drop-shadow(2px 2px 2px #2b2b2173)";
            }
            document.addEventListener("touchmove", touchListener);
            e.target.style.zIndex = top;
            top++;
        }
    }

    function handleRelease(e){
        e.target.style.filter = "drop-shadow(1px 1px 1px #2b2b2149)";
        document.removeEventListener("mousemove", mouseListener);
        document.removeEventListener("touchmove", touchListener);
    }

    function generateTextStyle(){
        let size = (1.7 + Math.random()*1.2).toFixed(2) + "rem";
        let colors = ["#333", "#271d1d", "#1d1d27", "#464646", "#0e0e0a", "#8a1503", "#2a3980", "#282894"];
        let fonts = ["serif", "sans-serif", "helvetica", "arial", "Times New Roman", "Georgia", "Book Antiqua", "Impact", "Lucida Sans Unicode", "Courier New", "Lucida Console", "Trebuchet MS"];

        return `font-size: ${size};
                fill: ${colors[Math.floor(Math.random()*colors.length)]};
                font-family: ${fonts[Math.floor(Math.random()*fonts.length)]};`;
    }

    function generateWords(){
        let svgs = Array.from(document.getElementsByTagName("svg"));
        for(let i = 0; i < svgs.length; i++){
            let text = svgs[i].lastChild;
            let height = text.getBBox().height;
            let width = text.getBBox().width;

            let calcHeight = height + text.getBBox().y + Math.random()*3;
            let calcWidth = width + text.getBBox().x + Math.random()*15;

            svgs[i].setAttribute("height", calcHeight.toFixed(2));
            svgs[i].setAttribute("width", calcWidth.toFixed(2));

            let x = Math.random()*3;
            let y = Math.random()*8;

            let x1 = Math.random()*20;
            let y1 = y - Math.random()*y;

            let x2 = Math.random()*(calcWidth - x1);
            let y2 = y - Math.random()*y;

            let cutTop = `M ${x} ${y} 
             C ${x1.toFixed(2)} ${y1.toFixed(2)}, 
               ${x2.toFixed(2)} ${y2.toFixed(2)}, 
               ${calcWidth.toFixed(2)} 0 
             L ${calcWidth.toFixed(2)} ${calcHeight.toFixed(2)} 
             L 0 ${calcHeight.toFixed(2)}  
             Z`;

            let cutBottom = `M ${x} ${y} 
             L ${calcWidth.toFixed(2)} 0
             L ${calcWidth.toFixed(2)} ${calcHeight.toFixed(2)} 
             C ${(calcWidth - x2).toFixed(2)} ${(calcHeight - y2).toFixed(2)}, 
               ${(calcWidth - x1).toFixed(2)} ${(calcHeight - y1).toFixed(2)}, 
               0 ${calcHeight.toFixed(2)} 
             Z`

            svgs[i].firstChild.setAttribute("d",[cutTop, cutBottom][Math.floor(Math.random()*2)]);

            //adding a clip path that hopefully cuts off text that flows outside of the paper, hard to test though
            let paper = svgs[i].firstChild;
            let paperPath = paper.cloneNode(true);
            svgs[i].querySelector(":nth-child(2)").append(paperPath);

            //place randomly on page
            // svgs[i].style.top = `${Math.random()*window.innerHeight - 10}px`;
            // svgs[i].style.left = `${Math.random()*window.innerWidth - 20}px`;

            svgs[i].style.top = `${Math.random()*90 + 5}%`;
            svgs[i].style.left = `${Math.random()*85 + 5}%`;

            
        }
    }

    onMount(() => {
        generateWords();
    })

    afterUpdate(() => {
        generateWords();
        // let svgs = Array.from(document.getElementsByTagName("svg"));
        // for(let i = 0; i < svgs.length; i++){
        //     fly(svgs[i], { x: 100, y: 200, duration: 2000, opacity: 1 });
        // }
        // fly(this, { x: 100, y: 200, duration: 2000, opacity: 1 })
    })
</script>

{#each words as word, i}
<svg 
    on:mousedown={handleDrag}
    on:mouseup={handleRelease}

    on:touchstart={handleDrag}
    on:touchend={handleRelease}
>
    <path 
    fill="hsl(44, 100%, {97+Math.floor(Math.random()*4)}%)"
    >    
    </path>

    <clipPath id={`paper${i}`}>
    </clipPath>
    
    <text 
        x={(5 + Math.random()*20).toFixed(2)}
        y={(35 + Math.random()*20).toFixed(2)}
        style={generateTextStyle()}
        clip-path={`url(#paper${i})`}
    >
            {word}    
        </text>

</svg>
    
{/each}


<style>
    svg{
        position: absolute;
        user-select: none;
        filter: drop-shadow(1px 1px 1px #2b2b2149);
    }

    path{
        /* box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.25); */
        pointer-events: none;
    }

    text{
        pointer-events: none;
    }

    svg:hover{
        cursor: grab;
    }

    svg:active, svg:focus, path:active, text:active{
        cursor: grabbing!important;
        
        filter: drop-shadow(2px 2px 2px #2b2b2173);
    }
</style>