// src/articles/articles.controller.ts
import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request,
    HttpCode,
    HttpStatus,
    Query, // Added UseGuards, Request
    // ... other imports
  } from '@nestjs/common';
  import { ArticlesService } from './articles.service';
  import { CreateArticleDto } from './dto/create-articles.dto';
  import { UpdateArticleDto } from './dto/update-articles.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import JwtAuthGuard
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'; // Import ApiBearerAuth
  import { User } from '@prisma/client'; // Import User type
  
  // Define type for authenticated requests in this controller
  interface AuthenticatedRequest extends Request {
      user: Omit<User, 'password'>
  }
  
  @ApiTags('articles')
  @Controller('articles')
  export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}
  
    // Apply JwtAuthGuard to POST, PATCH, DELETE
    @UseGuards(JwtAuthGuard) // Protect this route
    @ApiBearerAuth()        // Document that it needs Bearer token
    @Post()
    @ApiOperation({ summary: 'Create a new article (Auth Required)' })
    @ApiResponse({ status: 201, description: 'Article created.'})
    @ApiResponse({ status: 401, description: 'Unauthorized.'})
    // Extract user from request (populated by JwtAuthGuard -> JwtStrategy)
    create(@Body() createArticleDto: CreateArticleDto, @Request() req: AuthenticatedRequest) {
      const userId = req.user.id; // Get user ID from the authenticated request
      return this.articlesService.create(createArticleDto, userId); // Pass userId to service
    }
  
    @Get()
    @ApiOperation({ summary: 'Get a list of all article titles (Public)' })
    findAll() {
      return this.articlesService.findAll();
    }
  
    @Get(':title')
    @ApiOperation({ summary: 'Get a specific article by title (Public)' })
    @ApiParam({ name: 'title', type: String, description: 'Normalized article title' })
    async findOne(@Param('title') title: string) {
      return this.articlesService.findOneByTitle(title);
    }
  
    @UseGuards(JwtAuthGuard) // Protect this route
    @ApiBearerAuth()        // Document it
    @Patch(':title')
    @ApiOperation({ summary: 'Update an article (Auth Required)' })
    @ApiParam({ name: 'title', type: String, description: 'Normalized article title' })
    @ApiResponse({ status: 200, description: 'Article updated.'})
    @ApiResponse({ status: 401, description: 'Unauthorized.'})
    @ApiResponse({ status: 404, description: 'Article not found.'})
    update(
      @Param('title') title: string,
      @Body() updateArticleDto: UpdateArticleDto,
      @Request() req: AuthenticatedRequest, // Get authenticated user
    ) {
      const userId = req.user.id;
      return this.articlesService.update(title, updateArticleDto, userId); // Pass userId
    }
  
    @UseGuards(JwtAuthGuard) // Protect this route
    @ApiBearerAuth()        // Document it
    @Delete(':title')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete an article (Auth Required)' })
    @ApiParam({ name: 'title', type: String, description: 'Normalized article title' })
    @ApiResponse({ status: 200, description: 'Article deleted.'})
    @ApiResponse({ status: 401, description: 'Unauthorized.'})
    @ApiResponse({ status: 404, description: 'Article not found.'})
    remove(@Param('title') title: string, @Request() req: AuthenticatedRequest) {
         // Optional: Check if user has permission to delete (e.g., is admin or original creator)
         // For now, any logged-in user can delete any article
         console.log(`User ${req.user.id} attempting to delete article ${title}`);
         return this.articlesService.remove(title);
    }
  
    @Get(':title/revisions')
    @ApiOperation({ summary: 'Get revision history for an article (Public)' })
    @ApiParam({ name: 'title', type: String, description: 'Normalized article title' })
    findRevisions(@Param('title') title: string) {
      return this.articlesService.findRevisions(title);
    }

    @Get('search/results') // Example route: /articles/search/results?q=...
    @ApiOperation({ summary: 'Search article content (full-text)' })
    @ApiResponse({ status: 200, description: 'Search results retrieved.'})
    search(@Query('q') query: string) {
      return this.articlesService.searchArticles(query);
    }
  
    // --- NEW: Title Suggestion Endpoint ---
     @Get('search/suggest') // Example route: /articles/search/suggest?q=...
    @ApiOperation({ summary: 'Suggest article titles based on query' })
    @ApiResponse({ status: 200, description: 'Title suggestions retrieved.'})
    suggest(@Query('q') query: string) {
      return this.articlesService.suggestTitles(query);
    }
  }