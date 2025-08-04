import { Client, Databases, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);
const database = new Databases(client);

export const updatesearchCount = async (searchTerm, movie) => {
    try {
        // Check if the search term exists
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('searchTerm', searchTerm)]
        );
        if (result.documents.length > 0) {
            // Increment count
            const doc = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,
                { count: (doc.count || 0) + 1 }
            );
        } else {
            // Create new document
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm,
                    count: 1,
                    movie_id: movie?.id || null,
                    poster_url: movie?.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : null
                }
            );
        }

    } catch (error) {
        console.error('Error updating search count:', error);
    }
}