document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('export-button');
    const importButton = document.getElementById('import-button');
    const deleteButton = document.getElementById('delete-button');
    const restoreButton = document.getElementById('restore-button');
    const statusElement = document.getElementById('status');

    if ('serviceWorker' in navigator) {
        console.log('Service Worker is supported by the browser');
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    } else {
        console.warn('Service Worker is not supported by the browser');
    }
    
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt event fired'); // Проверка, что событие сработало
        e.preventDefault();
        deferredPrompt = e;
        const installButton = document.getElementById('installButton');
        
        if (installButton) {
            console.log('Install button found'); // Проверка наличия кнопки
            installButton.style.display = 'block';
        } else {
            console.log('Install button not found'); // Кнопка не найдена в DOM
        }
    
        installButton.addEventListener('click', () => {
            console.log('Install button clicked'); // Проверка клика по кнопке
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        });
    });
    
    // Optional: Handle app installed event
    window.addEventListener('appinstalled', (event) => {
        console.log('App was installed.', event);
    });
    
    
    
    // Остальной код для работы с IndexedDB, экспортом и импортом данных
    
    exportButton.addEventListener('click', () => {
        exportPosts().then(posts => {
            sendPostsToServer(posts);
        }).catch(error => {
            console.error('Error exporting posts:', error);
            statusElement.textContent = 'Error exporting posts';
        });
    });

  //  importButton.addEventListener('click', () => {
  //      importPostsFromServer();
  //  });

    deleteButton.addEventListener('click', () => {
        deleteDatabase().then(() => {
            statusElement.textContent = 'Database deleted successfully';
        }).catch(error => {
            console.error('Error deleting database:', error);
            statusElement.textContent = 'Error deleting database';
        });
    });

    restoreButton.addEventListener('click', () => {
        restorePostsFromFile().then(() => {
            statusElement.textContent = 'Data restored successfully';
        }).catch(error => {
            console.error('Error restoring data:', error);
            statusElement.textContent = 'Error restoring data';
        });
    });

    function exportPosts() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('postsDB', 1);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['posts'], 'readonly');
                const store = transaction.objectStore('posts');
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                getAllRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    function sendPostsToServer(posts) {
        fetch(' https://4221-31-14-75-35.ngrok-free.app/api/posts/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(posts)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data sent successfully:', data);
            statusElement.textContent = 'Data sent successfully';
        })
        .catch(error => {
            console.error('Error sending data:', error);
            statusElement.textContent = 'Error sending data';
        });
    }

    function importPostsFromServer() {
        fetch(' https://4221-31-14-75-35.ngrok-free.app/api/posts')
            .then(response => response.json())
            .then(posts => {
                const request = indexedDB.open('postsDB', 1);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['posts'], 'readwrite');
                    const store = transaction.objectStore('posts');
                    
                    posts.forEach(post => {
                        store.put(post);
                    });

                    console.log('Data imported successfully');
                    statusElement.textContent = 'Data imported successfully';
                };

                request.onerror = (event) => {
                    console.error('Error importing data:', event.target.error);
                    statusElement.textContent = 'Error importing data';
                };
            })
            .catch(error => {
                console.error('Error fetching data from server:', error);
                statusElement.textContent = 'Error fetching data from server';
            });
    }

    function deleteDatabase() {
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase('postsDB');

            deleteRequest.onsuccess = () => {
                resolve();
            };

            deleteRequest.onerror = (event) => {
                reject(event.target.error);
            };

            deleteRequest.onblocked = () => {
                console.warn('Delete request is blocked');
            };
        });
    }

   async function restorePostsFromFile() {
        return new Promise((resolve, reject) => {
            fetch(' https://4221-31-14-75-35.ngrok-free.app/api/posts/restore') //для мобилки
                .then(response => response.json())
                .then(posts => {
                    const request = indexedDB.open('postsDB', 1);
                    request.onsuccess = (event) => {
                        const db = event.target.result;
                        const transaction = db.transaction(['posts'], 'readwrite');
                        const store = transaction.objectStore('posts');
                        
                        posts.forEach(post => {
                            store.put(post);
                        });

                        console.log('Data restored successfully');
                        statusElement.textContent = 'Data redtored successfully';
                        resolve();
                    };

                    request.onerror = (event) => {
                        console.error('Error restoring data:', event.target.error);
                        reject(event.target.error);
                        statusElement.textContent = 'Error to restore Data from json';
                    };
                })
                .catch(error => {
                    console.error('Error fetching data from server:', error);
                    reject(error);
                });
        });
    }
});
