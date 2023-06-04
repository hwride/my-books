import { Book } from '@prisma/client'

export type BookListBook = Pick<Book, 'id' | 'title' | 'author'>
export function BookList({ books }: { books: BookListBook[] }) {
  return (
    <>
      <ul>
        {books.map((book) => (
          <li key={book.title} className="p-4">
            <div className="text-lg">{book.title}</div>
            <div className="text-gray-400">by {book.author}</div>
          </li>
        ))}
      </ul>
      <AddBook />
    </>
  )
}

function AddBook() {
  return (
    <form action="/api/book" method="post">
      <div className="border border-gray-100 p-2">
        <label className="block">
          Title
          <input
            name="title"
            type="text"
            required
            minLength={1}
            className="border border-gray-100"
          />
        </label>
        <label className="block">
          Author
          <input
            name="author"
            type="text"
            required
            className="border border-gray-100"
          />
        </label>
        <button className="mt-2 rounded-full bg-black px-2 py-1 text-white">
          Add book
        </button>
      </div>
    </form>
  )
}
