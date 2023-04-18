/* this function returns a list of ISBN numbers for any inputted title */
async function getISBNs(query) {
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    const data = await response.json();
    const isbnList = [];
    data.docs.forEach(book => {
      if (book.isbn) {
        book.isbn.forEach(isbn => {
          isbnList.push(isbn);
        });
      }
    });
    return isbnList;
  }

  /* this simply prints the list that was returned from getISBNs() */
  getISBNs('The Great Gatsby')
  .then(isbnList => {
    return getTitlesFromISBNs(isbnList);
  })
  .then(titleList => {
    console.log(titleList);
  })
  .catch(error => {
    console.error(error);
  });

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
  
  /* this function uses the api/books call in order to retreive more information about the book
    some information may not be retrievable such as page count and will just return "undefined" but the rest of the information will be returned 
    
    This function also lists the first 10 results of the isbn list the is inputted as the call can be slow,
    most likely we will only use this call for a single isbn number anyways*/
  async function getBookDetailsFromISBNs(isbnList) {
    const bookList = [];
    for (const isbn of isbnList) {
      if (bookList.length >= 10) {
        break; // Stop iterating once we have 10 books
      }
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
      const data = await response.json();
      const book = data[`ISBN:${isbn}`];
      if (book) {
        const { title, authors, publish_date, number_of_pages, cover } = book;
        const coverUrl = cover?.medium || cover?.large || cover?.small;
        bookList.push({ title, authors, publish_date, number_of_pages, coverUrl });
      }
    }
    return bookList;
  }

  /*this just calls the getISBNs function to retrieve a list of all ISBN numbers from a given input and then uses the list to get
  more specific information about the books --> again only the first 10 isbn numbers in the list will be used for this example*/
  getISBNs('Harry Potter')
  .then(isbnList => {
    return getBookDetailsFromISBNs(isbnList);
  })
  .then(bookList => {
    console.log(bookList);
  })
  .catch(error => {
    console.error(error);
  });

  /* one example output for this:

  {
  authors: [{
  name: "J. K. Rowling",
  url: "https://openlibrary.org/authors/OL23919A/J._K._Rowling"
}],
  coverUrl: "https://covers.openlibrary.org/b/id/8267749-M.jpg",
  number_of_pages: 309,
  publish_date: "2000 November",
  title: "Harry Potter and the Sorcerer's stone"
}

*/