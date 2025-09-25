#!/usr/bin/env python3
"""
Database Population Script for Afropedia WikiClone
This script populates the database with sample data for all entities.
"""

import asyncio
import random
from datetime import datetime, timedelta
from typing import List, Optional
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import (
    User, UserCreate, Article, ArticleCreate, Revision, Comment,
    Book, BookCreate, MusicMetadata, MusicContent, MusicMetadataCreate,
    VideoMetadata, VideoContent, ImageMetadata, ImageContent
)
from database import get_session
from auth.security import get_password_hash
from crud import user_crud, article_crud, book_crud, music_crud

# Sample data
SAMPLE_USERS = [
    {"username": "admin", "email": "admin@afropedia.com", "password": "admin123"},
    {"username": "editor1", "email": "editor1@afropedia.com", "password": "editor123"},
    {"username": "editor2", "email": "editor2@afropedia.com", "password": "editor123"},
    {"username": "contributor1", "email": "contributor1@afropedia.com", "password": "contrib123"},
    {"username": "contributor2", "email": "contributor2@afropedia.com", "password": "contrib123"},
    {"username": "reader1", "email": "reader1@afropedia.com", "password": "reader123"},
]

SAMPLE_ARTICLES = [
    {
        "title": "Ancient_Egyptian_Civilization",
        "content": """
# Ancient Egyptian Civilization

Ancient Egypt was a civilization in ancient Northeast Africa, concentrated along the lower reaches of the Nile River. The civilization coalesced around 3100 BC with the political unification of Upper and Lower Egypt under Menes.

## History

### Early Dynastic Period (c. 3100–2686 BC)
The Early Dynastic Period began with the unification of Egypt by the first pharaoh, traditionally identified as Menes. This period saw the establishment of the basic institutions of Egyptian civilization.

### Old Kingdom (c. 2686–2181 BC)
The Old Kingdom is often referred to as the "Age of the Pyramids" because it was during this time that the most famous pyramids were built, including the Great Pyramid of Giza.

### Middle Kingdom (c. 2055–1650 BC)
The Middle Kingdom was a period of reunification and cultural renaissance. It saw the development of new literary forms and artistic styles.

### New Kingdom (c. 1550–1069 BC)
The New Kingdom was Egypt's most prosperous time and marked the peak of its power. It included the reigns of famous pharaohs like Hatshepsut, Thutmose III, Akhenaten, and Ramesses II.

## Culture and Society

### Religion
Ancient Egyptian religion was a complex system of polytheistic beliefs and rituals. The Egyptians believed in an afterlife and developed elaborate burial practices.

### Art and Architecture
Egyptian art is characterized by its distinctive style, including the use of hieroglyphs, stylized human figures, and symbolic representations.

### Writing
The ancient Egyptians developed one of the earliest writing systems, hieroglyphs, which combined logographic and alphabetic elements.
        """,
        "comment": "Initial article creation about Ancient Egyptian Civilization"
    },
    {
        "title": "Mansa_Musa",
        "content": """
# Mansa Musa

Mansa Musa (c. 1280 – c. 1337) was the ninth Mansa of the Mali Empire, which reached its territorial peak during his reign. He is often regarded as the wealthiest person in history.

## Early Life and Rise to Power

Mansa Musa was born around 1280 in the Mali Empire. He came to power in 1312 after the previous ruler, Abu-Bakr II, disappeared during an expedition across the Atlantic Ocean.

## Reign and Achievements

### Economic Prosperity
Under Mansa Musa's rule, the Mali Empire became one of the wealthiest empires in the world, primarily due to its control over gold and salt trade routes.

### Hajj Pilgrimage
In 1324, Mansa Musa embarked on a famous pilgrimage to Mecca. His journey was so extravagant that it affected the economies of the regions he passed through.

### Cultural and Educational Development
Mansa Musa was a patron of learning and culture. He established the University of Sankore in Timbuktu, which became a center of Islamic learning.

## Legacy

Mansa Musa's reign marked the height of the Mali Empire's power and influence. His pilgrimage to Mecca brought the Mali Empire to the attention of the wider Islamic world and beyond.
        """,
        "comment": "Comprehensive article about Mansa Musa, the wealthiest person in history"
    },
    {
        "title": "Timbuktu",
        "content": """
# Timbuktu

Timbuktu is a city in Mali, situated 20 km north of the Niger River. The town is the capital of the Timbuktu Region, one of the eight administrative regions of Mali.

## History

### Foundation and Early History
Timbuktu was founded around 1100 CE as a seasonal camp by Tuareg nomads. It became a permanent settlement and grew into a major trading center.

### Golden Age (14th-16th centuries)
During the 14th to 16th centuries, Timbuktu was a major center of Islamic learning and trade. The city was home to the University of Sankore and other madrasas.

### European Exploration
Timbuktu became a legendary city in European imagination, often used as a metaphor for a distant, mysterious place.

## Culture and Education

### Islamic Learning
Timbuktu was a center of Islamic scholarship, with thousands of students studying at its universities and madrasas.

### Manuscripts
The city is famous for its collection of ancient manuscripts, many of which are preserved in private libraries and institutions.

## Modern Timbuktu

Today, Timbuktu is a UNESCO World Heritage Site and continues to be an important cultural and historical center in Mali.
        """,
        "comment": "Historical overview of the legendary city of Timbuktu"
    },
    {
        "title": "African_Music_Traditions",
        "content": """
# African Music Traditions

African music traditions are diverse and rich, reflecting the continent's cultural diversity and long history.

## Traditional Instruments

### Drums
Drums are central to African music, with various types including:
- Djembe
- Talking drums
- Bata drums
- Congas

### String Instruments
- Kora (West African harp)
- Ngoni (Malian lute)
- Mbira (thumb piano)

### Wind Instruments
- Flutes made from bamboo or wood
- Trumpets and horns
- Ocarinas

## Regional Styles

### West Africa
West African music is characterized by complex polyrhythms and the use of traditional instruments like the kora and djembe.

### East Africa
East African music often features vocal harmonies and the use of instruments like the mbira and various drums.

### Southern Africa
Southern African music includes styles like mbaqanga, kwaito, and traditional Zulu music.

## Modern Influence

African music has had a profound influence on global music, particularly in genres like jazz, blues, rock, and hip-hop.
        """,
        "comment": "Overview of traditional and modern African music traditions"
    },
    {
        "title": "Nelson_Mandela",
        "content": """
# Nelson Mandela

Nelson Rolihlahla Mandela (18 July 1918 – 5 December 2013) was a South African anti-apartheid revolutionary, political leader, and philanthropist who served as President of South Africa from 1994 to 1999.

## Early Life

Mandela was born in Mvezo, South Africa, into the Thembu royal family. He studied law at the University of Fort Hare and the University of Witwatersrand.

## Political Activism

### African National Congress
Mandela joined the African National Congress (ANC) in 1944 and became increasingly involved in the anti-apartheid movement.

### Imprisonment
In 1962, Mandela was arrested and sentenced to life imprisonment for his role in the anti-apartheid struggle. He spent 27 years in prison, mostly on Robben Island.

## Presidency and Legacy

### First Black President
After his release in 1990, Mandela led negotiations to end apartheid and became South Africa's first black president in 1994.

### Truth and Reconciliation
Mandela established the Truth and Reconciliation Commission to address the crimes of apartheid.

### Global Impact
Mandela became a global symbol of resistance to oppression and a champion of human rights.
        """,
        "comment": "Biography of Nelson Mandela, South African anti-apartheid leader"
    }
]

SAMPLE_BOOKS = [
    {
        "title": "Things Fall Apart",
        "author": "Chinua Achebe",
        "published_date": datetime(1958, 1, 1),
        "isbn": "978-0385474542",
        "genre": "Fiction",
        "summary": "A novel about the life of Okonkwo, a leader and local wrestling champion in Umuofia, one of a fictional group of nine villages in Nigeria, inhabited by the Igbo people."
    },
    {
        "title": "Half of a Yellow Sun",
        "author": "Chimamanda Ngozi Adichie",
        "published_date": datetime(2006, 1, 1),
        "isbn": "978-1400044160",
        "genre": "Historical Fiction",
        "summary": "A novel about the Biafran War in Nigeria, told through the perspectives of three characters."
    },
    {
        "title": "The Souls of Black Folk",
        "author": "W.E.B. Du Bois",
        "published_date": datetime(1903, 1, 1),
        "isbn": "978-0486280417",
        "genre": "Non-fiction",
        "summary": "A collection of essays on race, culture, and society in America at the turn of the 20th century."
    },
    {
        "title": "Beloved",
        "author": "Toni Morrison",
        "published_date": datetime(1987, 1, 1),
        "isbn": "978-1400033416",
        "genre": "Fiction",
        "summary": "A novel about a former slave who is haunted by the ghost of her daughter."
    },
    {
        "title": "The Color Purple",
        "author": "Alice Walker",
        "published_date": datetime(1982, 1, 1),
        "isbn": "978-0151191543",
        "genre": "Fiction",
        "summary": "An epistolary novel about the life of Celie, a young African American woman living in the South."
    },
    {
        "title": "Roots: The Saga of an American Family",
        "author": "Alex Haley",
        "published_date": datetime(1976, 1, 1),
        "isbn": "978-0440174646",
        "genre": "Historical Fiction",
        "summary": "A novel that traces the author's family history from Africa to America."
    }
]

SAMPLE_MUSIC = [
    {
        "title": "Fela Kuti - Water No Get Enemy",
        "artist": "Fela Kuti",
        "album": "Expensive Shit"
    },
    {
        "title": "Miriam Makeba - Pata Pata",
        "artist": "Miriam Makeba",
        "album": "Pata Pata"
    },
    {
        "title": "Salif Keita - Madan",
        "artist": "Salif Keita",
        "album": "Moffou"
    },
    {
        "title": "Youssou N'Dour - 7 Seconds",
        "artist": "Youssou N'Dour",
        "album": "The Guide (Wommat)"
    },
    {
        "title": "Angelique Kidjo - Agolo",
        "artist": "Angelique Kidjo",
        "album": "Aye"
    }
]

SAMPLE_VIDEOS = [
    {"filename": "african_dance_tradition.mp4", "user": "admin"},
    {"filename": "timbuktu_manuscripts.mp4", "user": "editor1"},
    {"filename": "kora_music_performance.mp4", "user": "contributor1"},
    {"filename": "nelson_mandela_speech.mp4", "user": "admin"},
    {"filename": "african_art_history.mp4", "user": "editor2"}
]

SAMPLE_IMAGES = [
    {"original_filename": "pyramids_of_giza.jpg", "content_type": "image/jpeg", "size_bytes": 2048576},
    {"original_filename": "timbuktu_mosque.jpg", "content_type": "image/jpeg", "size_bytes": 1536000},
    {"original_filename": "kora_instrument.jpg", "content_type": "image/jpeg", "size_bytes": 1024000},
    {"original_filename": "nelson_mandela_portrait.jpg", "content_type": "image/jpeg", "size_bytes": 1800000},
    {"original_filename": "african_masks.jpg", "content_type": "image/jpeg", "size_bytes": 2200000}
]

class DatabasePopulator:
    def __init__(self):
        self.users = []
        self.articles = []
        self.books = []
        self.music_metadata = []
        self.video_metadata = []
        self.image_metadata = []

    async def create_users(self, session):
        """Create sample users"""
        print("Creating users...")
        for user_data in SAMPLE_USERS:
            # Check if user already exists
            existing_user = await user_crud.get_user_by_username(session, user_data["username"])
            if existing_user:
                print(f"User {user_data['username']} already exists, skipping...")
                self.users.append(existing_user)
                continue

            user_create = UserCreate(
                username=user_data["username"],
                email=user_data["email"],
                password=user_data["password"]
            )
            user = await user_crud.create_user(session, user_in=user_create)
            self.users.append(user)
            print(f"Created user: {user.username}")

    async def create_articles(self, session):
        """Create sample articles with revisions and comments"""
        print("Creating articles...")
        for article_data in SAMPLE_ARTICLES:
            # Check if article already exists
            existing_article = await article_crud.get_article_by_title(session, article_data["title"])
            if existing_article:
                print(f"Article {article_data['title']} already exists, skipping...")
                self.articles.append(existing_article)
                continue

            # Create article
            article_create = ArticleCreate(
                title=article_data["title"],
                content=article_data["content"],
                comment=article_data["comment"]
            )
            
            # Use a random user as the author
            author = random.choice(self.users)
            article = await article_crud.create_article_with_revision(
                session, article_in=article_create, user_id=author.id
            )
            
            if article:
                self.articles.append(article)
                print(f"Created article: {article.title}")
                
                # Add some comments to the revision
                await self.add_comments_to_article(session, article)

    async def add_comments_to_article(self, session, article):
        """Add sample comments to an article's current revision"""
        if not article.currentRevision:
            return

        # Add 2-4 random comments
        num_comments = random.randint(2, 4)
        comment_texts = [
            "Great article! Very informative.",
            "This is exactly what I was looking for.",
            "Could you add more details about the cultural aspects?",
            "Excellent historical overview.",
            "Thank you for sharing this knowledge.",
            "I learned something new today!",
            "This needs more references.",
            "Amazing work on this article."
        ]

        for _ in range(num_comments):
            comment_text = random.choice(comment_texts)
            comment_author = random.choice(self.users)
            
            comment = Comment(
                content=comment_text,
                revision_id=article.currentRevision.id,
                user_id=comment_author.id
            )
            session.add(comment)
        
        await session.commit()

    async def create_books(self, session):
        """Create sample books"""
        print("Creating books...")
        for book_data in SAMPLE_BOOKS:
            # Check if book already exists
            existing_book = await book_crud.get_book_by_title(session, book_data["title"])
            if existing_book:
                print(f"Book {book_data['title']} already exists, skipping...")
                self.books.append(existing_book)
                continue

            book_create = BookCreate(**book_data)
            book = await book_crud.create_book(session, book_in=book_create)
            self.books.append(book)
            print(f"Created book: {book.title} by {book.author}")

    async def create_music_metadata(self, session):
        """Create sample music metadata"""
        print("Creating music metadata...")
        for music_data in SAMPLE_MUSIC:
            # Create dummy binary data (in real scenario, this would be actual audio file)
            dummy_audio_data = b"dummy_audio_data_" + music_data["title"].encode()[:50]
            
            # Create music content first
            music_content = MusicContent(binary_data=dummy_audio_data)
            session.add(music_content)
            await session.flush()
            
            # Create music metadata
            music_metadata_create = MusicMetadataCreate(
                title=music_data["title"],
                artist=music_data["artist"],
                album=music_data["album"]
            )
            
            # Create dummy cover image
            dummy_cover = b"dummy_cover_image_" + music_data["title"].encode()[:30]
            
            music_metadata = await music_crud.create_music_metadata(
                session, 
                metadata_in=music_metadata_create,
                content_id=music_content.id,
                cover_image=dummy_cover
            )
            
            self.music_metadata.append(music_metadata)
            print(f"Created music: {music_metadata.title} by {music_metadata.artist}")

    async def create_video_metadata(self, session):
        """Create sample video metadata"""
        print("Creating video metadata...")
        for video_data in SAMPLE_VIDEOS:
            # Create dummy binary data
            dummy_video_data = b"dummy_video_data_" + video_data["filename"].encode()
            
            # Create video content first
            video_content = VideoContent(binary_data=dummy_video_data)
            session.add(video_content)
            await session.flush()
            
            # Create video metadata
            video_metadata = VideoMetadata(
                filename=video_data["filename"],
                timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 365)),
                content_id=video_content.id,
                user=video_data["user"]
            )
            session.add(video_metadata)
            self.video_metadata.append(video_metadata)
            print(f"Created video: {video_metadata.filename}")

    async def create_image_metadata(self, session):
        """Create sample image metadata"""
        print("Creating image metadata...")
        for image_data in SAMPLE_IMAGES:
            # Create dummy binary data
            dummy_image_data = b"dummy_image_data_" + image_data["original_filename"].encode()
            
            # Create image content first
            image_content = ImageContent(binary_data=dummy_image_data)
            session.add(image_content)
            await session.flush()
            
            # Create image metadata
            image_metadata = ImageMetadata(
                original_filename=image_data["original_filename"],
                content_type=image_data["content_type"],
                content_id=image_content.id,
                size_bytes=image_data["size_bytes"],
                uploaded_at=datetime.utcnow() - timedelta(days=random.randint(1, 365))
            )
            session.add(image_metadata)
            self.image_metadata.append(image_metadata)
            print(f"Created image: {image_metadata.original_filename}")

    async def populate_database(self):
        """Main method to populate the database"""
        print("Starting database population...")
        
        async with get_session() as session:
            try:
                # Create all entities
                await self.create_users(session)
                await self.create_articles(session)
                await self.create_books(session)
                await self.create_music_metadata(session)
                await self.create_video_metadata(session)
                await self.create_image_metadata(session)
                
                # Commit all changes
                await session.commit()
                
                print("\n" + "="*50)
                print("DATABASE POPULATION COMPLETED SUCCESSFULLY!")
                print("="*50)
                print(f"Created {len(self.users)} users")
                print(f"Created {len(self.articles)} articles")
                print(f"Created {len(self.books)} books")
                print(f"Created {len(self.music_metadata)} music entries")
                print(f"Created {len(self.video_metadata)} video entries")
                print(f"Created {len(self.image_metadata)} image entries")
                print("="*50)
                
            except Exception as e:
                print(f"Error during database population: {e}")
                await session.rollback()
                raise

async def main():
    """Main function to run the database population"""
    populator = DatabasePopulator()
    await populator.populate_database()

if __name__ == "__main__":
    print("Afropedia Database Population Script")
    print("This script will populate the database with sample data.")
    print("Make sure your database is running and accessible.")
    print()
    
    # Run the population
    asyncio.run(main())
