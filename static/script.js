function allowDrop(ev) {
    ev.preventDefault();
    ev.target.classList.add("over");
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedItem = document.getElementById(data);
    ev.target.classList.remove("over");
    
    // If the drop target is not a column, ignore the drop
    if (!ev.target.classList.contains("column")) {
        return;
    }

    ev.target.appendChild(draggedItem);
}
