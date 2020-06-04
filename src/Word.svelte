<script>
    export let word;
    let clientY = 0;
    let clientX = 0;

    let listener;

    function handleDrag(e){
        listener = function(mouseEvent) {
        clientY = mouseEvent.clientY;
        clientX = mouseEvent.clientX;

        e.target.style.top = clientY - e.target.offsetHeight/2 + "px";
        e.target.style.left = clientX - e.target.offsetWidth/2 + "px";
    }
        document.addEventListener("mousemove", listener)
       
    }

    function handleRelease(){
        document.removeEventListener("mousemove", listener);
    }
</script>

<div 
    on:mousedown={handleDrag}
    on:mouseup={handleRelease}
>
    {word}    
</div>

<style>
    div{
        padding: 1% 2%;
        width: fit-content;
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