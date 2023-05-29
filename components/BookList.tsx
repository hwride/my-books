
export type Book = {
  title: string;
  author: string;
}
export function BookList({books}: {books: Book[]}) {
  return <ul>
    {books.map(book =>
      <li key={book.title} className='p-4'>
        <div className='text-lg'>{book.title}</div>
        <div className='text-gray-400'>by {book.author}</div>
      </li>
    )}
  </ul>
}
