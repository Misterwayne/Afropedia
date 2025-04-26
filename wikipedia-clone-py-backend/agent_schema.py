      
# agent_schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List

# Schema for the data we expect back from the LLM for a book
class BookOutput(BaseModel):
    title: str = Field(description="The exact title of the book.")
    author: str = Field(description="The full name of the primary author.")
    publication_year: Optional[int] = Field(description="The 4-digit year the book was first published.", default=None)
    description: str = Field(description="A concise, objective summary of the book's plot or content (2-4 sentences).")
    isbn: Optional[str] = Field(description="The 10 or 13 digit ISBN, if commonly known. Include hyphens.", default=None)
    # Note: Getting reliable cover URLs from LLMs can be hit-or-miss
    # cover_image_url: Optional[str] = Field(description="A publicly accessible URL for a relevant cover image, if available.", default=None)

# Schema for the data we expect back from the LLM for an article
class ArticleOutput(BaseModel):
    title: str = Field(description="An appropriate and concise title for the article based on the topic.")
    # Request well-structured Markdown content
    content: str = Field(description="Well-structured Markdown content for the article body, including headings, paragraphs, lists, etc. Ensure the information is accurate, neutral, and encyclopedic in tone. Include Wikilinks like [[Relevant Topic]] where appropriate.")
    # NEW: Add a list for sources
    sources: List[str] = Field(description="A list of URLs for reliable sources used to verify the information presented in the content.", default=[])
    