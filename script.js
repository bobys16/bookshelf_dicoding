
const addBookForm = document.getElementById('add-book-form');
const searchBookForm = document.getElementById('search-book-form');
const unfinishedShelf = document.getElementById('unfinished-shelf');
const finishedShelf = document.getElementById('finished-shelf');
const totalBooksCounter = document.getElementById('total-books');
const readBooksCounter = document.getElementById('read-books');
const unreadBooksCounter = document.getElementById('unread-books');
const searchResultDiv = document.getElementById('search-result');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteButton = document.getElementById('confirmDelete');
const cancelDeleteButton = document.getElementById('cancelDelete');
let currentBookIdToDelete;

function getBooksFromLocalStorage() {
  return JSON.parse(localStorage.getItem('books')) || [];
}

function saveBooksToLocalStorage(books) {
  localStorage.setItem('books', JSON.stringify(books));
}

function updateBookCounters() {
  const books = getBooksFromLocalStorage();
  const totalBooks = books.length;
  const readBooks = books.filter(book => book.isComplete).length;
  const unreadBooks = totalBooks - readBooks;
  totalBooksCounter.textContent = totalBooks;
  readBooksCounter.textContent = readBooks;
  unreadBooksCounter.textContent = unreadBooks;
}

function addBookToShelf(book) {
  const shelf = book.isComplete ? finishedShelf : unfinishedShelf;
  const bookDiv = document.createElement('div');
  bookDiv.classList.add('book');
  bookDiv.id = book.id;
  bookDiv.innerHTML = `
    <p id="judul"><strong>Judul:</strong> ${book.title}</p>
    <p id="penulis"><strong>Penulis:</strong> ${book.author}</p>
    <p><strong>Tahun:</strong> ${book.year}</p>
    <button class="delete-button" onclick="openDeleteModal(${book.id})">Delete</button>
    <button class="${book.isComplete ? 'unread-button' : 'read-button'}" onclick="toggleReadStatus(${book.id}, ${book.isComplete})">${book.isComplete ? 'Unread' : 'Read'}</button>
  `;
  shelf.appendChild(bookDiv);
  updateBookCounters();
}

function addBook(event) {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = parseInt(document.getElementById('year').value);
  const status = document.getElementById('status').value === 'true';

  const newBook = {
    id: new Date().getTime(),
    title: title,
    author: author,
    year: year,
    isComplete: status
  };

  const books = getBooksFromLocalStorage();
  books.push(newBook);
  saveBooksToLocalStorage(books);
  addBookToShelf(newBook);
  addBookForm.reset();
}

function openDeleteModal(bookId) {
  currentBookIdToDelete = bookId;
  deleteModal.style.display = 'block';
}

function closeDeleteModal() {
  deleteModal.style.display = 'none';
}

function confirmDelete() {
  deleteBook(currentBookIdToDelete);
  closeDeleteModal();
}

function deleteBook(bookId) {
  const bookToRemove = document.getElementById(bookId);
  bookToRemove.parentNode.removeChild(bookToRemove);
  const books = getBooksFromLocalStorage();
  const updatedBooks = books.filter(book => book.id !== bookId);
  saveBooksToLocalStorage(updatedBooks);
  updateBookCounters();
}

function toggleReadStatus(bookId, isComplete) {
  const bookToMove = document.getElementById(bookId);
  const destinationShelf = isComplete ? unfinishedShelf : finishedShelf;
  destinationShelf.appendChild(bookToMove);

  const books = getBooksFromLocalStorage();
  const bookIndex = books.findIndex(book => book.id == bookId);
  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !isComplete;
    saveBooksToLocalStorage(books);
  }

  const buttons = bookToMove.querySelectorAll('button');
  const readButton = buttons[1];
  readButton.textContent = isComplete ? 'Read' : 'Unread';
  readButton.setAttribute('onclick', `toggleReadStatus(${bookId}, ${!isComplete})`);

  updateBookCounters();
}

function searchBook(event) {
  event.preventDefault();
  const searchTerm = document.getElementById('search-title').value.toLowerCase();
  const allBooks = document.querySelectorAll('.book');
  const searchResult = [];

  allBooks.forEach(book => {
    const title = book.querySelector('p#judul').innerText.toLowerCase();
    if (title.includes(searchTerm)) {
      const bookInfo = document.createElement('div');
      bookInfo.classList.add('book');
      bookInfo.innerHTML = book.innerHTML;
      const buttons = bookInfo.querySelectorAll('button');
      buttons.forEach(button => button.remove());
      searchResult.push(bookInfo);
    }
  });

  searchResultDiv.innerHTML = '';
  if (searchResult.length > 0) {
    const searchResultTitle = document.createElement('h2');
    searchResultTitle.textContent = 'Hasil Pencarian';
    searchResultDiv.appendChild(searchResultTitle);
    searchResult.forEach(book => {
      searchResultDiv.appendChild(book);
    });
  } else {
    const noResult = document.createElement('p');
    noResult.textContent = 'Tidak ada hasil pencarian.';
    searchResultDiv.appendChild(noResult);
  }
}

function initializeBookshelf() {
  const books = getBooksFromLocalStorage();
  books.forEach(book => addBookToShelf(book));
  updateBookCounters();
}

initializeBookshelf();

addBookForm.addEventListener('submit', addBook);
searchBookForm.addEventListener('submit', searchBook);
confirmDeleteButton.addEventListener('click', confirmDelete);
cancelDeleteButton.addEventListener('click', closeDeleteModal);