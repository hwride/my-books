import { Book } from '@prisma/client';

export type BookListBook = Pick<Book, 'id' | 'title' | 'author'>;
export function BookList({books}: {books: BookListBook[]}) {
  return <ul>
    {books.map(book =>
      <li key={book.title} className='p-4'>
        <div className='text-lg'>{book.title}</div>
        <div className='text-gray-400'>by {book.author}</div>
      </li>
    )}
  </ul>
}
