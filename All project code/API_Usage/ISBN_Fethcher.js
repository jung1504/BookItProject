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