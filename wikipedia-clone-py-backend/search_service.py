# search_service.py
import os
from typing import List, Dict, Any, Optional
from meilisearch import Client
from meilisearch.index import Index
import asyncio
from supabase_client import supabase

class MeiliSearchService:
    def __init__(self):
        # MeiliSearch configuration
        self.meili_url = os.getenv("MEILI_URL", "http://localhost:7700")
        self.meili_key = os.getenv("MEILI_MASTER_KEY", "masterKey")
        
        # Initialize MeiliSearch client
        self.client = Client(self.meili_url, self.meili_key)
        self.articles_index = "articles"
        self.books_index = "books"
        
    async def initialize_indexes(self):
        """Initialize MeiliSearch indexes with proper settings"""
        try:
            # Create articles index
            articles_index = self.client.index(self.articles_index)
            
            # Configure articles index settings
            articles_index.update_settings({
                'searchableAttributes': ['title', 'content', 'summary', 'tags'],
                'filterableAttributes': ['category', 'author', 'created_at', 'updated_at'],
                'sortableAttributes': ['created_at', 'updated_at', 'title'],
                'rankingRules': [
                    'words',
                    'typo',
                    'proximity',
                    'attribute',
                    'sort',
                    'exactness'
                ],
                'stopWords': ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
                'synonyms': {
                    'africa': ['african', 'africans'],
                    'history': ['historical', 'historic'],
                    'culture': ['cultural', 'cultures'],
                    'music': ['musical', 'musician'],
                    'art': ['arts', 'artistic', 'artist'],
                    'tradition': ['traditional', 'traditions'],
                    'civilization': ['civilizations', 'civilized'],
                    'empire': ['empires', 'imperial'],
                    'kingdom': ['kingdoms', 'royal'],
                    'religion': ['religious', 'spiritual'],
                    'language': ['languages', 'linguistic'],
                    'dance': ['dancing', 'dances'],
                    'festival': ['festivals', 'celebration'],
                    'tribe': ['tribes', 'tribal'],
                    'village': ['villages', 'rural'],
                    'city': ['cities', 'urban'],
                    'ancient': ['old', 'historic', 'classical'],
                    'modern': ['contemporary', 'current', 'present'],
                    'traditional': ['classic', 'conventional', 'customary']
                },
                'typoTolerance': {
                    'enabled': True,
                    'minWordSizeForTypos': {
                        'oneTypo': 4,
                        'twoTypos': 8
                    },
                    'disableOnAttributes': ['id']
                },
                'pagination': {
                    'maxTotalHits': 1000
                }
            })
            
            # Create books index
            books_index = self.client.index(self.books_index)
            
            # Configure books index settings
            books_index.update_settings({
                'searchableAttributes': ['title', 'description', 'author', 'tags'],
                'filterableAttributes': ['category', 'author', 'created_at', 'updated_at'],
                'sortableAttributes': ['created_at', 'updated_at', 'title'],
                'rankingRules': [
                    'words',
                    'typo',
                    'proximity',
                    'attribute',
                    'sort',
                    'exactness'
                ],
                'stopWords': ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
                'typoTolerance': {
                    'enabled': True,
                    'minWordSizeForTypos': {
                        'oneTypo': 4,
                        'twoTypos': 8
                    },
                    'disableOnAttributes': ['id']
                }
            })
            
            print("✅ MeiliSearch indexes initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing MeiliSearch indexes: {e}")
            return False
    
    async def index_articles(self):
        """Index all articles from Supabase to MeiliSearch"""
        try:
            # Get all articles with simplified query
            result = supabase.table("article").select("id, title, created_at, updated_at").execute()
            
            articles = result.data or []
            if not articles:
                print("No articles found to index")
                return False
            
            # Transform articles for MeiliSearch
            documents = []
            for article in articles:
                title = article.get('title', '').replace('_', ' ')
                
                # Create searchable document with basic info
                doc = {
                    'id': article['id'],
                    'title': title,
                    'content': f"Article about {title}",  # Placeholder content
                    'summary': f"Learn about {title} in this comprehensive article.",
                    'author': 'Afropedia Community',
                    'created_at': article.get('created_at'),
                    'updated_at': article.get('updated_at'),
                    'category': 'article',
                    'tags': self._extract_tags(title, '')
                }
                documents.append(doc)
            
            # Index documents
            articles_index = self.client.index(self.articles_index)
            articles_index.add_documents(documents)
            
            print(f"✅ Indexed {len(documents)} articles to MeiliSearch")
            return True
            
        except Exception as e:
            print(f"❌ Error indexing articles: {e}")
            return False
    
    async def index_books(self):
        """Index all books from Supabase to MeiliSearch"""
        try:
            # Get all books
            result = supabase.table("book").select("*").execute()
            
            books = result.data or []
            if not books:
                print("No books found to index")
                return False
            
            # Transform books for MeiliSearch
            documents = []
            for book in books:
                doc = {
                    'id': book['id'],
                    'title': book.get('title', ''),
                    'description': book.get('description', ''),
                    'author': book.get('author', 'Unknown'),
                    'created_at': book.get('created_at'),
                    'updated_at': book.get('updated_at'),
                    'category': 'book',
                    'tags': self._extract_tags(book.get('title', ''), book.get('description', ''))
                }
                documents.append(doc)
            
            # Index documents
            books_index = self.client.index(self.books_index)
            books_index.add_documents(documents)
            
            print(f"✅ Indexed {len(documents)} books to MeiliSearch")
            return True
            
        except Exception as e:
            print(f"❌ Error indexing books: {e}")
            return False
    
    def _extract_tags(self, title: str, content: str) -> List[str]:
        """Extract relevant tags from title and content"""
        # Simple tag extraction - you can make this more sophisticated
        text = f"{title} {content}".lower()
        
        # Common African/encyclopedia related terms
        keywords = [
            'africa', 'african', 'history', 'culture', 'tradition', 'music', 'art',
            'civilization', 'empire', 'kingdom', 'religion', 'language', 'dance',
            'festival', 'tribe', 'village', 'city', 'ancient', 'modern', 'traditional',
            'mandela', 'timbuktu', 'egypt', 'nubia', 'mali', 'ghana', 'songhai',
            'zulu', 'yoruba', 'igbo', 'hausa', 'swahili', 'amharic', 'bantu'
        ]
        
        found_tags = []
        for keyword in keywords:
            if keyword in text:
                found_tags.append(keyword)
        
        return found_tags[:10]  # Limit to 10 tags
    
    async def search_articles(self, query: str, limit: int = 20, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Search articles using MeiliSearch"""
        try:
            articles_index = self.client.index(self.articles_index)
            
            search_params = {
                'limit': limit,
                'attributesToRetrieve': ['id', 'title', 'summary', 'author', 'created_at', 'updated_at', 'tags'],
                'attributesToHighlight': ['title', 'summary'],
                'highlightPreTag': '<mark>',
                'highlightPostTag': '</mark>'
            }
            
            if filters:
                search_params['filter'] = self._build_filter(filters)
            
            results = articles_index.search(query, search_params)
            
            return {
                'hits': results.get('hits', []),
                'totalHits': results.get('estimatedTotalHits', 0),
                'query': query,
                'processingTimeMs': results.get('processingTimeMs', 0)
            }
            
        except Exception as e:
            print(f"❌ Error searching articles: {e}")
            return {'hits': [], 'totalHits': 0, 'query': query, 'processingTimeMs': 0}
    
    async def search_books(self, query: str, limit: int = 20, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Search books using MeiliSearch"""
        try:
            books_index = self.client.index(self.books_index)
            
            search_params = {
                'limit': limit,
                'attributesToRetrieve': ['id', 'title', 'description', 'author', 'created_at', 'updated_at', 'tags'],
                'attributesToHighlight': ['title', 'description'],
                'highlightPreTag': '<mark>',
                'highlightPostTag': '</mark>'
            }
            
            if filters:
                search_params['filter'] = self._build_filter(filters)
            
            results = books_index.search(query, search_params)
            
            return {
                'hits': results.get('hits', []),
                'totalHits': results.get('estimatedTotalHits', 0),
                'query': query,
                'processingTimeMs': results.get('processingTimeMs', 0)
            }
            
        except Exception as e:
            print(f"❌ Error searching books: {e}")
            return {'hits': [], 'totalHits': 0, 'query': query, 'processingTimeMs': 0}
    
    async def get_suggestions(self, query: str, limit: int = 10) -> List[str]:
        """Get search suggestions based on query"""
        try:
            # Search for partial matches in titles
            articles_index = self.client.index(self.articles_index)
            
            search_params = {
                'limit': limit,
                'attributesToRetrieve': ['title'],
                'attributesToHighlight': ['title']
            }
            
            results = articles_index.search(query, search_params)
            
            suggestions = []
            for hit in results.get('hits', []):
                title = hit.get('title', '')
                if title and title not in suggestions:
                    suggestions.append(title)
            
            return suggestions[:limit]
            
        except Exception as e:
            print(f"❌ Error getting suggestions: {e}")
            return []
    
    def _build_filter(self, filters: Dict) -> str:
        """Build MeiliSearch filter string from filters dict"""
        filter_parts = []
        
        for key, value in filters.items():
            if value is None:
                continue
            if isinstance(value, list):
                # Format list values properly for MeiliSearch
                value_list = [f'"{v}"' for v in value]
                filter_parts.append(f"{key} IN [{', '.join(value_list)}]")
            else:
                # Format string values with quotes
                filter_parts.append(f'{key} = "{value}"')
        
        return " AND ".join(filter_parts)

# Global instance
search_service = MeiliSearchService()
