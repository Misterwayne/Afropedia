
export interface Book {
    id: number;
    title: string;
    author: string;
    publication_date?: string | null; // Use string for date transfer, format on display
    description?: string | null;
    cover_image?: string | null;
    isbn?: string | null;
    created_at: string;
    updated_at: string;
}

