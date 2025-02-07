from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Sample task data with priority levels
tasks = {
    'todo': [{'task': 'Buy Groceries', 'priority': 'High'}, {'task': 'Finish Homework', 'priority': 'Medium'}],
    'inprogress': [{'task': 'Clean Room', 'priority': 'Low'}, {'task': 'Work on Project', 'priority': 'High'}],
    'onhold': [{'task': 'Read Book', 'priority': 'Medium'}],
    'completed': [{'task': 'Pay Bills', 'priority': 'High'}, {'task': 'Organize Wardrobe', 'priority': 'Low'}]
}

@app.route('/')
def index():
    # Get search query and filter options
    search_query = request.args.get('search', '')
    filter_priority = request.args.get('priority', '')

    # Filter tasks based on search query and priority
    filtered_tasks = {status: [] for status in tasks}
    for status, task_list in tasks.items():
        for task in task_list:
            # Apply search filter
            if search_query.lower() in task['task'].lower():
                # Apply priority filter
                if filter_priority == '' or task['priority'] == filter_priority:
                    filtered_tasks[status].append(task)
    
    return render_template('index.html', tasks=filtered_tasks, search_query=search_query, filter_priority=filter_priority)

@app.route('/update_task', methods=['POST'])
def update_task():
    task = request.form['task']
    from_status = request.form['from_status']
    to_status = request.form['to_status']
    
    # Find the task in the current status and move it to the new status
    task_data = next(t for t in tasks[from_status] if t['task'] == task)
    tasks[from_status].remove(task_data)
    tasks[to_status].append(task_data)

    return redirect(url_for('index'))

@app.route('/add_task', methods=['POST'])
def add_task():
    new_task = request.form['new_task']
    priority = request.form['priority']
    if new_task:
        tasks['todo'].append({'task': new_task, 'priority': priority})  # Add task with priority
    return redirect(url_for('index'))

@app.route('/delete_task', methods=['POST'])
def delete_task():
    task = request.form['task']
    status = request.form['status']
    
    # Remove task from the specified status list
    tasks[status] = [t for t in tasks[status] if t['task'] != task]
    return redirect(url_for('index'))

@app.route('/edit_task', methods=['POST'])
def edit_task():
    old_task = request.form['old_task']
    new_task = request.form['new_task']
    status = request.form['status']
    priority = request.form['priority']
    
    # Update the task in the list
    task_data = next(t for t in tasks[status] if t['task'] == old_task)
    task_data['task'] = new_task
    task_data['priority'] = priority
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
