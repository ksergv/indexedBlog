// app.js
document.addEventListener('DOMContentLoaded', () => {
    let db;

    const request = indexedDB.open('postsDB', 1);

    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('posts')) {
            db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = (e) => {
        console.log('IndexedDB opened successfully on iPhone');
        db = e.target.result;
        loadPosts();
    };

    request.onerror = (e) => {
        console.error('Error opening IndexedDB on iPhone:', e.target.error);
    };

    document.getElementById('post-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('post-id').value;
        const category = document.getElementById('category').value;
        const title = document.getElementById('title').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const profileName = document.getElementById('profile-name').value;
        const content = document.getElementById('content').value;
        const image = document.getElementById('image').value;
       

        const post = {
            category,
            title,
            date,
            description,
            profileName,
            content,
            image,
        };

        if (id) {
            updatePost(parseInt(id), post);
        } else {
            savePost(post);
        }

        document.getElementById('post-form').reset();
        document.getElementById('post-id').value = '';
        document.getElementById('form-container').style.display = 'none';
    });

    document.getElementById('load-posts').addEventListener('click', loadPosts);

    document.getElementById('new-post-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('form-container').style.display = 'block';
    });

    function savePost(post) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        const request = store.add(post);

        request.onsuccess = () => {
            console.log('Post saved successfully');
            loadPosts();
        };

        request.onerror = (e) => {
            console.error('Error saving post:', e);
        };
    }

    function updatePost(id, updatedPost) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        const request = store.put({ ...updatedPost, id });

        request.onsuccess = () => {
            console.log('Post updated successfully');
            loadPosts();
        };

        request.onerror = (e) => {
            console.error('Error updating post:', e);
        };
    }

    function loadPosts() {
        const transaction = db.transaction(['posts'], 'readonly');
        const store = transaction.objectStore('posts');
        const request = store.getAll();

        request.onsuccess = (e) => {
            const posts = e.target.result;
            const postsList = document.getElementById('posts-list');
            postsList.innerHTML = '';

            posts.forEach(post => {
                const postBox = document.createElement('div');
                postBox.className = `post-box ${post.category.toLowerCase()}`;
                var shortenedContent = `${post.description.slice(0, 200)}`;
                postBox.innerHTML = `
                <img src="img/${post.image}" alt="" class="post-img">
                <h2 class="category">${post.category}</h2>
                <a href="#" class="post-title">${post.title}</a>
                <span class="post-date">${post.date}</span>
                <p class="post-description">${shortenedContent}</p>
                <div class="profile">
                <img src="img/profile.jpg" alt="" class="profile-img">
                    <span class="profile-name">${post.profileName}</span>
                </div>
                <div class="post-buttons">
                    <button onclick="editPost(${post.id})">Редактировать</button>
                    <button style="background-color: red" onclick="deletePost(${post.id})">Удалить</button>
                    <button style="background-color: green" onclick="viewPost(${post.id})">Посмотреть</button>
                </div>
            `;

                postsList.appendChild(postBox);
            });

            // Обновите фильтрацию после загрузки постов
            setupFilters();
        };

        request.onerror = (e) => {
            console.error('Error loading posts:', e);
        };
    }

    // Пример функции для проверки аутентификации (зависит от вашей реализации)
function isAuthenticated() {
    // Возвращает true, если пользователь аутентифицирован, и false в противном случае
    // Пример: return sessionStorage.getItem('authenticated') === 'true';    
    return sessionStorage.getItem('authenticated') === 'true';
}

    window.editPost = function (id) {
        sessionStorage.setItem('authenticated', 'false');
        // Проверка аутентификации
    if (!isAuthenticated()) {
        // Перенаправление на страницу входа
     // Перенаправление на страницу входа с параметром возврата
     window.location.href = 'login.html?redirect=editPost&id=' + encodeURIComponent(id);
     return;
    }
        const transaction = db.transaction(['posts'], 'readonly');
        const store = transaction.objectStore('posts');
        const request = store.get(id);

        request.onsuccess = (e) => {
            const post = e.target.result;
            document.getElementById('post-id').value = post.id;
            document.getElementById('category').value = post.category;
            document.getElementById('title').value = post.title;
            document.getElementById('date').value = post.date;
            document.getElementById('description').value = post.description;
            document.getElementById('profile-name').value = post.profileName;
            document.getElementById('content').value = post.content;
            document.getElementById('image').value = post.image;
            document.getElementById('form-container').style.display = 'block';
        };

        request.onerror = (e) => {
            console.error('Error fetching post for editing:', e);
        };
    };

    window.deletePost = function (id) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log('Post deleted successfully');
            loadPosts();
        };

        request.onerror = (e) => {
            console.error('Error deleting post:', e);
        };
    };

    window.viewPost = function (id) {
        const transaction = db.transaction(['posts'], 'readonly');
        const store = transaction.objectStore('posts');
        const request = store.get(id);

        request.onsuccess = (e) => {
            const post = e.target.result;
            localStorage.setItem('viewedPost', JSON.stringify(post));
            window.location.href = 'post-page.html';
        };

        request.onerror = (e) => {
            console.error('Error fetching post for viewing:', e);
        };
    };

    function setupFilters() {
        $(".filter-item").click(function () {
            const value = $(this).attr("data-filter");
            if (value == "all") {
                $(".post-box").show("1000");
            } else {
                $(".post-box").not("." + value).hide("1000");
                $(".post-box").filter("." + value).show("1000");
            }
            $(this).addClass("active-filter").siblings().removeClass("active-filter");
        });
    }
});
