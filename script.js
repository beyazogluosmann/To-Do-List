// Görev formunu gönderme
document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskInput = document.getElementById('task-input').value;
    const priorityInput = document.getElementById('priority-input').value;
    const tagInput = document.getElementById('tag-input').value;

    // Kullanıcının girdiği etiketleri virgülle ayır ve diziye çevir
    const tags = tagInput.split(',').map(tag => tag.trim());

    const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: taskInput,
            priority: priorityInput,
            tags: tags, // Backend'e etiketleri gönderiyoruz
            completed: false
        }),
    });

    if (response.ok) {
        const task = await response.json();
        addTaskToUI(task);
        document.getElementById('task-input').value = '';
        document.getElementById('tag-input').value = '';
    } else {
        console.error('Görev eklenemedi:', response.statusText);
    }
});


// Görev önceliğini UI'da güncelleme
function updateTaskPriorityUI(li, priority) {
    li.classList.remove('priority-yüksek', 'priority-orta', 'priority-düşük');
    if (priority === 'yüksek') li.classList.add('priority-yüksek');
    else if (priority === 'orta') li.classList.add('priority-orta');
    else if (priority === 'düşük') li.classList.add('priority-düşük');
}

// Görev tamamlanma süresini gösterme
function displayCompletionTime(li, createdAt, completedAt) {
    if (!completedAt) return;

    const completedDate = new Date(completedAt);
    const createdDate = new Date(createdAt);
    const timeTaken = completedDate - createdDate;

    const hours = Math.floor(timeTaken / (1000 * 60 * 60));
    const minutes = Math.floor((timeTaken % (1000 * 60 * 60)) / (1000 * 60));

    const completionInfo = li.querySelector('.completion-time');
    if (completionInfo) completionInfo.remove();

    li.querySelector('.task-content').innerHTML += `<br><small class="completion-time">Tamamlanma Süresi: ${hours} saat, ${minutes} dakika</small>`;
}

// Görevleri UI'ya ekleme
function addTaskToUI(task) {
    const taskList = document.getElementById('task-list');

    // Eğer görev zaten varsa, önce kaldır
    const existingTask = taskList.querySelector(`li[data-id="${task._id}"]`);
    if (existingTask) existingTask.remove();

    const li = document.createElement('li');
    li.setAttribute('data-id', task._id);
    li.setAttribute('data-priority', task.priority);

    // 🏷 Etiketleri ayrı kutular içinde göstermek için güncellendi
    const tags = task.tags && task.tags.length > 0 
        ? task.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') 
        : '<span class="no-tags">Etiket yok</span>';

    const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Bilinmeyen tarih';

    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-completed" ${task.completed ? 'checked' : ''}/> 
            <strong>${task.title}</strong> - Öncelik: <span class="priority-${task.priority}">${task.priority}</span>
            <br><small>Oluşturulma Tarihi: ${createdAt}</small>
            <br><div class="tag-container">${tags}</div>
        </div>
        <button class="delete-btn">Sil</button>
        <button class="update-btn">Güncelle</button>
        <div class="edit-form" style="display:none;">
            <input type="text" class="edit-title" value="${task.title}" />
            <select class="edit-priority">
                <option value="düşük" ${task.priority === 'düşük' ? 'selected' : ''}>Düşük</option>
                <option value="orta" ${task.priority === 'orta' ? 'selected' : ''}>Orta</option>
                <option value="yüksek" ${task.priority === 'yüksek' ? 'selected' : ''}>Yüksek</option>
            </select>
            <input type="text" class="edit-tags" value="${task.tags ? task.tags.join(', ') : ''}" placeholder="Etiketleri gir (virgülle ayır)">
            <button class="save-btn">Kaydet</button>
        </div>
    `;

    updateTaskStyles(li, task); // Stil güncelleme
    taskList.appendChild(li);
    setupTaskEventListeners(li, task);
}



// Görevlerin görünümünü güncelleme
function updateTaskStyles(li, task) {
    if (task.completed) {
        li.classList.add('completed-task');
        li.style.color = 'gray'; // Tamamlanmış görev için gri renk
        displayCompletionTime(li, task.createdAt, task.completedAt);
    } else {
        li.classList.remove('completed-task');
        li.style.color = ''; // Tamamlanmamış görev için varsayılan renk
        const completionTimeInfo = li.querySelector('.completion-time');
        if (completionTimeInfo) completionTimeInfo.remove(); // Tamamlanma süresi bilgisini kaldır
    }
    updateTaskPriorityUI(li, task.priority); // Öncelik rengini de güncelle
}

// Görev olay dinleyicilerini ayarlama
function setupTaskEventListeners(li, task) {
    li.querySelector('.delete-btn').addEventListener('click', async () => {
        const response = await fetch(`http://localhost:3000/tasks/${task._id}`, { method: 'DELETE' });
        if (response.ok) li.remove();
        else console.error('Görev silinemedi:', response.statusText);
    });

    li.querySelector('.update-btn').addEventListener('click', () => {
        const editForm = li.querySelector('.edit-form');
        editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none'; // Kullanıcının tıklayıp tıklamamasına göre!
    });

    li.querySelector('.save-btn').addEventListener('click', async () => {
        const updatedTitle = li.querySelector('.edit-title').value;
        const updatedPriority = li.querySelector('.edit-priority').value;
    
        const updatedData = {
            title: updatedTitle,
            priority: updatedPriority,
            createdAt: new Date().toISOString() // Yeni oluşturulma tarihi
        };
    
        // Gönderilen veriyi logla
        console.log('Gönderilen veri:', updatedData);
    
        try {
            const response = await fetch(`http://localhost:3000/tasks/${task._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                const updatedTask = await response.json();
    
                // Backend'den gelen yanıtı logla
                console.log('Backend yanıtı:', updatedTask);
    
                addTaskToUI(updatedTask); // Güncellenmiş görevi yeniden ekle
            } else {
                console.error('Güncelleme işlemi başarısız:', response.statusText);
            }
        } catch (error) {
            console.error('Hata:', error.message);
        }
    });
    
    

    li.querySelector('.task-completed').addEventListener('change', async (e) => {
        const isCompleted = e.target.checked;
        const completedAt = isCompleted ? new Date().toISOString() : null;

        try {
            const response = await fetch(`http://localhost:3000/tasks/${task._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: isCompleted, completedAt }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                updateTaskStyles(li, updatedTask); // Hemen görünümü güncelle
            } else {
                console.error('Tamamlama durumu güncellenemedi:', response.statusText);
                e.target.checked = !isCompleted; // Hata durumunda kutucuk durumunu geri al
            }
        } catch (error) {
            console.error('Hata:', error.message);
            e.target.checked = !isCompleted; // Hata durumunda kutucuk durumunu geri al
        }
    });
}

// Filtreleme işlemi
document.getElementById('search-input').addEventListener('input', filterTasks);
document.getElementById('filter-priority').addEventListener('change', filterTasks);

function filterTasks() { 
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const selectedPriority = document.getElementById('filter-priority').value;
    // bu iki değişken öncelikle kullanıcının girdisini alır
    const tasks = document.querySelectorAll('li');

    tasks.forEach(task => { // bundan sonra alınan li ögeleri ile eşleştirme yapılır.
        const titleElement = task.querySelector('.task-content');
        const taskTitle = titleElement ? titleElement.textContent.toLowerCase() : '';
        const taskPriority = task.getAttribute('data-priority');

        const matchesSearch = !searchInput || taskTitle.includes(searchInput);
       // let matchesSearch;
        //if (!searchInput) {
       // matchesSearch = true; // Arama kutusu boşsa, eşleşme sağlanır
       //} //else {
      // matchesSearch = taskTitle.includes(searchInput); // Arama metni başlıkta geçiyorsa, eşleşme sağlanır
         //}

        const matchesPriority = selectedPriority === 'all' || taskPriority === selectedPriority;

        if (matchesSearch && matchesPriority) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
}

// Görevleri backend'den çekme
async function fetchTasks() {
    const response = await fetch('http://localhost:3000/tasks');
    if (response.ok) {
        const tasks = await response.json();
        tasks.forEach(addTaskToUI);
    } else {
        console.error('Görevler yüklenemedi:', response.statusText);
    }
}

// Görevleri başlat
fetchTasks();
