#!/usr/bin/env python3
"""
Supabase Database Population Script for Afropedia WikiClone
This script populates the Supabase database with sample data for all entities.
"""

import asyncio
import random
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from config import settings

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
        "published_date": "1958-01-01",
        "isbn": "978-0385474542",
        "genre": "Fiction",
        "summary": "A novel about the life of Okonkwo, a leader and local wrestling champion in Umuofia, one of a fictional group of nine villages in Nigeria, inhabited by the Igbo people."
    },
    {
        "title": "Half of a Yellow Sun",
        "author": "Chimamanda Ngozi Adichie",
        "published_date": "2006-01-01",
        "isbn": "978-1400044160",
        "genre": "Historical Fiction",
        "summary": "A novel about the Biafran War in Nigeria, told through the perspectives of three characters."
    },
    {
        "title": "The Souls of Black Folk",
        "author": "W.E.B. Du Bois",
        "published_date": "1903-01-01",
        "isbn": "978-0486280417",
        "genre": "Non-fiction",
        "summary": "A collection of essays on race, culture, and society in America at the turn of the 20th century."
    },
    {
        "title": "Beloved",
        "author": "Toni Morrison",
        "published_date": "1987-01-01",
        "isbn": "978-1400033416",
        "genre": "Fiction",
        "summary": "A novel about a former slave who is haunted by the ghost of her daughter."
    },
    {
        "title": "The Color Purple",
        "author": "Alice Walker",
        "published_date": "1982-01-01",
        "isbn": "978-0151191543",
        "genre": "Fiction",
        "summary": "An epistolary novel about the life of Celie, a young African American woman living in the South."
    },
    {
        "title": "Roots: The Saga of an American Family",
        "author": "Alex Haley",
        "published_date": "1976-01-01",
        "isbn": "978-0440174646",
        "genre": "Historical Fiction",
        "summary": "A novel that traces the author's family history from Africa to America."
    }
]

SAMPLE_MUSIC = [
    {
        "title": "Water No Get Enemy",
        "artist": "Fela Kuti",
        "album": "Expensive Shit"
    },
    {
        "title": "Pata Pata",
        "artist": "Miriam Makeba",
        "album": "Pata Pata"
    },
    {
        "title": "Madan",
        "artist": "Salif Keita",
        "album": "Moffou"
    },
    {
        "title": "7 Seconds",
        "artist": "Youssou N'Dour",
        "album": "The Guide (Wommat)"
    },
    {
        "title": "Agolo",
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

class SupabasePopulator:
    def __init__(self):
        self.users = []
        self.articles = []
        self.books = []
        self.music_metadata = []
        self.video_metadata = []
        self.image_metadata = []

    def create_users(self):
        """Create sample users in Supabase"""
        print("Creating users...")
        for user_data in SAMPLE_USERS:
            try:
                # Check if user already exists
                existing_users = supabase.table("user").select("username").eq("username", user_data["username"]).execute()
                if existing_users.data:
                    print(f"User {user_data['username']} already exists, skipping...")
                    # Get the existing user
                    user = supabase.table("user").select("*").eq("username", user_data["username"]).execute()
                    self.users.append(user.data[0])
                    continue

                # Create user
                user_response = supabase.table("user").insert({
                    "username": user_data["username"],
                    "email": user_data["email"],
                    "hashed_password": user_data["password"]  # In real app, this should be hashed
                }).execute()
                
                if user_response.data:
                    self.users.append(user_response.data[0])
                    print(f"Created user: {user_data['username']}")
                else:
                    print(f"Failed to create user: {user_data['username']}")
                    
            except Exception as e:
                print(f"Error creating user {user_data['username']}: {e}")

    def create_articles(self):
        """Create sample articles with revisions and comments"""
        print("Creating articles...")
        for article_data in SAMPLE_ARTICLES:
            try:
                # Check if article already exists
                existing_articles = supabase.table("article").select("title").eq("title", article_data["title"]).execute()
                if existing_articles.data:
                    print(f"Article {article_data['title']} already exists, skipping...")
                    # Get the existing article
                    article = supabase.table("article").select("*").eq("title", article_data["title"]).execute()
                    self.articles.append(article.data[0])
                    continue

                # Create article
                article_response = supabase.table("article").insert({
                    "title": article_data["title"],
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }).execute()
                
                if article_response.data:
                    article = article_response.data[0]
                    self.articles.append(article)
                    print(f"Created article: {article['title']}")
                    
                    # Create revision
                    author = random.choice(self.users)
                    revision_response = supabase.table("revision").insert({
                        "content": article_data["content"],
                        "comment": article_data["comment"],
                        "article_id": article["id"],
                        "user_id": author["id"],
                        "timestamp": datetime.utcnow().isoformat()
                    }).execute()
                    
                    if revision_response.data:
                        revision = revision_response.data[0]
                        
                        # Update article with current revision
                        supabase.table("article").update({
                            "current_revision_id": revision["id"]
                        }).eq("id", article["id"]).execute()
                        
                        # Add comments to the revision
                        self.add_comments_to_revision(revision["id"])
                        
            except Exception as e:
                print(f"Error creating article {article_data['title']}: {e}")

    def add_comments_to_revision(self, revision_id):
        """Add sample comments to a revision"""
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

        # Add 2-4 random comments
        num_comments = random.randint(2, 4)
        for _ in range(num_comments):
            comment_text = random.choice(comment_texts)
            comment_author = random.choice(self.users)
            
            try:
                supabase.table("comment").insert({
                    "content": comment_text,
                    "revision_id": revision_id,
                    "user_id": comment_author["id"],
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
            except Exception as e:
                print(f"Error adding comment: {e}")

    def create_books(self):
        """Create sample books"""
        print("Creating books...")
        for book_data in SAMPLE_BOOKS:
            try:
                # Check if book already exists
                existing_books = supabase.table("book").select("title").eq("title", book_data["title"]).execute()
                if existing_books.data:
                    print(f"Book {book_data['title']} already exists, skipping...")
                    # Get the existing book
                    book = supabase.table("book").select("*").eq("title", book_data["title"]).execute()
                    self.books.append(book.data[0])
                    continue

                book_response = supabase.table("book").insert({
                    "title": book_data["title"],
                    "author": book_data["author"],
                    "published_date": book_data["published_date"],
                    "isbn": book_data["isbn"],
                    "genre": book_data["genre"],
                    "summary": book_data["summary"],
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }).execute()
                
                if book_response.data:
                    self.books.append(book_response.data[0])
                    print(f"Created book: {book_data['title']} by {book_data['author']}")
                    
            except Exception as e:
                print(f"Error creating book {book_data['title']}: {e}")

    def create_music_metadata(self):
        """Create sample music metadata"""
        print("Creating music metadata...")
        for music_data in SAMPLE_MUSIC:
            try:
                # Create music content first
                dummy_audio_data = "dummy_audio_data_" + music_data["title"][:50]
                content_response = supabase.table("music_content").insert({
                    "binary_data": dummy_audio_data
                }).execute()
                
                if content_response.data:
                    content_id = content_response.data[0]["id"]
                    
                    # Create music metadata
                    dummy_cover = "dummy_cover_image_" + music_data["title"][:30]
                    metadata_response = supabase.table("music_metadata").insert({
                        "title": music_data["title"],
                        "artist": music_data["artist"],
                        "album": music_data["album"],
                        "content_id": content_id,
                        "cover_image": dummy_cover
                    }).execute()
                    
                    if metadata_response.data:
                        self.music_metadata.append(metadata_response.data[0])
                        print(f"Created music: {music_data['title']} by {music_data['artist']}")
                        
            except Exception as e:
                print(f"Error creating music {music_data['title']}: {e}")

    def create_video_metadata(self):
        """Create sample video metadata"""
        print("Creating video metadata...")
        for video_data in SAMPLE_VIDEOS:
            try:
                # Create video content first
                dummy_video_data = "dummy_video_data_" + video_data["filename"]
                content_response = supabase.table("video_content").insert({
                    "binary_data": dummy_video_data
                }).execute()
                
                if content_response.data:
                    content_id = content_response.data[0]["id"]
                    
                    # Create video metadata
                    metadata_response = supabase.table("videos").insert({
                        "filename": video_data["filename"],
                        "timestamp": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat(),
                        "content_id": content_id,
                        "user": video_data["user"]
                    }).execute()
                    
                    if metadata_response.data:
                        self.video_metadata.append(metadata_response.data[0])
                        print(f"Created video: {video_data['filename']}")
                        
            except Exception as e:
                print(f"Error creating video {video_data['filename']}: {e}")

    def create_image_metadata(self):
        """Create sample image metadata"""
        print("Creating image metadata...")
        for image_data in SAMPLE_IMAGES:
            try:
                # Create image content first
                dummy_image_data = "dummy_image_data_" + image_data["original_filename"]
                content_response = supabase.table("image_content").insert({
                    "binary_data": dummy_image_data
                }).execute()
                
                if content_response.data:
                    content_id = content_response.data[0]["id"]
                    
                    # Create image metadata
                    metadata_response = supabase.table("image_metadata").insert({
                        "original_filename": image_data["original_filename"],
                        "content_type": image_data["content_type"],
                        "content_id": content_id,
                        "size_bytes": image_data["size_bytes"],
                        "uploaded_at": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat()
                    }).execute()
                    
                    if metadata_response.data:
                        self.image_metadata.append(metadata_response.data[0])
                        print(f"Created image: {image_data['original_filename']}")
                        
            except Exception as e:
                print(f"Error creating image {image_data['original_filename']}: {e}")

    def populate_database(self):
        """Main method to populate the database"""
        print("Starting Supabase database population...")
        print(f"Supabase URL: {settings.supabase_url}")
        
        try:
            # Create all entities
            self.create_users()
            self.create_articles()
            self.create_books()
            self.create_music_metadata()
            self.create_video_metadata()
            self.create_image_metadata()
            
            print("\n" + "="*50)
            print("SUPABASE DATABASE POPULATION COMPLETED SUCCESSFULLY!")
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
            raise

def main():
    """Main function to run the database population"""
    populator = SupabasePopulator()
    populator.populate_database()

if __name__ == "__main__":
    print("Afropedia Supabase Database Population Script")
    print("This script will populate the Supabase database with sample data.")
    print("Make sure your Supabase credentials are configured in .env")
    print()
    
    # Run the population
    main()
