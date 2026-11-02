import { books } from '#site-books'

// Prerenderizzato nel payload della home: la lista dei libri non pesa sul bundle JS.
export default defineEventHandler(() => books)
