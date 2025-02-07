// Allow the drop
function allowDrop(ev) {
    ev.preventDefault();
}

// Start dragging an item
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Drop event
function drop(ev) {
    ev.preventDefault();

    var data = ev.dataTransfer.getData("text");
    var draggedItem = document.getElementById(data);

    // Find the column that the item was dropped into
    const targetContainer = ev.target.closest('.column');
    if (targetContainer && targetContainer !== draggedItem.parentElement) {
        targetContainer.appendChild(draggedItem);
        
        // Update the task status in the backend
        const fromStatus = draggedItem.dataset.status; // Current status
        const toStatus = targetContainer.id; // New status

        // Send AJAX request to update task status in the backend
        fetch('/update_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: draggedItem.id,
                from_status: fromStatus,
                to_status: toStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task status updated:', data);
        })
        .catch(error => {
            console.error('Error updating task status:', error);
        });
    }

    // Save updated task positions in localStorage (optional)
    saveTaskPositions();
}

// Save task positions in localStorage
function saveTaskPositions() {
    const columns = document.querySelectorAll('.column');
    const positions = {};

    columns.forEach(column => {
        const taskIds = [];
        column.querySelectorAll('.todo-item').forEach(task => {
            taskIds.push(task.id);
        });
        positions[column.id] = taskIds;
    });

    localStorage.setItem('taskPositions', JSON.stringify(positions));
}

// Load task positions from localStorage (optional)
function loadTaskPositions() {
    const positions = JSON.parse(localStorage.getItem('taskPositions'));
    if (positions) {
        Object.keys(positions).forEach(columnId => {
            const column = document.getElementById(columnId);
            const taskIds = positions[columnId];

            taskIds.forEach(taskId => {
                const task = document.getElementById(taskId);
                column.appendChild(task);
            });
        });
    }
}

// Delete task function
function deleteTask(taskId) {
    const taskElement = document.getElementById(taskId);
    if (!taskElement) return; // Ensure the element exists

    const column = taskElement.closest('.column');
    const columnId = column.id;

    // Send a request to the backend to delete the task
    fetch('/delete_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            task_id: taskId,
            column: columnId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            taskElement.remove(); // Remove the task element from the DOM
            console.log('Task deleted successfully');
        } else {
            alert('Error deleting task: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
}

// Attach the delete task functionality to the delete button
function addDeleteButtonListener(taskId) {
    const deleteButton = document.getElementById(`delete-btn-${taskId}`);
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            deleteTask(taskId);
        });
    }
}

// Load task positions when page is loaded
window.onload = function() {
    loadTaskPositions();

    // Initialize delete button listeners for existing tasks (if needed)
    const allTasks = document.querySelectorAll('.todo-item');
    allTasks.forEach(task => {
        const taskId = task.id;
        addDeleteButtonListener(taskId);
    });
};
