// src/articles/articles.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-articles.dto';
import { UpdateArticleDto } from './dto/update-articles.dto';
import { Article, PrismaClient, Revision } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaClient) {}

  private async generateTsVector(content: string): Promise<any | null> {
    try {
        // FIX: Ensure the type argument is correctly applied.
        // If TS2347 persists, it might be a deeper config issue,
        // but this structure is generally correct.
        const result = await this.prisma.$queryRawUnsafe<{ tsvector: any }[]>(
            `SELECT to_tsvector('english', $1) as tsvector`,
            content
        );
        // FIX: Return null instead of Prisma.DbNull
        return result[0]?.tsvector || null;
    } catch (error) {
        console.error("Failed to generate tsvector:", error);
        // FIX: Return null instead of Prisma.DbNull
        return null;
    }
  }

  private normalizeTitle(title: string): string {
    return title.trim().replace(/\s+/g, '_');
  }

  // --- CREATE (Now accepts userId) ---
  async create(createArticleDto: CreateArticleDto, userId: number ): Promise<Article> { // Added userId parameter
    const normalizedTitle = this.normalizeTitle(createArticleDto.title);
    const existingArticle = await this.prisma.article.findUnique({
      where: { title: normalizedTitle },
    });
    if (existingArticle) {
      throw new ConflictException(`Article with title "${normalizedTitle}" already exists.`);
    }

    try {
        const tsvector = await this.generateTsVector(createArticleDto.content); // Now returns Promise<any | null>
        const newArticle = await this.prisma.$transaction(async (tx) => {
          // Cast 'tx' to PrismaClient if needed for type safety within transaction
          const transactionClient = tx as PrismaClient;
  
          const article = await transactionClient.article.create({ data: { title: normalizedTitle } });
          const revisionData = {
            content: createArticleDto.content,
            comment: createArticleDto.comment,
            articleId: article.id,
            userId: userId,
            tsvector_content: tsvector, // Assign the 'any' or 'null' value
          };
          const revision = await transactionClient.revision.create({
            // Keep 'as any' because tsvector_content is Unsupported
            data: revisionData as any,
          });
          const updatedArticle = await transactionClient.article.update({
              where: { id: article.id },
              data: { currentRevisionId: revision.id },
              include: { currentRevision: { include: { user: { select: { id: true, username: true }} }} },
             });
          return updatedArticle;
        });
        return newArticle;
      } catch (error) {
        console.error("Transaction failed in create:", error);
        // Re-throw specific errors or a generic one
        if (error instanceof ConflictException) throw error;
        if (error instanceof NotFoundException) throw error; // Should not happen here but good practice
        throw new InternalServerErrorException('Failed to create article.'); // Use NestJS exception
      }
  }

  // --- READ (All) - No change needed ---
   async findAll(): Promise<Omit<Article, 'currentRevisionId'>[]> {
        return this.prisma.article.findMany({
            select: { id: true, title: true, createdAt: true, updatedAt: true }
        });
   }

  // --- READ (One by Title) - Include user in revision ---
    async findOneByTitle(title: string): Promise<Article & { currentRevision: (Revision & { user: { id: number; username: string } | null }) | null }> {
        const normalizedTitle = this.normalizeTitle(title);
        const article = await this.prisma.article.findUnique({
        where: { title: normalizedTitle },
        include: {
            currentRevision: {
                include: {
                    user: { // Include user details for the current revision
                        select: { id: true, username: true }
                    }
                }
            },
        },
        });

        if (!article) {
        throw new NotFoundException(`Article with title "${normalizedTitle}" not found.`);
        }
        // Type assertion might be needed if TS struggles with the nested include structure
        return article as Article & { currentRevision: (Revision & { user: { id: number; username: string } | null }) | null };
    }


  // --- UPDATE (Now accepts userId) ---
  async update(title: string, updateArticleDto: UpdateArticleDto, userId: number): Promise<Article> { // Added userId parameter
    const normalizedTitle = this.normalizeTitle(title);
    try {
        const tsvector = await this.generateTsVector(updateArticleDto.content); // Now returns Promise<any | null>
        const updatedArticle = await this.prisma.$transaction(async (tx) => {
           // Cast 'tx' to PrismaClient if needed
           const transactionClient = tx as PrismaClient;
 
           const article = await transactionClient.article.findUnique({ where: { title: normalizedTitle } });
           if (!article) { throw new NotFoundException(`Article with title "${normalizedTitle}" not found.`); }
 
           const revisionData = {
              content: updateArticleDto.content,
              comment: updateArticleDto.comment,
              articleId: article.id,
              userId: userId,
              tsvector_content: tsvector, // Assign the 'any' or 'null' value
           };
           const newRevision = await transactionClient.revision.create({
              // Keep 'as any' because tsvector_content is Unsupported
              data: revisionData as any,
           });
           const newlyUpdatedArticle = await transactionClient.article.update({
              where: { id: article.id },
              data: { currentRevisionId: newRevision.id },
              include: { currentRevision: { include: { user: { select: { id: true, username: true }} }} },
           });
           return newlyUpdatedArticle;
        });
        return updatedArticle;
     } catch (error) {
       console.error("Transaction failed in update:", error);
        // Re-throw specific errors or a generic one
       if (error instanceof ConflictException) throw error; // Should not happen here
       if (error instanceof NotFoundException) throw error;
       throw new InternalServerErrorException('Failed to update article.'); // Use NestJS exception
     }
  }

  // --- DELETE - No change needed for userId, but consider adding authorization checks ---
  async remove(title: string): Promise<{ message: string }> {
    const normalizedTitle = this.normalizeTitle(title);
    // Optional: Add authorization check here - does the requesting user have permission?
    try {
      await this.prisma.$transaction(async (tx) => {
        const article = await tx.article.findUnique({ where: { title: normalizedTitle }, select: { id: true } });
        if (!article) { throw new NotFoundException(`Article with title "${normalizedTitle}" not found.`); }
        await tx.article.delete({ where: { title: normalizedTitle } });
      });
      return { message: `Article "${normalizedTitle}" deleted successfully.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error("Deletion failed:", error);
      throw new Error(`Failed to delete article "${normalizedTitle}".`);
    }
  }

  // --- READ Revisions - (user info already included) ---
  async findRevisions(title: string): Promise<Revision[]> {
    const normalizedTitle = this.normalizeTitle(title);
    const article = await this.prisma.article.findUnique({ where: { title: normalizedTitle }, select: { id: true } });
    if (!article) { throw new NotFoundException(`Article with title "${normalizedTitle}" not found.`); }
    return this.prisma.revision.findMany({
      where: { articleId: article.id },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, username: true } } },
    });
  }

  async searchArticles(query: string): Promise<{ id: number; title: string; rank: number; snippet?: string }[]> {
    if (!query?.trim()) {
        return [];
    }

    // Use websearch_to_tsquery for more user-friendly query parsing (handles operators like OR, -, quotes)
    // Parameterize the query text itself for safety against SQL injection in the query term.
    const searchQuery = query.trim();

    // Find articles whose *current* revision's tsvector matches the query
    // Requires joining Article -> Revision where Revision.id = Article.currentRevisionId
    const results = await this.prisma.$queryRaw<
        { id: number; title: string; rank: number; snippet: string }[]
    >`
        SELECT
            a.id,
            a.title,
            ts_rank_cd(r.tsvector_content, websearch_to_tsquery('english', ${searchQuery})) AS rank,
            ts_headline('english', r.content, websearch_to_tsquery('english', ${searchQuery}),
                'StartSel=**,StopSel=**,MaxWords=35,MinWords=15,HighlightAll=FALSE,MaxFragments=3') AS snippet
        FROM "Article" AS a
        INNER JOIN "Revision" AS r ON a."currentRevisionId" = r.id
        WHERE r.tsvector_content @@ websearch_to_tsquery('english', ${searchQuery})
        ORDER BY rank DESC
        LIMIT 20; -- Add pagination later
    `;

    // Return results sorted by rank (higher is better)
    return results;
   }

   // --- NEW: Title Suggestion Service Method ---
   async suggestTitles(query: string): Promise<{ title: string }[]> {
      if (!query?.trim() || query.length < 2) { // Don't suggest for very short queries
         return [];
      }
      const normalizedQuery = query.trim().replace(/\s+/g, '_'); // Normalize query similar to titles

      const results = await this.prisma.article.findMany({
         where: {
            title: {
               startsWith: normalizedQuery,
               mode: 'insensitive', // Case-insensitive search
            },
         },
         select: { title: true },
         take: 10, // Limit number of suggestions
         orderBy: {
            title: 'asc', // Alphabetical order
         }
      });
      return results;
   }
}